import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('bb_services')
    .select('id, name, duration_minutes, price')
    .order('name', { ascending: true })

  if (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Nie udało się pobrać listy usług.' 
    })
  }

  return { services: data }
})