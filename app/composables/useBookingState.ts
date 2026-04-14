import type { Database } from '~/types/database.types'

type ServiceRow = Database['public']['Tables']['bb_services']['Row']

interface BookingState {
  service: ServiceRow | null
  date: Date | null
  startTime: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
}

export const useBookingState = () => {
  const booking = useState<BookingState>('booking_data', () => ({
    service: null,
    date: null,
    startTime: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  }))

  const resetBooking = () => {
    booking.value = {
      service: null,
      date: null,
      startTime: null,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    }
  }

  return {
    booking,
    resetBooking,
  }
}
