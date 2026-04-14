<script setup lang="ts">
import type { Database } from '~/types/database.types'
import { z } from 'zod'

const { booking, resetBooking } = useBookingState()
const user = useSupabaseUser() 
const toast = useToast()

const currentStep = ref(1)
const totalSteps = 4
const isSubmitting = ref(false)
const isSuccess = ref(false) 

const nextStep = () => { currentStep.value++ }
const prevStep = () => { currentStep.value-- }
const progressWidth = computed(() => `${(currentStep.value / totalSteps) * 100}%`)

const isNextDisabled = computed(() => {
  if (currentStep.value === 1) return !booking.value.service
  if (currentStep.value === 2) return !booking.value.date || !booking.value.startTime
  if (currentStep.value === 3) return !booking.value.customerName || !booking.value.customerEmail
  return false
})

const step3Schema = z.object({
  customerName: z.string().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki.'),
  customerEmail: z.string().email('Podaj poprawny adres e-mail.'),
  customerPhone: z.string()
    .min(7, 'Numer telefonu jest za krótki.')
    .max(15, 'Numer telefonu jest za długi.')
    .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'Niepoprawny format numeru telefonu.')
    .optional()
    .or(z.literal(''))
})

const handleNextClick = () => {
  if (currentStep.value === 3) {
    const result = step3Schema.safeParse({
      customerName: booking.value.customerName,
      customerEmail: booking.value.customerEmail,
      customerPhone: booking.value.customerPhone
    })

    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || 'Sprawdź poprawność danych.'
      toast.add({
        title: 'Popraw dane',
        description: errorMessage,
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return
    }
  }

  nextStep()
}

const handleComplete = async () => {
  if (isSubmitting.value) return
  
  const s = booking.value.service
  const d = booking.value.date
  const st = booking.value.startTime
  if (!s || !d || !st) return

  isSubmitting.value = true

  try {
    const dateString = [
      d.getFullYear(), 
      String(d.getMonth() + 1).padStart(2, '0'), 
      String(d.getDate()).padStart(2, '0')
    ].join('-')

    await $fetch('/api/book', {
      method: 'POST',
      body: {
        service_id: s.id,
        booking_date: dateString,
        start_time: st,
        customer_name: booking.value.customerName,
        customer_email: booking.value.customerEmail,
        customer_phone: booking.value.customerPhone || null,
        notes: booking.value.notes || null,
      }
    })

    isSuccess.value = true
    resetBooking()
  } catch (err: any) {
    const msg = err.data?.statusMessage || 'Wystąpił błąd połączenia z serwerem.'
    
    toast.add({
      title: 'Ups, coś poszło nie tak!',
      description: msg,
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 min-h-[calc(100vh-140px)] flex flex-col">
    <div
      v-if="isSuccess"
      class="grow flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500"
    >
      <div class="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
        <UIcon
          name="i-lucide-check"
          class="w-12 h-12"
        />
      </div>
      <h2 class="text-3xl font-black text-zinc-900 uppercase italic tracking-tight mb-2">
        Mamy to!
      </h2>
      <p class="text-zinc-500 mb-8 max-w-sm">
        Rezerwacja została zapisana.
      </p>
      <UButton
        label="Wróć do strony głównej"
        color="neutral"
        variant="outline"
        class="uppercase font-bold text-xs tracking-widest rounded-none"
        @click="isSuccess = false; currentStep = 1"
      />
    </div>

    <template v-else>
      <header class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-black text-zinc-900 uppercase tracking-tight italic">
            Barber Booking
          </h1>
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Krok {{ currentStep }} z {{ totalSteps }}</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-100 overflow-hidden">
          <div
            class="h-full bg-primary-500 transition-all duration-500 ease-in-out"
            :style="{ width: progressWidth }"
          />
        </div>
      </header>

      <div class="grow">
        <BookingStepService v-if="currentStep === 1" />
        <BookingStepDate v-else-if="currentStep === 2" />
        <BookingStepDetails v-else-if="currentStep === 3" />
        <BookingStepSummary v-else-if="currentStep === 4" />
      </div>

      <footer class="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center">
        <UButton
          v-if="currentStep > 1"
          label="Wstecz"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="uppercase font-bold text-[10px] tracking-widest rounded-none"
          :disabled="isSubmitting"
          @click="prevStep"
        />
        <div v-else />

        <UButton
          v-if="currentStep < totalSteps"
          label="Dalej"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
          class="uppercase font-bold text-[10px] tracking-widest px-8 rounded-none"
          :disabled="isNextDisabled"
          @click="handleNextClick"
        />
        <UButton
          v-else
          label="Potwierdzam rezerwację"
          color="primary"
          size="lg"
          class="uppercase font-black text-xs tracking-widest px-10 rounded-none"
          icon="i-lucide-check-circle"
          :loading="isSubmitting"
          @click="handleComplete"
        />
      </footer>
    </template>
  </div>
</template>