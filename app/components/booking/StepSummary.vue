<script setup lang="ts">
const { booking } = useBookingState()

// Pomocnicze formatowanie daty
const formattedDate = computed(() => {
  if (!booking.value.date) return ''
  return new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(booking.value.date)
})
</script>

<template>
  <div class="space-y-8 max-w-lg mx-auto">
    <div class="text-center">
      <h2 class="text-2xl font-black text-zinc-900 uppercase tracking-wider">
        Podsumowanie
      </h2>
      <p class="text-zinc-500 mt-1">
        Sprawdź, czy wszystko się zgadza przed potwierdzeniem.
      </p>
    </div>

    <div class="border border-zinc-200 divide-y divide-zinc-100 bg-white">
      <div class="p-5 flex justify-between items-start">
        <div class="space-y-1">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Wybrana usługa</span>
          <h3 class="font-black text-zinc-900 uppercase text-lg">
            {{ booking.service?.name }}
          </h3>
          <div class="flex items-center gap-2 text-zinc-500 text-sm">
            <UIcon
              name="i-lucide-clock"
              class="w-4 h-4"
            />
            <span>{{ booking.service?.duration_minutes }} min</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xl font-black text-primary-600">{{ booking.service?.price }} zł</span>
        </div>
      </div>

      <div class="p-5 flex items-center gap-4">
        <div class="w-12 h-12 bg-zinc-50 flex items-center justify-center text-primary-500">
          <UIcon
            name="i-lucide-calendar"
            class="w-6 h-6"
          />
        </div>
        <div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Termin i godzina</span>
          <p class="font-bold text-zinc-900 capitalize">
            {{ formattedDate }}
          </p>
          <p class="font-black text-primary-600">
            Godzina {{ booking.startTime }}
          </p>
        </div>
      </div>

      <div class="p-5 space-y-4">
        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Twoje dane</span>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-[10px] text-zinc-400 uppercase block">Klient</span>
            <p class="text-sm font-bold text-zinc-900">
              {{ booking.customerName }}
            </p>
          </div>
          <div>
            <span class="text-[10px] text-zinc-400 uppercase block">Telefon</span>
            <p class="text-sm font-bold text-zinc-900">
              {{ booking.customerPhone }}
            </p>
          </div>
        </div>

        <div>
          <span class="text-[10px] text-zinc-400 uppercase block">E-mail</span>
          <p class="text-sm font-bold text-zinc-900">
            {{ booking.customerEmail }}
          </p>
        </div>

        <div v-if="booking.notes">
          <span class="text-[10px] text-zinc-400 uppercase block">Uwagi</span>
          <p class="text-sm text-zinc-600 italic">
            „{{ booking.notes }}”
          </p>
        </div>
      </div>
    </div>

    <div class="bg-primary-50 p-4 border-l-4 border-primary-500 flex gap-3">
      <UIcon
        name="i-lucide-info"
        class="w-5 h-5 text-primary-600 shrink-0"
      />
      <p class="text-xs text-primary-800 leading-relaxed">
        Klikając przycisk poniżej, Twoja rezerwacja zostanie zapisana w naszym systemie.
        Otrzymasz wiadomość e-mail z potwierdzeniem.
      </p>
    </div>
  </div>
</template>
