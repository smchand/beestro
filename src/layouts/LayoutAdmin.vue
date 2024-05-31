<script>
export default {
  name: 'Layout Admin'
}
</script>

<script setup>
import Navicon from '@/components/icons/NavIcon.vue'

import { ref, watchEffect } from 'vue'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { useRoute } from 'vue-router'
import router from '@/router'
import { signOut } from 'firebase/auth'
import konfigurasi from '@/config'

const auth = useFirebaseAuth()
const route = useRoute()
const user = useCurrentUser()
const showUserNav = ref(false)

const isMobile = window.innerWidth < 1024
const showSidebar = ref(!isMobile)

window.onresize = async () => {
  if (window.innerWidth > 1200) {
    showSidebar.value = true
  } else {
    showSidebar.value = false
  }
}

const openSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const openUserNav = () => {
  showUserNav.value = !showUserNav.value
}

const logout = async () => {
  await signOut(auth)
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex flex-row">
    <div
      :class="`bg-[#074173] fixed inset-y-0 left-0 right-0 z-50 min-h-screen overflow-auto transform transition duration-300 ease-in-out w-full md:w-1/4 -translate-x-[102%] [&.open]:translate-x-0 ${
        showSidebar ? 'open md:static' : ''
      }`"
    >
      <div class="bg-[#102C57] p-4 flex items-center justify-between">
        <h1 class="font-bold font-rosario text-white text-2xl">{{ konfigurasi.app.name }}</h1>

        <button @click="openSidebar" class="text-white text-5xl md:hidden">&times;</button>
      </div>

      <ul>
        <li>
          <router-link
            to="/administrator/dashboard"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/dashboard' ? 'active' : ''
            }`"
          >
            Dashboard
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/settings/general"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/settings/general' ? 'active' : ''
            }`"
          >
            Pengaturan Umum
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/settings/homepage"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/settings/homepage' ? 'active' : ''
            }`"
          >
            Pengaturan Homepage
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/settings/about"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/settings/about' ? 'active' : ''
            }`"
          >
            Pengaturan Tentang Kami
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/settings/menus"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/settings/menus' ? 'active' : ''
            }`"
          >
            Pengaturan Menu
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/settings/deals_events"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/settings/deals_events' ? 'active' : ''
            }`"
          >
            Pengaturan Deals & Events
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/masterdata/master_reservasi"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/master_reservasi' ? 'active' : ''
            }`"
          >
            Data Reservasi
          </router-link>
        </li>

        <li>
          <router-link
            to="/administrator/masterdata/master_feedback"
            :class="`text-white p-4 flex font-sans hover:bg-blue-800/25 hover:border-l-2 border-blue-400 transition-all [&.active]:border-l-2 [&.active]:bg-blue-800/25 ${
              route.path === '/administrator/master_reservasi' ? 'active' : ''
            }`"
          >
            Data Feedback
          </router-link>
        </li>
      </ul>
    </div>

    <main class="w-full bg-[#E5E5E5]">
      <nav class="bg-white flex flex-row justify-between font-sans font-bold relative">
        <button class="p-4" @click="openSidebar">
          <navicon />
        </button>

        <button type="button" class="hover:bg-gray-100/60 p-4" @click="openUserNav()">
          {{ user ? user.email : `Loading User...` }}
        </button>

        <div class="absolute bg-white border top-full right-0 w-44" v-if="showUserNav">
          <button
            type="buttom"
            class="px-4 py-2 flex flex-col w-full font-sans font-normal"
            @click="logout()"
          >
            Logout
          </button>
        </div>
      </nav>

      <div class="p-6 min-h-screen">
        <router-view />
      </div>

      <footer class="bg-white p-4 font-sans">
        Copyright &copy; {{ new Date().getFullYear() }}. {{ konfigurasi.app.name }}
      </footer>
    </main>
  </div>
</template>