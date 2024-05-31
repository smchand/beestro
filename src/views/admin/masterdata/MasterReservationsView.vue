<script setup>
import konfigurasi from '@/config'
import { useTitle } from '@vueuse/core'
import { useFirestore } from 'vuefire'
import { collection, doc, getDocs, orderBy, updateDoc, where } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { query } from 'firebase/database'

const db = useFirestore()

const reservations = ref([])
const modalData = ref([])
const filter = ref('all')

const isLoading = ref(false)
const isModalOpen = ref(false)
const isAccepting = ref(false)

const fetchData = async () => {
  isLoading.value = true
  reservations.value = []

  let queryReservations = await getDocs(
    query(collection(db, 'reservations'), orderBy('status', 'desc'))
  )

  if (filter.value != 'all') {
    queryReservations = await getDocs(
      query(
        collection(db, 'reservations'),
        where('status', '==', filter.value),
        orderBy('bookedDate', 'desc')
      )
    )
  }

  queryReservations.forEach((doc) => {
    reservations.value.push({ ...doc.data(), doc })
  })

  isLoading.value = false
}

onMounted(async () => {
  await fetchData()
})

const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(reservations.value.length / itemsPerPage))
const currentPage = ref(1)

const paginatedReservations = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return reservations.value.slice(startIndex, endIndex)
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

const chooseFilter = async (val) => {
  filter.value = val

  await fetchData()
}

const acceptPayment = async (item) => {
  isAccepting.value = true

  const reservationRef = doc(db, 'reservations', item.doc.id)
  await updateDoc(reservationRef, {
    status: 'Paid'
  })

  isAccepting.value = false
  closeModal()

  alert(`Berhasil`)

  await fetchData()
}

useTitle(`Data Reservasi  - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <div class="space-x-2 mb-2">
      <label class="font-sans font-bold mr-2">Status Pembayaran:</label>
      <button
        :class="`bg-blue-500 text-white font-sans px-4 py-1 font-bold rounded disabled:cursor-not-allowed [&.active]:bg-blue-400 ${
          filter == 'all' ? 'active' : ''
        }`"
        :disabled="filter == 'all'"
        @click="chooseFilter('all')"
      >
        Semua
      </button>

      <button
        :class="`bg-blue-500 text-white font-sans px-4 py-1 font-bold rounded disabled:cursor-not-allowed [&.active]:bg-blue-400 ${
          filter == 'Unpaid' ? 'active' : ''
        }`"
        :disabled="filter == 'Unpaid'"
        @click="chooseFilter('Unpaid')"
      >
        Unpaid
      </button>

      <button
        :class="`bg-blue-500 text-white font-sans px-4 py-1 font-bold rounded disabled:cursor-not-allowed [&.active]:bg-blue-400 ${
          filter == 'Paid' ? 'active' : ''
        }`"
        :disabled="filter == 'Paid'"
        @click="chooseFilter('Paid')"
      >
        Paid
      </button>
    </div>

    <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
      <h1 class="font-bold uppercase font-sans">Data Reservasi</h1>
    </div>

    <div class="bg-white p-4 overflow-x-auto">
      <table class="table-auto w-full font-sans">
        <thead>
          <tr>
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Email</th>
            <th class="border px-4 py-2">Nama</th>
            <th class="border px-4 py-2">Jumlah Orang</th>
            <th class="border px-4 py-2">Nomor Telepon</th>
            <th class="border px-4 py-2">Waktu Dipesan</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2 w-10" v-if="filter != 'Paid'">Lihat Bukti Transfer</th>
          </tr>
        </thead>

        <tbody v-if="paginatedReservations.length > 0">
          <tr v-for="(reservation, index) in paginatedReservations" :key="reservation.id">
            <td class="border px-4 py-2">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="border px-4 py-2">{{ reservation.email }}</td>
            <td class="border px-4 py-2">{{ reservation.name }}</td>
            <td class="border px-4 py-2">{{ reservation.numberOfPeople }}</td>
            <td class="border px-4 py-2">{{ reservation.phoneNumber }}</td>
            <td class="border px-4 py-2">
              {{ formatDate(reservation.bookedDate) }} - {{ reservation.bookedTime }}
            </td>
            <td class="border px-4 py-2">{{ reservation.status }}</td>
            <td class="border px-4 py-2 text-center" v-if="filter != 'Paid'">
              <button
                class="bg-blue-400 px-2 py-1 rounded text-white font-semibold text-[15px]"
                type="button"
                @click="openModal(reservation)"
              >
                Lihat
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-if="paginatedReservations.length == 0 && !isLoading">
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

      <div class="font-sans mt-4" v-if="reservations.length > 0">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, reservations.length) }} data dari
        {{ reservations.length }}
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
        <div class="mx-4 lg:mx-0">
          <div class="bg-gray-200 px-4 py-2 rounded-tl rounded-tr flex justify-between border-b">
            <h1 class="font-bold font-sans text-[16px]">Bukti Pembayaran {{ modalData.name }}</h1>

            <button type="button" class="font-sans text-gray-800 font-bold" @click="closeModal">
              X
            </button>
          </div>

          <div class="p-2 bg-white w-full min-h-fit max-h-[75vh] overflow-y-auto max-w-full">
            <img :src="modalData.paymentProof" alt="" class="object-cover w-full" />
          </div>

          <div class="bg-white rounded-bl rounded-br border-t px-4 py-2">
            <button
              class="bg-green-500 rounded text-white px-2 py-1 font-sans mr-2 text-[15px] disabled:bg-green-300"
              @click="acceptPayment(modalData)"
              v-if="modalData.status != 'Paid'"
              :disabled="isAccepting"
            >
              {{ isAccepting ? `Loading` : `Terima Pembayaran` }}
            </button>

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