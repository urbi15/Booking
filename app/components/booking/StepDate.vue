<script setup lang="ts">
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'

const { booking } = useBookingState()

const bookedRanges = ref<{ start: string, end: string }[]>([])
const loadingSlots = ref(false)

const WORKING_HOURS = { start: 9, end: 18 }

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
const maxDate = new Date(today)
maxDate.setMonth(maxDate.getMonth() + 3)

const availableSlots = computed(() => {
  const slots: string[] = []
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    const h = hour.toString().padStart(2, '0')
    slots.push(`${h}:00`, `${h}:30`)
  }
  return slots
})

const isTimeOccupied = (time: string) => {
  return bookedRanges.value.some((range) => {
    return time >= range.start && time < range.end
  })
}

const isTimePast = (time: string) => {
  if (!booking.value.date) return false

  const selectedDate = new Date(booking.value.date)
  const isToday = selectedDate.getFullYear() === now.getFullYear() &&
                  selectedDate.getMonth() === now.getMonth() &&
                  selectedDate.getDate() === now.getDate()

  if (!isToday) return false

  const [slotHour = 0, slotMinute = 0] = time.split(':').map(Number)
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)
}

const fetchBookedSlots = async (selectedDate: Date) => {
  loadingSlots.value = true

  const dateString = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0')
  ].join('-')

  try {
    const response = await $fetch<{ bookedRanges: { start: string, end: string }[] }>(`/api/booked-slots`, {
      query: { date: dateString },
    })
    bookedRanges.value = response.bookedRanges || []
  }
  catch (err) {
    bookedRanges.value = []
  }
  finally {
    loadingSlots.value = false
  }
}

watch(() => booking.value.date, async (newDate) => {
  if (newDate instanceof Date) {
    booking.value.startTime = null 
    await fetchBookedSlots(newDate)
  }
}, { immediate: true })

const selectTime = (time: string) => {
  if (isTimeOccupied(time) || isTimePast(time)) return
  booking.value.startTime = time
}
</script>

<template>
  <div class="space-y-4">
    <div class="text-center">
      <h2 class="text-xl font-black text-zinc-900 uppercase tracking-wider italic">
        Wybierz termin
      </h2>
    </div>

    <div class="flex justify-center overflow-hidden">
      <ClientOnly>
        <DatePicker
          v-model="booking.date"
          :min-date="today"
          :max-date="maxDate"
          mode="date"
          locale="pl"
          expanded
          borderless
          transparent
          trim-weeks
          color="orange"
          class="max-w-md bg-white"
        />
        <template #fallback>
          <div class="w-full max-w-md h-72 flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-200">
            <p class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              Wczytywanie kalendarza...
            </p>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div
      v-if="booking.date"
      class="space-y-4 border-t border-zinc-100 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div class="text-center">
        <h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Dostępne godziny
        </h3>
      </div>

      <div
        v-if="loadingSlots"
        class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl mx-auto px-2"
      >
        <div
          v-for="i in 12"
          :key="i"
          class="h-10 w-full bg-zinc-50 animate-pulse border border-zinc-100"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl mx-auto px-2 pb-6"
      >
        <button
          v-for="time in availableSlots"
          :key="time"
          type="button"
          :disabled="isTimeOccupied(time) || isTimePast(time)"
          class="py-2.5 px-2 text-xs font-black border transition-all duration-150 uppercase tracking-tighter"
          :class="[
            booking.startTime === time
              ? 'bg-primary-500 border-primary-500 text-white shadow-md z-10 scale-105'
              : (isTimeOccupied(time) || isTimePast(time))
                ? 'bg-zinc-50 border-zinc-100 text-zinc-200 cursor-not-allowed opacity-60'
                : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-900',
          ]"
          @click="selectTime(time)"
        >
          {{ time }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.vc-container) {
  --vc-accent-500: #f59e0b;
  font-family: inherit !important;
  border: none !important;
}

:deep(.vc-header) {
  margin-top: 0;
  padding-bottom: 10px;
}

:deep(.vc-weeks) {
  padding: 0;
}
</style>