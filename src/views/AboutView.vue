<script setup>
// import logo dan konfigurasi website
import Logo from '@/components/icons/Logo.vue'
import konfigurasi from '@/config.js'

import { useTitle } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, getDocs, query, where } from 'firebase/firestore'

const kataSambutan = ref('')
const jamBuka = ref({})
const general = ref([
  { instagram: '' },
  { tiktok: '' },
  { kontak: '' },
  { alamat: '' },
  { qris: '' }
])

const db = useFirestore()
const settingsRef = collection(db, 'settings')

const queryKataSambutan = query(settingsRef, where('key', '==', 'about::kata_sambutan'))
const queryJamBuka = query(settingsRef, where('key', '==', 'about::jam_buka'))
const queryGeneral = query(collection(db, 'settings'), where('key', '==', 'general::metadatas'))

onMounted(async () => {
  const queryKataSambutanSnapshot = await getDocs(queryKataSambutan)
  if (!queryKataSambutanSnapshot.empty) {
    kataSambutan.value = queryKataSambutanSnapshot.docs[0].data().value
  }

  const queryJamBukaSnapshot = await getDocs(queryJamBuka)
  if (!queryJamBukaSnapshot.empty) {
    jamBuka.value = queryJamBukaSnapshot.docs[0].data().value
  }

  const queryGeneralSnapshot = await getDocs(queryGeneral)
  if (!queryGeneralSnapshot.empty) {
    general.value = queryGeneralSnapshot.docs[0].data().value
  }
})

// otomatis tambahkan <br> atau baris pemisah di tiap baris baru
const tampilkanKataSambutan = () => {
  return kataSambutan.value.replace(/\n/g, '<br />')
}
// harus diganti ke br soalnya di html pakenya br

useTitle(`About Us - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <section class="relative w-full h-[620px] md:h-[720px] flex items-center">
      <div class="mx-auto">
        <div
          class="absolute inset-0 bg-no-repeat bg-cover bg-center"
          style="
            background-image: linear-gradient(
                90deg,
                rgba(20, 15, 15, 0.8) 0%,
                rgba(35, 33, 33, 0.387942) 200%,
                rgba(49, 49, 49, 0) 100%
              ),
              url('/assets/img/about-bg.png');
          "
        ></div>

        <div class="max-w-6xl mx-auto px-6 2xl:px-0">
          <div class="relative h-full text-white md:w-2/5">
            <h1
              class="text-[64px] leading-[72px] md:text-[80px] font-rosarivo mb-4 md:leading-[95px]"
            >
              Our<br />Story
            </h1>

            <p class="font-medium font-rosario text-[22px]" v-html="tampilkanKataSambutan()"></p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 bg-[#101010] px-6 2xl:px-0">
      <div class="max-w-6xl mx-auto border-l-[4px] border-t-[4px] border-r-[4px] border-[#DBAD39]">
        &nbsp;
      </div>

      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-3 gap-4">
          <div class="grid gap-4">
            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-1.png" alt="" />
            </div>

            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-4.png" alt="" />
            </div>
          </div>

          <div class="grid gap-4">
            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-2.png" alt="" />
            </div>

            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-5.png" alt="" />
            </div>
          </div>

          <div class="grid gap-4">
            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-3.png" alt="" />
            </div>

            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-6.png" alt="" />
            </div>

            <div>
              <img class="max-w-full object-cover h-full" src="/assets/img/masonry-7.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto border-b-[4px] border-l-[4px] border-r-[4px] border-[#DBAD39]">
        &nbsp;
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2">
      <div>
        <img
          class="max-w-full object-cover h-[500px] md:h-[684px] w-full"
          src="/assets/img/blue-cup.png"
        />
      </div>

      <!-- ini gaperlu ada di cms soalnya kalo ganti konten bakal ganti route buttonnya anyway -->
      <div class="flex items-center jusitify-center bg-[#1C1C1C] relative py-24 md:py-0">
        <div class="w-full md:w-10/12 mx-auto z-50 px-4 md:px-0">
          <h1
            class="font-antique text-[32px] text-center text-white lg:text-[48px] lg:leading-[55px] mb-12"
          >
            Pour pleasure into every<br class="hidden md:block" />
            glass, savor the joy.
          </h1>

          <p class="text-[20px] md:text-[22px] font-rosario text-white text-center">
            Savor the richness in every sip of our carefully crafted alcoholic beverages—a toast to
            indulgence and unforgettable moments.
          </p>

          <div class="text-center mt-16">
            <router-link
              to="/menu"
              class="bg-[#DBAD39] px-10 py-3 rounded text-white font-semibold font-rosario text-[18px] block w-fit mx-auto"
            >
              Alcoholic Beverages Menu
            </router-link>
          </div>
        </div>

        <img src="/assets/img/glass.svg" class="absolute bottom-0 right-0 opacity-75 z-40" />
      </div>
    </section>

    <!-- ini juga sama -->
    <section class="grid grid-cols-1 md:grid-cols-2">
      <div class="bg-[#DBAD39] p-6 md:p-12">
        <div class="bg-[#1C1C1C] h-full w-full px-4 lg:px-0 py-12 flex items-center justify-center">
          <div class="w-3/4">
            <div class="flex justify-center items-center">
              <Logo :w="100" :h="100" />
            </div>

            <h1 class="text-white font-antique text-[24px] lg:text-[32px] text-center">
              Dinner, Event,<br />or Party?
            </h1>

            <p class="text-white text-center text-[14px] lg:text-[21px] mt-6 font-rosario">
              Indulge in a culinary experience like no other as you celebrate your cherished moments
              with us at our exquisite restaurant.
            </p>

            <div class="mt-12 text-center">
              <router-link
                to="/reservations"
                class="bg-[#DBAD39] px-4 lg:px-12 py-3 rounded text-white text-[18px] font-semibold font-rosario block w-fit mx-auto"
              >
                Make Reservation
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="relative">
        <img
          src="/assets/img/about-app.png"
          class="object-cover w-full h-full max-h-full object-center"
        />
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2">
      <div>
        <img class="max-w-full object-cover h-full w-full" src="/assets/img/about-end.png" />
      </div>

      <div class="flex items-center justify-center relative">
        <div class="absolute -z-50 w-full h-full bg-black/60">
          <img src="/assets/img/visit-us.png" class="object-cover mix-blend-darken w-full h-full" />
        </div>

        <div class="w-[75%] mx-auto py-12 lg:py-0">
          <h1
            class="font-antique text-[48px] text-center text-white leading-[55px] mb-5 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
          >
            Come Visit Us
          </h1>

          <div class="w-[180px] border-t-[3px] border-[#DBAD39] mx-auto mb-12"></div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 text-center md:text-left">
            <div class="">
              <h1
                class="font-antique text-[33px] text-white [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
              >
                We Are Open
              </h1>

              <table class="text-white mt-5 mx-auto md:mx-0">
                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Monday</th>
                  <td>{{ jamBuka.senin }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Tuesday</th>
                  <td>{{ jamBuka.selasa }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Wednesday</th>
                  <td>{{ jamBuka.rabu }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Thursday</th>
                  <td>{{ jamBuka.kamis }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Friday</th>
                  <td>{{ jamBuka.jumat }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Saturday</th>
                  <td>{{ jamBuka.sabtu }}</td>
                </tr>

                <tr class="font-rosario text-[20px]">
                  <th class="w-32 text-left">Sunday</th>
                  <td>{{ jamBuka.minggu }}</td>
                </tr>
              </table>
            </div>

            <div class="">
              <h1
                class="font-antique text-[33px] text-white [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
              >
                Location
              </h1>

              <div class="mt-8">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d394.6646645267126!2d106.7409422829134!3d-6.110946290541382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1d9badbe95ed%3A0x6216a0c2f73e735e!2sJAN%20Bistro!5e0!3m2!1sid!2sid!4v1711353043586!5m2!1sid!2sid"
                  width="100%"
                  height="200"
                  style="border: 0"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <p class="text-white font-rosario text-[19px] mt-4" v-if="general[3].alamat">
                {{ general[3].alamat }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
