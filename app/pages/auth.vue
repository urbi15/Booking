<script setup lang="ts">
import { z } from 'zod'

const client = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

definePageMeta({ title: 'Konto' })

const loading = ref(false)
const authData = reactive({
  email: '',
  password: '',
})

const loginSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail.'),
  password: z.string().min(1, 'Hasło jest wymagane.'),
})

const registerSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail.'),
  password: z
    .string()
    .min(8, 'Hasło musi mieć minimum 8 znaków.')
    .max(72, 'Hasło jest zbyt długie (maks. 72 znaki).'),
})

const showValidationError = (message: string) => {
  toast.add({
    title: 'Popraw dane formularza',
    description: message,
    color: 'error',
    icon: 'i-lucide-alert-circle',
  })
}

const items = [
  { slot: 'login', label: 'Logowanie' },
  { slot: 'register', label: 'Rejestracja' },
]

watchEffect(() => {
  if (user.value) navigateTo('/')
})

const handleLogin = async () => {
  if (loading.value) return
  const result = loginSchema.safeParse(authData)
  if (!result.success) {
    showValidationError(result.error.issues[0]?.message || 'Sprawdź dane logowania.')
    return
  }

  loading.value = true

  try {
    const { error } = await client.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    if (error) {
      toast.add({
        title: 'Błąd logowania',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
    else {
      toast.add({
        title: 'Zalogowano!',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    }
  }
  finally {
    loading.value = false
  }
}

const handleSignUp = async () => {
  if (loading.value) return
  const result = registerSchema.safeParse(authData)
  if (!result.success) {
    showValidationError(result.error.issues[0]?.message || 'Sprawdź dane rejestracji.')
    return
  }

  loading.value = true

  try {
    const { error } = await client.auth.signUp({
      email: result.data.email,
      password: result.data.password,
    })

    if (error) {
      toast.add({
        title: 'Błąd rejestracji',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
    else {
      toast.add({
        title: 'Konto utworzone!',
        description: 'Możesz się teraz zalogować.',
        color: 'success',
        icon: 'i-lucide-party-popper',
      })
    }
  }
  finally {
    loading.value = false
  }
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