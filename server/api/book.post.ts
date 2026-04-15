import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestIP } from 'h3'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { calculateEndTime } from '~/utils/time'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 8

type RateLimitRecord = {
  count: number
  resetAt: number
}

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  customer_name: z.string().min(2).max(50),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7).max(15).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

const enforceBookingRateLimit = async (event: H3Event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `rate-limit:book:${ip}`
  const storage = useStorage('cache')

  const now = Date.now()
  const current = await storage.getItem<RateLimitRecord>(key)

  if (!current || current.resetAt <= now) {
    await storage.setItem(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Zbyt wiele prób rezerwacji. Spróbuj ponownie za kilka minut.',
    })
  }

  await storage.setItem(key, {
    count: current.count + 1,
    resetAt: current.resetAt,
  })
}

export default defineEventHandler(async (event) => {
  await enforceBookingRateLimit(event)

  const authClient = await serverSupabaseClient<Database>(event)
  const serviceClient = serverSupabaseServiceRole<Database>(event)
  
  const result = await readValidatedBody(event, (body) => bookingSchema.safeParse(body))

  if (!result.success) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Niepoprawny format danych rezerwacji.',
      data: result.error.format()
    })
  }

  const {
    service_id,
    booking_date,
    start_time,
    customer_name,
    customer_email,
    customer_phone,
    notes,
  } = result.data

  const { data: authData, error: authError } = await authClient.auth.getUser()
  const currentUserId = authData?.user?.id || null

  const { data: service, error: serviceError } = await serviceClient
    .from('bb_services')
    .select('duration_minutes')
    .eq('id', service_id)
    .single()

  if (serviceError) {
    throw createError({
      statusCode: 500,
      statusMessage: serviceError.message,
    })
  }

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usługa nie istnieje.',
    })
  }

  const end_time = calculateEndTime(start_time, service.duration_minutes)

  const { data: conflictingBooking, error: conflictError } = await serviceClient
    .from('bb_bookings')
    .select('id')
    .eq('booking_date', booking_date)
    .neq('status', 'cancelled')
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .limit(1)
    .maybeSingle()

  if (conflictError) {
    throw createError({
      statusCode: 500,
      statusMessage: conflictError.message,
    })
  }

  if (conflictingBooking) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Wybrany termin koliduje z inną rezerwacją.',
    })
  }

  const { data, error } = await serviceClient
    .from('bb_bookings')
    .insert({
      service_id,
      booking_date,
      start_time,
      end_time,
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
      notes: notes ?? null,
      status: 'pending',
      user_id: currentUserId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23P01' || error.code === '23P04' || error.code === '23505') {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Niestety, ktoś ułamek sekundy temu zajął ten termin.' 
      })
    }

    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, booking: data }
})