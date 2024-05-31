<script setup>
// import logo dan konfigurasi website
import Logo from '@/components/icons/Logo.vue'
import konfigurasi from '@/config.js'

import rupiah from '@/helpers/rupiah.js'
import { computed, onMounted, ref } from 'vue'
import { useTitle } from '@vueuse/core'
import { useFirestore } from 'vuefire'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

const category = {
  starter: 'Starter',
  brunch: 'Brunch',
  western: 'Western',
  asian: 'Asian',
  pizza_pasta: 'Pizza & Pasta',
  beverages: 'Beverages'
}
const tab = ref({ slug: 'starter', title: 'Starter' })
const content = ref([])
const isLoading = ref(false)

const db = useFirestore()
const list = ref([])

const fetchData = async () => {
  isLoading.value = true
  currentPage.value = 1

  list.value = []

  const queryAll = await getDocs(
    query(collection(db, 'menus'), where('slug', '==', tab.value.slug), orderBy('slug', 'desc'))
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

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return list.value.slice(startIndex, endIndex)
})

const goToPage = (page) => {
  currentPage.value = page
}

const switchTab = async (changeTo) => {
  tab.value = changeTo

  await fetchData()
}

useTitle(`Menu - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <section class="h-[300px] lg:h-[500px] w-full relative">
      <div class="h-full w-full bg-black/25">
        <img src="/assets/img/menu-head.png" class="object-cover h-full w-full mix-blend-darken" />
      </div>

      <div class="flex items-center justify-center z-50 absolute top-0 left-0 right-0 bottom-0">
        <h1
          class="text-white text-4xl lg:text-5xl 2xl:text-7xl [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
        >
          Our Menu
        </h1>
      </div>
    </section>

    <section class="py-12 bg-[#1C1C1C]">
      <div class="max-w-6xl mx-auto px-4 2xl:px-0">
        <nav>
          <ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
            <li
              v-for="(cat, index) in category"
              :key="index"
              :class="`transition-all delay-100 w-full ${
                tab.slug === index ? 'bg-[#DBAD39]' : 'border-[#DBAD39] border-b-2'
              }`"
            >
              <button
                type="button"
                class="text-white font-rosario text-[19px] w-full px-2 py-1 text-center disabled:cursor-not-allowed"
                @click="switchTab({ slug: index, title: cat })"
                :disabled="tab.slug === index"
              >
                {{ cat }}
              </button>
            </li>
          </ul>
        </nav>

        <div class="w-full">
          <h1 class="text-white text-[36px] text-rosarivo text-center py-12">{{ tab.title }}</h1>

          <div class="text-center text-white font-bold font-rosarivo text-2xl" v-if="isLoading">
            Loading Data..
          </div>

          <div
            class="text-center text-white font-bold font-rosarivo text-2xl"
            v-if="!isLoading && list.length == 0"
          >
            No Data
          </div>

          <div v-if="!isLoading">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="h-full w-full" v-for="(item, index) in paginatedItems" :key="index">
                <div class="relative group">
                  <div>
                    <img :src="item.image" class="object-cover h-full w-full" />
                  </div>

                  <div
                    class="absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t h-full from-black/100 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div class="absolute bottom-2 left-0 px-2">
                      <h1 class="text-white font-sans font-semibold text-[18px]">
                        {{ rupiah(item.price) }}
                      </h1>

                      <h1 class="text-white font-rosarivo font-bold text-[20px]">
                        {{ item.title }}
                      </h1>

                      <p class="text-white font-rosario text-[18px]">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="font-sans mt-4 text-white" v-if="!isLoading && list.length > 0">
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
      </div>
    </section>
  </main>
</template>