import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'
import { calculateEndTime } from '~/utils/time'

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  customer_name: z.string().min(2).max(50),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7).max(15).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export default defineEventHandler(async (event) => {
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
    if (error.code === '23P04') {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Niestety, ktoś ułamek sekundy temu zajął ten termin.' 
      })
    }

    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, booking: data }
})