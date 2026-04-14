import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const authClient = await serverSupabaseClient<Database>(event)
  const serviceClient = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)

  // DEBUG LOG 2: Co przyszło do API?
  console.log('--- BACKEND API DEBUG ---')
  console.log('Odebrane Body:', body)

  const {
    service_id,
    booking_date,
    start_time,
    customer_name,
    customer_email,
    customer_phone,
    notes,
  } = body

  if (!service_id || !booking_date || !start_time || !customer_name || !customer_email) {
    throw createError({ statusCode: 400, statusMessage: 'Brak wymaganych danych.' })
  }

  const { data: authData, error: authError } = await authClient.auth.getUser()
  if (authError) {
    console.warn('Nie udało się pobrać użytkownika z sesji:', authError.message)
  }
  const currentUserId = authData?.user?.id || null
  console.log('Próba zapisu do bazy z user_id:', currentUserId)

  // Pobieranie usługi
  const { data: service } = await serviceClient
    .from('bb_services')
    .select('duration_minutes')
    .eq('id', service_id)
    .single()

  if (!service) throw createError({ statusCode: 400, statusMessage: 'Usługa nie istnieje.' })

  // Obliczanie czasu
  const [h, m] = start_time.split(':').map(Number)
  const total = (h ?? 0) * 60 + (m ?? 0) + service.duration_minutes
  const end_time = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`

  // Zapis
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
      notes: notes || '',
      status: 'pending',
      user_id: currentUserId,
    })
    .select()
    .single()

  if (error) {
    console.error('BŁĄD SUPABASE INSERT:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  console.log('ZAPISANO POMYŚLNIE. ID rezerwacji:', data.id)

  return { success: true, booking: data }
})
