import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

const cancelBookingSchema = z.object({
  id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError || !authData.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nie jesteś zalogowany.',
    })
  }

  const result = await readValidatedBody(event, (body) => cancelBookingSchema.safeParse(body))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Niepoprawny identyfikator rezerwacji.',
      data: result.error.format(),
    })
  }

  const { id } = result.data

  const { data, error } = await client
    .from('bb_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', authData.user.id)
    .neq('status', 'cancelled')
    .select('id')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  if (!data || data.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Nie znaleziono aktywnej rezerwacji do odwołania.',
    })
  }

  return { success: true }
})