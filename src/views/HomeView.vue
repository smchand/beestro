<script>
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

export default {
  name: 'Home',
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation
  }
}
//register component yg udah di import biar bisa dipake (define satu satu)
</script>

<script setup>
//setub itu hub / composition API(ini gaperlu define satu satu) tutor-> https://vuejs.org/guide/extras/composition-api-faq.html
import konfigurasi from '@/config.js' //cek file config.js
import { get, useTitle } from '@vueuse/core'

import { useCollection, useFirestore } from 'vuefire'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue' //ini hook yg ada di composition API

const discoverText = ref('') //define variable string
const banners = ref([]) //define variable list
const chefRecommendation = ref([])
const middleImage = ref([])
const bottomImage = ref([])

const db = useFirestore()
const settingsRef = collection(db, 'settings') //ngambil collection settings di firebase

const queryBanner = query(settingsRef, where('key', '==', 'homepage::banner')) //query buat ngambil banner dr collection settings
const queryDiscover = query(settingsRef, where('key', '==', 'homepage::discover_text'))
const queryChefRecommendation = query(
  settingsRef,
  where('key', '==', 'homepage::chef_recommendation')
)
const queryMiddleImage = query(settingsRef, where('key', '==', 'homepage::middle_image'))
const queryBottomImage = query(settingsRef, where('key', '==', 'homepage::bottom_image'))

onMounted(async () => {
  //onMounted biar page itu kebuka dia ngambil data
  const queryBannerSnapshot = await getDocs(queryBanner) //ambil semua document dr database
  if (!queryBannerSnapshot.empty) {
    //cek kosong atau engga
    banners.value = queryBannerSnapshot.docs[0].data().value //masukin ke variable yg udah di define
  }

  const queryDiscoverTextSnapshot = await getDocs(queryDiscover)
  if (!queryDiscoverTextSnapshot.empty) {
    discoverText.value = queryDiscoverTextSnapshot.docs[0].data().value
  }

  const queryChefRecommendationSnapshot = await getDocs(queryChefRecommendation)
  if (!queryChefRecommendationSnapshot.empty) {
    chefRecommendation.value = queryChefRecommendationSnapshot.docs[0].data().value
  }

  const queryMiddleImageSnapshot = await getDocs(queryMiddleImage)
  if (!queryMiddleImageSnapshot.empty) {
    middleImage.value = queryMiddleImageSnapshot.docs[0].data().value
  }

  const queryBottomImageSnapshot = await getDocs(queryBottomImage)
  if (!queryBottomImageSnapshot.empty) {
    bottomImage.value = queryBottomImageSnapshot.docs[0].data().value
  }
})

useTitle(`${konfigurasi.app.name}`) //title page
//style tambahan buat carousel: tombol arrownya(next prev), tombol pagination yg dibawah(active itu yg lg di display)
</script>

<style>
.carousel__next,
.carousel__prev {
  @apply text-white;
  @apply bg-black/50;
  @apply hover:text-white;
}

.carousel__pagination-button::after {
  @apply bg-gray-50/50;
}

.carousel__pagination-button.carousel__pagination-button--active::after {
  @apply bg-white;
}

.carousel__pagination-button::after {
  @apply w-10;
  @apply h-1;
}
</style>

<template>
  <main>
    <carousel :items-to-show="1" :autoplay="3000" :transition="500">
      <slide v-for="banner in banners" :key="banner.image">
        <!-- yg atas dia show satu gambar tiap 3 detik transisinya stengah detik, 
        terus dia ambil banners yang udah di define dan dimasukin data dari firebase trus di looping buat dipake-->
        <div class="relative h-[500px] 2xl:h-[800px] w-full">
          <div class="bg-black bg-opacity-50">
            <img
              :src="banner.image"
              :alt="banner.caption"
              class="w-full mix-blend-darken h-[500px] 2xl:h-[800px] object-cover object-center"
            />
            <!-- src sama alt itu harus unique namanya cuam buat sebagai sourcenya dari mana-->
          </div>

          <p
            class="absolute top-1/2 left-10 transform -translate-y-1/2 text-4xl text-white text-start [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] md:left-1/2 md:-translate-x-1/2 md:text-6xl"
          >
            {{ banner.caption }}
            <!-- pake kumis buat nampilin -->
          </p>
        </div>
      </slide>

      <template #addons>
        <navigation />
        <pagination class="absolute bottom-2 right-0 left-0" />
      </template>
    </carousel>

    <section class="grid grid-cols-1 md:grid-cols-8 bg-[#1C1C1C] 2xl:h-[400px]">
      <!-- grid-cols-1 itu buat di moble sebelahnya buat layr yg gede(ini buat responsiveness) -->
      <div class="col-span-2 h-[400px]">
        <img
          src="/assets/img/gelas.png"
          class="object-cover w-full h-full"
          alt="Jan Bistro - Cup"
        />
      </div>

      <div class="col-span-5 p-12 flex items-center justify-start">
        <!-- flex biar kesamping, kalo ga dia numpuk kebawah -->
        <div>
          <h1 class="text-4xl text-white font-bold font-antique">Discover JAN Bistro</h1>
          <p class="text-white mt-4 text-2xl font-rosario">
            {{ discoverText }}
          </p>

          <div class="mt-8">
            <router-link
              class="border border-[#DBAD39] text-white px-4 py-3 rounded-[3px] font-rosario font-semibold"
              to="/about-us"
            >
              Read more of our journey
            </router-link>
            <!-- router link in buat arahin ke page yg dituju -->
          </div>
        </div>
      </div>
    </section>

    <section class="py-8 max-w-6xl mx-auto">
      <h1 class="text-center text-3xl [text-shadow:_2px_4px_4px_rgb(0_0_0_/_25%)] font-antique">
        Chef’s Recommendations
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mx-4 2xl:mx-auto">
        <div class="" v-for="(rec, index) in chefRecommendation" :key="rec.image">
          <!-- ambil image index buat jaga-jaga yg di alternatif -->
          <img :src="rec.image" class="w-full h-full" :alt="`Jan Bistro - Chef ${index}`" />
        </div>
      </div>

      <div class="text-center mt-8">
        <router-link to="/menu" class="bg-[#DBAD39] px-4 py-3 text-white rounded-[3px]">
          Explore our menu selection
        </router-link>
      </div>
    </section>

    <section class="bg-[#1C1C1C]">
      <div class="py-8 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mx-4 2xl:mx-auto">
          <div class="h-[500px]">
            <img
              :src="middleImage[0] ? middleImage[0].image : ''"
              class="object-cover object-center w-full h-full"
              alt="Jan Bistro - Cup"
              v-if="middleImage[0]"
            />
          </div>

          <div class="bg-[#414141] text-center text-white p-4 flex items-center justify-center">
            <div class="">
              <p class="text-[19px] font-rosario">A Table for One, A Feast for Many:</p>
              <h1 class="text-[32px] leading-[44px] font-antique mb-6">
                Celebrating Moments,<br />Together or Apart.
              </h1>

              <div class="border-[#DBAD39] w-[180px] border-t border-[3px] h-1 mx-auto"></div>

              <p class="mt-6 font-rosario text-[19px]">
                Whether you dine in solitude or with a lively group, every plate we serve is an
                invitation to savor and share.
              </p>

              <div class="mt-8">
                <router-link
                  to="/reservations"
                  class="bg-[#DBAD39] px-20 py-3 rounded-[3px] font-rosario font-semibold text-[22px]"
                >
                  Reservation
                </router-link>
              </div>
            </div>
          </div>

          <div class="h-[500px]">
            <img
              :src="middleImage[1] ? middleImage[1].image : ''"
              class="object-cover object-center w-full h-full"
              alt="Jan Bistro - Cup"
              v-if="middleImage[1]"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="lg:h-[500px] relative">
      <div class="absolute -z-50 w-full h-full">
        <img src="/assets/img/bg-end.png" class="object-cover h-full w-full" alt="BG End" />
      </div>

      <div class="bg-black bg-opacity-30 py-12 h-full">
        <div class="max-w-6xl bg-[#313131]/60 mx-4 xl:mx-auto p-8 h-full">
          <div class="grid grid-cols-1 md:grid-cols-3 h-full gap-5">
            <div class="border-l-white border-l-[3px]">
              <div class="flex items-center px-6 h-full">
                <div>
                  <p class="font-rosario text-[17px] text-white">
                    What’s going on this week at JAN Bistro?
                  </p>

                  <h1 class="font-rosarivo text-[40px] text-white">Deals & Events</h1>

                  <p class="font-rosario text-[20px] leading-[24px] text-white mt-4">
                    Find on-going exciting offers, special promotions, and upcoming events that we
                    have prepared just for you. Take advantage of these limited-time deals and join
                    us for unforgettable experiences.
                  </p>
                </div>
              </div>
            </div>

            <div class="h-[340px]" v-if="bottomImage">
              <img
                :src="bottomImage[0] ? bottomImage[0].image : ''"
                alt="Image 1"
                class="object-cover h-full w-full object-center"
              />
            </div>

            <div class="h-[340px]" v-if="bottomImage">
              <img
                :src="bottomImage[0] ? bottomImage[0].image : ''"
                alt="Image 2"
                class="object-cover h-full w-full object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
