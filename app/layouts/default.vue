<script setup lang="ts">
const user = useSupabaseUser()
const { auth } = useSupabaseClient()

const handleLogout = async () => {
  await auth.signOut()
  navigateTo('/auth')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-zinc-50">
    <header class="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink
            to="/"
            class="shrink-0 flex items-center gap-2 group"
          >
            <UIcon
              name="i-lucide-scissors"
              class="w-8 h-8 text-primary-500 group-hover:text-primary-600 transition-colors"
            />
            <span class="font-bold text-xl text-zinc-900 tracking-tight">BarberBook</span>
          </NuxtLink>

          <nav class="hidden md:flex space-x-8">
            <NuxtLink
              to="/"
              class="text-zinc-600 hover:text-primary-500 font-medium transition-colors"
            >
              Strona główna
            </NuxtLink>
            <NuxtLink
              to="/my-bookings"
              class="text-zinc-600 hover:text-primary-500 font-medium transition-colors"
            >
              Moje rezerwacje
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-3">
            <UButton
              to="/"
              label="Nowa rezerwacja"
              color="primary"
              variant="solid"
              icon="i-lucide-calendar-plus"
              class="hidden sm:inline-flex"
            />

            <UButton
              v-if="!user"
              to="/auth"
              label="Zaloguj"
              color="neutral"
              variant="ghost"
              icon="i-lucide-user"
              class="text-neutral-600 hover:text-neutral-200"
            />
            <UButton
              v-else
              label="Wyloguj"
              color="neutral"
              variant="ghost"
              icon="i-lucide-log-out"
              class="text-neutral-600 hover:text-neutral-200"
              @click="handleLogout"
            />
          </div>
        </div>
      </div>
    </header>

    <main class="grow">
      <slot />
    </main>

    <footer class="bg-white border-t border-zinc-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <p class="text-center text-sm text-zinc-500">
          &copy; {{ new Date().getFullYear() }} BarberBook. Aplikacja rezerwacyjna.
        </p>
      </div>
    </footer>
  </div>
</template>
