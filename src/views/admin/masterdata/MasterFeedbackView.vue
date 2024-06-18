<script setup>
import konfigurasi from '@/config'
import { useTitle } from '@vueuse/core'
import { useFirestore } from 'vuefire'
import { collection, doc, getDocs, orderBy, updateDoc, where } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { query } from 'firebase/database'

const db = useFirestore()

const feedbacks = ref([])
const modalData = ref([])
const filter = ref('all')

const isLoading = ref(false)
const isModalOpen = ref(false)

const fetchData = async () => {
  isLoading.value = true
  feedbacks.value = []

  let queryFeedback = await getDocs(
    query(collection(db, 'feedback'), orderBy('created_at', 'desc'))
  )

  queryFeedback.forEach((doc) => {
    feedbacks.value.push({ ...doc.data(), doc })
  })

  isLoading.value = false
}

onMounted(async () => {
  await fetchData()
})

const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(feedbacks.value.length / itemsPerPage))
const currentPage = ref(1)

const paginatedFeedback = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return feedbacks.value.slice(startIndex, endIndex)
})

const goToPage = (page) => {
  currentPage.value = page
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString('id-ID')
}

const openModal = (item) => {
  isModalOpen.value = true
  modalData.value = item
}

const closeModal = () => {
  isModalOpen.value = false
  modalData.value = ''
}

const potong = (message) => {
  return message.length > 25 ? message.substr(0, 25) + '...' : message;
};

useTitle(`Data Feedback  - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
      <h1 class="font-bold uppercase font-sans">Data Feedback</h1>
    </div>

    <div class="bg-white p-4 overflow-x-auto">
      <table class="table-auto w-full font-sans">
        <thead>
          <tr>
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Email</th>
            <th class="border px-4 py-2">No HP</th>
            <th class="border px-4 py-2">Nama</th>
            <th class="border px-4 py-2">Subjek</th>
            <th class="border px-4 py-2">Pesan</th>
            <th class="border px-4 py-2">Dikirim pada</th>
            <th class="border px-4 py-2">Aksi</th>
          </tr>
        </thead>

        <tbody v-if="paginatedFeedback.length > 0">
          <tr v-for="(feedback, index) in paginatedFeedback" :key="feedback.id">
            <td class="border px-4 py-2">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="border px-4 py-2">{{ feedback.email }}</td>
            <td class="border px-4 py-2">{{ feedback.phoneNumber }}</td>
            <td class="border px-4 py-2">{{ feedback.name }}</td>
            <td class="border px-4 py-2">{{ potong(feedback.subject) }}</td>
            <td class="border px-4 py-2">{{ potong(feedback.message) }}</td>
            <td class="border px-4 py-2">{{ formatDate(feedback.created_at) }}</td>

            <td class="border px-4 py-2 text-center" v-if="filter != 'Paid'">
              <button
                class="bg-blue-400 px-2 py-1 rounded text-white font-semibold text-[15px]"
                type="button"
                @click="openModal(feedback)"
              >
                Lihat
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-if="paginatedFeedback.length == 0 && !isLoading">
          <tr>
            <td colspan="8" class="border px-4 py-2 text-center">No Data</td>
          </tr>
        </tbody>

        <tbody v-if="isLoading">
          <tr>
            <td colspan="8" class="border px-4 py-2 text-center">Loading Data..</td>
          </tr>
        </tbody>
      </table>

      <div class="font-sans mt-4" v-if="feedbacks.length > 0">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, feedbacks.length) }} data dari
        {{ feedbacks.length }}
      </div>

      <div class="mt-4 flex justify-center font-sans">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
          @click="goToPage(currentPage - 1)"
          v-if="currentPage > 1"
        >
          Previous
        </button>

        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg"
          @click="goToPage(currentPage + 1)"
          v-if="currentPage < totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="backdrop-blur-sm fixed top-0 bottom-0 right-0 left-0 bg-black/50 z-50"
    >
      <div class="flex items-center justify-center h-full">
        <div class="mx-4 lg:mx-0 w-full md:w-1/2">
          <div class="bg-gray-200 px-4 py-2 rounded-tl rounded-tr flex justify-between border-b">
            <h1 class="font-bold font-sans text-[16px]">Lihat Feedback {{ modalData.name }}</h1>

            <button type="button" class="font-sans text-gray-800 font-bold" @click="closeModal">
              X
            </button>
          </div>

          <div class="p-2 bg-white w-full min-h-fit max-h-[75vh] overflow-y-auto max-w-full">
            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="email">Email</label>
              <input
                id="email"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                :value="modalData.email"
                disabled
              />
            </div>

            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="nohp">No HP</label>
              <input
                id="nohp"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                :value="modalData.phoneNumber"
                disabled
              />
            </div>

            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="name">Nama</label>
              <input
                id="name"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                :value="modalData.name"
                disabled
              />
            </div>

            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="subject"
                >Subjek</label
              >
              <input
                id="subject"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                :value="modalData.subject"
                disabled
              />
            </div>

            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="message">Pesan</label>
              <textarea
                id="message"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1 resize-none"
                rows="5"
                :value="modalData.message"
                disabled
              ></textarea>
            </div>

            <div class="mb-2">
              <label class="font-medium uppercase text-[14px] font-sans" for="created_at"
                >Dikirim pada</label
              >
              <input
                id="created_at"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                :value="formatDate(modalData.created_at)"
                disabled
              />
            </div>
          </div>

          <div class="bg-white rounded-bl rounded-br border-t px-4 py-2">
            <button
              class="bg-gray-500 rounded text-white px-2 py-1 font-sans text-[15px]"
              @click="closeModal"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
