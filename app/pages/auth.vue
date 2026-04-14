<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

definePageMeta({ title: 'Konto' })

const loading = ref(false)
const authData = reactive({
  email: '',
  password: '',
})

const items = [
  { slot: 'login', label: 'Logowanie' },
  { slot: 'register', label: 'Rejestracja' },
]

watchEffect(() => {
  if (user.value) navigateTo('/')
})

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  const { error } = await client.auth.signInWithPassword({
    email: authData.email,
    password: authData.password,
  })
  if (error) {
    toast.add({ title: 'Błąd logowania', description: error.message, color: 'error' })
  }
  else {
    toast.add({ title: 'Zalogowano!', color: 'success' })
  }
  loading.value = false
}

const handleSignUp = async () => {
  if (loading.value) return
  loading.value = true
  const { error } = await client.auth.signUp({
    email: authData.email,
    password: authData.password,
  })
  if (error) {
    toast.add({ title: 'Błąd rejestracji', description: error.message, color: 'error' })
  }
  else {
    toast.add({ title: 'Konto utworzone!', description: 'Możesz się zalogować.', color: 'success' })
  }
  loading.value = false
}
</script>

<template>
  <div class="grow flex items-center justify-center p-4 min-h-[calc(100vh-137px)]">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-zinc-100">
            Witaj w BarberBook
          </h1>
          <p class="text-zinc-500">
            Zaloguj się do swojego konta, aby zarządzać wizytami, przeglądać historię rezerwacji oraz edytować swoje dane profilowe.
          </p>
          <p class="text-sm text-zinc-400">
            Wszystkie Twoje rezerwacje w jednym, bezpiecznym miejscu.
          </p>
        </div>
      </template>

      <UTabs
        :items="items"
        class="w-full"
      >
        <template #login>
          <form
            class="w-full space-y-4 pt-4"
            @submit.prevent="handleLogin"
          >
            <UInput
              v-model="authData.email"
              type="email"
              placeholder="Email"
              icon="i-lucide-mail"
              size="lg"
              class="w-full"
            />
            <UInput
              v-model="authData.password"
              type="password"
              placeholder="Hasło"
              icon="i-lucide-lock"
              size="lg"
              class="w-full"
            />
            <UButton
              type="submit"
              label="Zaloguj się"
              block
              size="lg"
              :loading="loading"
            />
          </form>
        </template>

        <template #register>
          <form
            class="w-full space-y-4 pt-4"
            @submit.prevent="handleSignUp"
          >
            <UInput
              v-model="authData.email"
              type="email"
              placeholder="Email"
              icon="i-lucide-mail"
              size="lg"
              class="w-full"
            />
            <UInput
              v-model="authData.password"
              type="password"
              placeholder="Hasło"
              icon="i-lucide-lock"
              size="lg"
              class="w-full"
            />
            <UButton
              type="submit"
              label="Zarejestruj się"
              block
              size="lg"
              :loading="loading"
            />
          </form>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>
