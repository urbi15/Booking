<script setup lang="ts">
const { booking } = useBookingState()

// Obliczamy czas zakończenia używając naszego nowego, globalnego helpera!
const formattedTimeRange = computed(() => {
  if (!booking.value.startTime || !booking.value.service) return booking.value.startTime

  // Czysto, krótko i bez duplikowania logiki
  const endTime = calculateEndTime(booking.value.startTime, booking.value.service.duration_minutes)

  return `${booking.value.startTime} — ${endTime}`
})
</script>

<template>
  <div class="space-y-6 max-w-lg mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-black text-zinc-900 uppercase tracking-wider">
        Twoje dane
      </h2>
      <p class="text-zinc-500 mt-1">
        Potrzebujemy ich, aby potwierdzić Twoją wizytę.
      </p>
    </div>

    <div class="space-y-4">
      <UFormField
        label="Imię i Nazwisko"
        required
      >
        <UInput
          v-model="booking.customerName"
          placeholder="np. Jan Kowalski"
          size="lg"
          color="neutral"
          variant="outline"
          :ui="{ base: 'rounded-none' }"
        />
      </UFormField>

      <UFormField
        label="Adres E-mail"
        required
      >
        <UInput
          v-model="booking.customerEmail"
          type="email"
          placeholder="twoj@email.pl"
          size="lg"
          color="neutral"
          variant="outline"
          :ui="{ base: 'rounded-none' }"
        />
      </UFormField>

      <UFormField
        label="Numer telefonu"
        required
      >
        <UInput
          v-model="booking.customerPhone"
          type="tel"
          placeholder="123 456 789"
          size="lg"
          color="neutral"
          variant="outline"
          :ui="{ base: 'rounded-none' }"
        />
      </UFormField>

      <UFormField label="Dodatkowe uwagi (opcjonalnie)">
        <UTextarea
          v-model="booking.notes"
          placeholder="Np. alergie, specjalne życzenia..."
          size="lg"
          color="neutral"
          variant="outline"
          :rows="3"
          :ui="{ base: 'rounded-none' }"
        />
      </UFormField>
    </div>

    <div class="mt-8 p-4 bg-zinc-50 border border-zinc-100 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-calendar-check"
          class="w-8 h-8 text-primary-500"
        />
        <div class="flex flex-col text-left">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Termin wizyty</span>
          <ClientOnly>
            <span class="text-sm font-black text-zinc-900 mt-1 italic">
              {{ booking.date ? new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' }).format(booking.date) : '' }},
              {{ formattedTimeRange }}
            </span>
          </ClientOnly>
        </div>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-bold text-zinc-400 uppercase block leading-none">Usługa</span>
        <span class="text-sm font-black text-primary-600 mt-1 block uppercase">{{ booking.service?.name }}</span>
      </div>
    </div>
  </div>
</template>