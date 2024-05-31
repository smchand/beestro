<script setup>
import { useTitle } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import konfigurasi from '@/config'

const user = useCurrentUser()

useTitle(`Admin Dashboard - ${konfigurasi.app.name}`)
</script>

<template>
  <div>
    <div class="bg-white border px-4 py-3 rounded-lg font-normal font-sans" v-if="user">
      Selamat Datang, <b>{{ user.email }}</b>
    </div>
  </div>
</template>