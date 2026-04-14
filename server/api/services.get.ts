import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  // Pobieramy klienta Supabase po stronie serwera
  const client = await serverSupabaseClient<Database>(event)

  // Wykonujemy zapytanie do bazy (ukryte przed okiem przeglądarki)
  const { data, error } = await client
    .from('bb_services')
    .select('id, name, duration_minutes, price')
    .order('name', { ascending: true }) // Od razu sortujemy alfabetycznie

  if (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Nie udało się pobrać listy usług.' 
    })
  }

  // Zwracamy czyste dane
  return data
})