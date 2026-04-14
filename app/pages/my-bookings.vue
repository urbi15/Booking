<script setup lang="ts">
import type { Database } from '~/types/database.types'

type BookingWithService = Database['public']['Tables']['bb_bookings']['Row'] & {
  bb_services: Database['public']['Tables']['bb_services']['Row'] | null
}

definePageMeta({ middleware: 'auth' })

const toast = useToast()

const { data: bookings, pending, refresh } = await useFetch<BookingWithService[]>('/api/my-bookings')

const getStatusColor = (status: string | null) => {
  const map: Record<string, any> = {
    pending: 'orange',
    confirmed: 'primary',
    cancelled: 'error',
    completed: 'neutral',
  }
  return map[status ?? 'pending'] || 'neutral'
}

const cancelBooking = async (id: string) => {
  if (!confirm('Czy na pewno chcesz odwołać tę wizytę?')) return

  const client = useSupabaseClient()
  const { error } = await client
    .from('bb_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (!error) {
    toast.add({ title: 'Wizyta odwołana', color: 'success' })
    await refresh()
  } else {
    toast.add({ title: 'Błąd', description: error.message, color: 'error' })
  }
}
</script>

<template>
  <div class="py-12 px-4 max-w-4xl mx-auto min-h-screen">
    <div class="mb-12">
      <h1 class="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
        Moje Wizyty
      </h1>
      <p class="text-zinc-500 mt-2 font-medium uppercase text-[10px] tracking-widest">
        Zarządzaj rezerwacjami
      </p>
    </div>

    <div v-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 w-full bg-zinc-100 animate-pulse border border-zinc-200" />
    </div>

    <div v-else-if="!bookings?.length" class="text-center py-20 border-2 border-dashed border-zinc-200">
      <UIcon name="i-lucide-calendar-x" class="w-12 h-12 text-zinc-300 mx-auto mb-4" />
      <p class="text-zinc-500 font-bold uppercase tracking-widest text-sm">Nie masz jeszcze żadnych rezerwacji</p>
      <UButton to="/" variant="link" color="primary" class="mt-4 font-black uppercase text-xs tracking-widest">
        Zarezerwuj pierwszy termin
      </UButton>
    </div>

    <div v-else class="grid gap-6">
      <div
        v-for="item in bookings"
        :key="item.id"
        class="group relative bg-white border border-zinc-200 p-6 transition-all hover:border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div class="flex items-start gap-6">
          <div class="bg-zinc-900 text-white p-3 text-center min-w-20 italic font-black">
            <span class="block text-2xl leading-none">{{ new Date(item.booking_date).getDate() }}</span>
            <span class="text-[10px] uppercase opacity-70">
              {{ new Intl.DateTimeFormat('pl-PL', { month: 'short' }).format(new Date(item.booking_date)) }}
            </span>
          </div>

          <div>
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-lg font-black text-zinc-900 uppercase italic leading-none">
                {{ item.bb_services?.name }}
              </h3>
              <UBadge
                :color="getStatusColor(item.status)"
                variant="subtle"
                size="xs"
                class="uppercase font-black px-2 py-0.5 rounded-none"
              >
                {{ item.status }}
              </UBadge>
            </div>
            <div class="flex flex-col gap-1 text-sm text-zinc-500 font-medium italic">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-4 h-4" />
                {{ item.start_time.substring(0, 5) }} — {{ item.end_time?.substring(0, 5) }}
              </div>
              <div class="flex items-center gap-1 text-primary-600 font-black">
                <UIcon name="i-lucide-banknote" class="w-4 h-4" />
                {{ item.bb_services?.price }} zł
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
          <UButton
            v-if="item.status !== 'cancelled'"
            color="error"
            variant="ghost"
            icon="i-lucide-calendar-x"
            size="sm"
            class="font-black uppercase text-[10px] tracking-widest rounded-none"
            @click="cancelBooking(item.id)"
          >
            Odwołaj
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>