import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  // Pobieramy zalogowanego użytkownika
  const { data: authData, error: authError } = await client.auth.getUser()

  if (authError || !authData.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nie jesteś zalogowany.'
    })
  }

  // Pobieramy rezerwacje użytkownika z powiązanymi usługami
  const { data, error } = await client
    .from('bb_bookings')
    .select(`
      *,
      bb_services(id, name, price, duration_minutes)
    `)
    .eq('user_id', authData.user.id)
    .order('booking_date', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Nie udało się pobrać rezerwacji.'
    })
  }

  return data
})
