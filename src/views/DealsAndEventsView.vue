<script setup>
// import logo dan konfigurasi website
import Logo from '@/components/icons/Logo.vue'
import konfigurasi from '@/config.js'

import dealsEventsDateFormat from '@/helpers/dealsFormat.js'
import { computed, onMounted, ref } from 'vue'
import { useTitle } from '@vueuse/core'
import { useFirestore } from 'vuefire'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

const tab = ref({ slug: 'deals', title: 'Deals' })
const list = ref([])
const isLoading = ref(false)

const db = useFirestore()

const fetchData = async () => {
  isLoading.value = true
  currentPage.value = 1
  list.value = []

  const queryAll = await getDocs(
    query(
      collection(db, 'deals_events'),
      where('slug', '==', tab.value.slug),
      orderBy('slug', 'desc')
    )
  )
  queryAll.forEach((doc) => {
    list.value.push(doc.data())
  })

  isLoading.value = false
}

onMounted(async () => {
  await fetchData()
})

const itemsPerPage = 6
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(list.value.length / itemsPerPage))
// computed itu sama kek on Mounted tp dia return value dari fungsi yang dia
const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return list.value.slice(startIndex, endIndex)
})

const goToPage = (page) => {
  currentPage.value = page
}

const changeTab = async (tabnya) => {
  tab.value = tabnya

  await fetchData()
}

useTitle(`Deals And Events - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <section class="h-[300px] lg:h-[500px] w-full relative">
      <div class="h-full w-full bg-black/70">
        <img
          src="/assets/img/deals_and_events.png"
          class="object-cover h-full w-full mix-blend-darken"
        />
      </div>

      <div class="flex items-center justify-center z-50 absolute top-0 left-0 right-0 bottom-0">
        <h1
          class="text-white text-4xl lg:text-5xl 2xl:text-7xl text-center md:text-left font-rosarivo [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
        >
          On Going Deals<br />
          & Upcoming Events
        </h1>
      </div>
    </section>

    <section class="py-12 bg-[#1C1C1C]">
      <div class="max-w-xs mx-auto px-4 md:px-0">
        <nav>
          <ul class="flex justify-between items-center gap-1">
            <li
              :class="`border-[#DBAD39] transition-all delay-100 w-full ${
                tab.slug === 'deals' ? 'bg-[#DBAD39]' : ' border-b-2'
              }`"
            >
              <button
                type="button"
                class="text-white font-rosario text-[19px] w-full px-2 py-1 text-center"
                @click="changeTab({ slug: 'deals', title: 'Deals' })"
                :disabled="tab.slug == 'deals'"
              >
                Deals
              </button>
            </li>

            <li
              :class="`border-[#DBAD39] transition-all delay-100 w-full ${
                tab.slug === 'events' ? 'bg-[#DBAD39]' : 'border-b-2'
              }`"
            >
              <button
                type="button"
                class="text-white font-rosario text-[19px] w-full px-2 py-1 text-center"
                @click="changeTab({ slug: 'events', title: 'Events' })"
                :disabled="tab.slug == 'events'"
              >
                Events
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div class="max-w-6xl mx-4 lg:mx-auto mt-12">
        <div class="grid grid-cols-1 min-h-[355px]" v-if="isLoading">
          <h1 class="font-bold text-white text-center">Loading Data</h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" v-if="!isLoading">
          <div class="text-white" v-for="(item, index) in paginatedItems" :key="index">
            <img :src="item.image" alt="" />

            <div class="grid grid-cols-12 mt-6">
              <div class="border-r-[3px] col-span-2 text-center">
                <span class="font-rosario text-[18px]">
                  {{ dealsEventsDateFormat(item.date).day_name }}
                </span>

                <div class="font-rosario font-semibold text-[30px] -mt-3 -mb-2">
                  {{ dealsEventsDateFormat(item.date).day }}
                </div>

                <span class="font-rosario text-[18px]">
                  {{ dealsEventsDateFormat(item.date).month_name }}
                </span>
              </div>

              <div class="col-span-10 px-4">
                <h1 class="font-rosario font-semibold text-[24px]">{{ item.title }}</h1>
                <p class="mt-1 text-[18px] font-rosario leading-6">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="text-white mt-4">
          <div class="font-sans mt-4" v-if="!isLoading && list.length > 0">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, list.length) }} from
            {{ list.length }}
          </div>

          <div class="mt-4 flex justify-start font-sans" v-if="!isLoading">
            <button
              class="px-4 py-2 bg-slate-600 text-white rounded-lg mr-2"
              @click="goToPage(currentPage - 1)"
              v-if="currentPage > 1"
            >
              Previous
            </button>

            <button
              class="px-4 py-2 bg-slate-600 text-white rounded-lg"
              @click="goToPage(currentPage + 1)"
              v-if="currentPage < totalPages"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>