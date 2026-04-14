<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Service = Database['public']['Tables']['bb_services']['Row']

const { booking } = useBookingState()

const { data: services, pending } = await useFetch<Service[]>('/api/services')

const handleSelect = (service: Service) => {
  booking.value.service = service
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-black text-zinc-900 uppercase tracking-wider">
        Wybierz usługę
      </h2>
      <p class="text-zinc-500 mt-1">
        Postaw na profesjonalne cięcie.
      </p>
    </div>

    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2"
    >
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-28 w-full rounded-none"
      />
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2"
    >
      <div
        v-for="service in services"
        :key="service.id"
        class="relative cursor-pointer transition-colors duration-150 border border-zinc-200 overflow-hidden bg-white"
        :class="[
          booking.service?.id === service.id ? 'bg-zinc-50' : 'bg-white',
        ]"
        @click="handleSelect(service)"
      >
        <div
          v-if="booking.service?.id === service.id"
          class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500"
        />

        <div class="p-6 flex justify-between items-center gap-4">
          <div class="space-y-1">
            <h3
              class="font-bold text-lg tracking-tight"
              :class="booking.service?.id === service.id ? 'text-primary-600' : 'text-zinc-900'"
            >
              {{ service.name }}
            </h3>

            <div class="flex items-center gap-2 text-zinc-500 text-sm font-medium">
              <UIcon
                name="i-lucide-clock"
                class="w-4 h-4"
              />
              <span>{{ service.duration_minutes }} min</span>
            </div>
          </div>

          <div class="flex flex-col items-end shrink-0">
            <span class="text-xl font-black text-zinc-900">
              {{ service.price }} zł
            </span>
            <UIcon
              v-if="booking.service?.id === service.id"
              name="i-lucide-check"
              class="w-5 h-5 text-primary-500 mt-1"
            />
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="!booking.service && !pending"
      class="text-center text-xs text-zinc-400 mt-6 uppercase tracking-widest font-bold"
    >
      Zaznacz usługę, aby przejść dalej
    </p>
  </div>
</template>