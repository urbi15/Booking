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
    toast.add({ 
      title: 'Błąd logowania', 
      description: error.message, 
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } else {
    toast.add({ 
      title: 'Zalogowano!', 
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
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
    toast.add({ 
      title: 'Błąd rejestracji', 
      description: error.message, 
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } else {
    toast.add({ 
      title: 'Konto utworzone!', 
      description: 'Możesz się teraz zalogować.', 
      color: 'success',
      icon: 'i-lucide-party-popper'
    })
  }
  loading.value = false
}
</script>

<template>
  <div class="grow flex items-center justify-center p-4 min-h-[calc(100vh-137px)]">
    <UCard class="w-full max-w-md shadow-2xl border-zinc-200">
      <template #header>
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-black text-zinc-900 uppercase italic tracking-tight">
            BarberBook
          </h1>
          <p class="text-zinc-500 text-sm">
            Zaloguj się, aby zarządzać wizytami i historią rezerwacji.
          </p>
        </div>
      </template>

      <UTabs :items="items" class="w-full">
        <template #login>
          <form class="w-full space-y-4 pt-6" @submit.prevent="handleLogin">
            <UInput
              v-model="authData.email"
              type="email"
              placeholder="Email"
              icon="i-lucide-mail"
              size="lg"
              color="neutral"
              class="w-full"
            />
            <UInput
              v-model="authData.password"
              type="password"
              placeholder="Hasło"
              icon="i-lucide-lock"
              size="lg"
              color="neutral"
              class="w-full"
            />
            <UButton
              type="submit"
              label="Zaloguj się"
              block
              size="lg"
              color="primary"
              class="uppercase font-bold tracking-widest mt-2"
              :loading="loading"
            />
          </form>
        </template>

        <template #register>
          <form class="w-full space-y-4 pt-6" @submit.prevent="handleSignUp">
            <UInput
              v-model="authData.email"
              type="email"
              placeholder="Email"
              icon="i-lucide-mail"
              size="lg"
              color="neutral"
              class="w-full"
            />
            <UInput
              v-model="authData.password"
              type="password"
              placeholder="Hasło"
              icon="i-lucide-lock"
              size="lg"
              color="neutral"
              class="w-full"
            />
            <UButton
              type="submit"
              label="Utwórz konto"
              block
              size="lg"
              color="primary"
              class="uppercase font-bold tracking-widest mt-2"
              :loading="loading"
            />
          </form>
        </template>
      </UTabs>

      <template #footer>
        <p class="text-[10px] text-center text-zinc-400 uppercase tracking-widest">
          Wszystkie Twoje rezerwacje w jednym, bezpiecznym miejscu.
        </p>
      </template>
    </UCard>
  </div>
</template>