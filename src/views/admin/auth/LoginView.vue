<script setup>
import { ref, watchEffect } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import router from '@/router'

const auth = useFirebaseAuth()

const isLogin = ref(false)
const error = ref(null)
const email = ref('')
const password = ref('')

const login = async () => {
  isLogin.value = true
  error.value = null

  try {
    const result = await signInWithEmailAndPassword(auth, email.value, password.value)
    if (result.user) {
      router.push({ name: 'dashboard' })
    }
  } catch (reason) {
    isLogin.value = false
    error.value = reason.message
  }
}
</script>

<template>
  <div class="bg-blue-400 h-screen flex items-center justify-center">
    <form class="border rounded-xl bg-white mx-4 p-6 w-[500px]" @submit.prevent="login()">
      <div class="mb-4">
        <h1 class="font-bold text-2xl">Masuk Admin Area</h1>
        <p>Silahkan masuk dengan akun administrator</p>
      </div>

      <div class="bg-red-600 p-4 rounded-lg text-white mb-4" v-if="error">
        <b>Gagal</b> {{ error }}
      </div>

      <div class="space-y-2 mb-4">
        <label for="email">Email <span class="text-red-800">*</span></label>
        <input
          v-model="email"
          type="text"
          id="email"
          name="email"
          class="w-full border-[2px] border-slate-200 focus:border-blue-300 px-3 py-3 rounded-xl outline-none bg-gray-50"
          required
          autofocus
        />
      </div>

      <div class="space-y-2 mb-4">
        <label for="password">Password <span class="text-red-800">*</span></label>
        <input
          v-model="password"
          type="password"
          id="password"
          name="password"
          class="w-full border-[2px] border-slate-200 focus:border-blue-300 px-3 py-3 rounded-xl outline-none bg-gray-50"
          required
        />
      </div>

      <div class="">
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 w-full rounded-full text-white hover:bg-blue-600 active:bg-blue-800 font-bold disabled:bg-blue-300 disabled:cursor-not-allowed"
          :disabled="isLogin"
        >
          {{ isLogin ? `Loading` : `Masuk` }}
        </button>
      </div>
    </form>
  </div>
</template>