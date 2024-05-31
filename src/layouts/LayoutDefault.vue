<script>
export default {
  name: 'LayoutDefault'
}
</script>

<script setup>
import Logo from '../components/icons/Logo.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'
import IconTikTok from '@/components/icons/IconTikTok.vue'
import Navicon from '@/components/icons/NavIcon.vue'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, getDocs, where } from 'firebase/firestore'
import { query } from 'firebase/database'

const isNavBarOpen = ref(false)

const list = ref([{ instagram: '' }, { tiktok: '' }, { kontak: '' }, { alamat: '' }, { qris: '' }])
const db = useFirestore()

onMounted(async () => {
  const queryGeneral = await getDocs(
    query(collection(db, 'settings'), where('key', '==', 'general::metadatas'))
  )

  if (!queryGeneral.empty) {
    list.value = queryGeneral.docs[0].data().value
  }
})

window.onresize = async () => {
  if (window.innerWidth > 768) {
    isNavBarOpen.value = false
  }
}

const openNavBar = async () => {
  if (window.innerWidth < 768) {
    isNavBarOpen.value = !isNavBarOpen.value
  }
}

const route = useRoute()
</script>

<template>
  <header class="bg-[#1C1C1C] py-[5px] px-4 md:py-8 md:px-0">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between md:justify-center items-center">
        <router-link to="/">
          <Logo />
        </router-link>

        <button class="block md:hidden" @click="openNavBar">
          <navicon _color="#FFFFFF" :w="24" :h="24" />
        </button>
      </div>

      <nav>
        <ul
          :class="`text-white mt-4 space-y-4 md:text-center [&>li>a]:py-2 [&>li>a]:block [&>li>a]:border-none md:flex md:mx-auto md:w-fit md:space-x-20 md:space-y-0 hidden [&.open]:block ${
            isNavBarOpen ? 'open' : ''
          }`"
        >
          <li>
            <router-link
              to="/"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              Home
            </router-link>
          </li>

          <li>
            <router-link
              to="/about-us"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/about-us' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              About Us
            </router-link>
          </li>

          <li>
            <router-link
              to="/menu"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/menu' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              Menu
            </router-link>
          </li>

          <li>
            <router-link
              to="/reservations"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/reservations' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              Reservations
            </router-link>
          </li>

          <li>
            <router-link
              to="/deals_and_events"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/deals_and_events' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              Deals & Events
            </router-link>
          </li>

          <li>
            <router-link
              to="/contact"
              :class="`[&.active]:border-b-2 [&.active]:text-[#DBAD39] ${
                route.path === '/contact' ? 'active' : ''
              }`"
              @click="openNavBar"
            >
              Contact
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <router-view />

  <footer class="bg-[#101010] py-8">
    <div class="max-w-6xl mx-6 md:mx-auto md:grid md:grid-cols-4 md:gap-2">
      <router-link to="/" class="flex justify-center items-center">
        <Logo />
      </router-link>

      <div class="mt-8 md:mt-0">
        <h1 class="text-[#DBAD39] font-bold font-rosario">Location</h1>
        <p class="text-white font-thin font-rosario" v-if="list[3].alamat">
          {{ list[3].alamat }}
        </p>
      </div>

      <div class="mt-8 md:mt-0">
        <h1 class="text-[#DBAD39] font-bold font-rosario">Contact Us</h1>
        <p class="text-white font-thin font-rosario" v-if="list[2].kontak">{{ list[2].kontak }}</p>
      </div>

      <div class="mt-8 md:mt-0">
        <h1 class="text-[#DBAD39] font-bold">Stay Connected</h1>

        <div class="flex items-center justify-start gap-4 mt-4">
          <a
            :href="list[0].instagram"
            rel="noopener nofollow"
            target="_blank"
            v-if="list[0].instagram"
          >
            <IconInstagram />
          </a>

          <a :href="list[1].tiktok" rel="noopener nofollow" target="_blank" v-if="list[1].tiktok">
            <IconTikTok />
          </a>
        </div>

        <p class="text-gray-300 mt-5 font-poppins text-[15px]">
          © {{ new Date().getFullYear() }} JAN Bistro. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>