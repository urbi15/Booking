import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event)
  const query = getQuery(event)

  const date = query.date as string
  if (!date) {
    throw createError({ statusCode: 400, statusMessage: 'Brak daty.' })
  }

  try {
    const { data, error } = await client
      .from('bb_bookings')
      .select('start_time, end_time, status')
      .eq('booking_date', date)
      .not('status', 'eq', 'cancelled')

    if (error) throw error
    
    const bookedRanges = data?.map(b => ({
      start: b.start_time.substring(0, 5),
      end: b.end_time ? b.end_time.substring(0, 5) : b.start_time.substring(0, 5),
    })) || []

    return { bookedRanges }
  }
  catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
