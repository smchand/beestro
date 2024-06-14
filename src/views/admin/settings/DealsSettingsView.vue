<script>
export default {
  name: 'Deals and Events Settings'
}
</script>

<script setup>
import { useTitle } from '@vueuse/core'
import konfigurasi from '@/config'
import { computed, onMounted, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const tab = ref({ slug: 'deals', title: 'Deals' })
const list = ref([])

const db = useFirestore()

const isModalOpen = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const inputData = ref({ title: '', image: '', description: '', date: '', slug: tab.value.slug })
const errors = ref({ title: '', image: '', description: '', date: '' })

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
    list.value.push({ id: doc.id, ...doc.data() })
  })

  isLoading.value = false
}

onMounted(async () => {
  await fetchData()
})

const itemsPerPage = 8
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

const openModal = () => {
  errors.value = { title: '', image: '', description: '', date: '' }
  inputData.value = { title: '', image: '', description: '', date: '', slug: tab.value.slug }
  isModalOpen.value = true
  isEdit.value = false
  editId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
}

const editData = (item) => {
  errors.value = { title: '', image: '', description: '', date: '' }
  inputData.value = { ...item }
  isModalOpen.value = true
  isEdit.value = true
  editId.value = item.id
}

const simpanData = async () => {
  isSaving.value = true
  errors.value = { title: '', image: '', description: '', date: '' }

  if (!inputData.value.title) errors.value.title = 'Title tidak boleh kosong'
  if (!inputData.value.image) errors.value.image = 'URL Gambar tidak boleh kosong'
  if (!inputData.value.description) errors.value.description = 'Deskripsi tidak boleh kosong'
  if (!inputData.value.date) errors.value.date = 'Tanggal tidak boleh kosong'

  if (
    errors.value.title == '' &&
    errors.value.image == '' &&
    errors.value.description == '' &&
    errors.value.date == ''
  ) {
    try {
      if (isEdit.value) {
        const docRef = doc(db, 'deals_events', editId.value)
        await updateDoc(docRef, inputData.value)
      } else {
        await addDoc(collection(db, 'deals_events'), inputData.value)
      }
      await fetchData()

      isModalOpen.value = false
      isSaving.value = false
    } catch (err) {
      alert('Terjadi kesalahan, silahkan refresh halaman ini')
      isModalOpen.value = false
      isSaving.value = false
    }
  } else {
    isSaving.value = false
  }
}

const hapus = async (item) => {
  if (confirm(`Apakah anda yakin?`)) {
    try {
      const docRef = doc(db, 'deals_events', item.id)
      await deleteDoc(docRef)
      await fetchData()
    } catch (error) {
      alert(`Gagal menghapus data: ${error}`)
    }
  }
}

useTitle(`Pengaturan Deals & Events - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <div class="space-x-2 mb-2">
      <label class="font-sans font-bold mr-2">Kategori:</label>
      <button
        :class="`bg-blue-500 text-white font-sans px-4 py-1 font-bold rounded disabled:cursor-not-allowed [&.active]:bg-blue-400 ${
          tab.slug == 'deals' ? 'active' : ''
        }`"
        :disabled="tab.slug == 'deals'"
        @click="switchTab({ slug: 'deals', title: 'Deals' })"
      >
        Deals
      </button>

      <button
        :class="`bg-blue-500 text-white font-sans px-4 py-1 font-bold rounded disabled:cursor-not-allowed [&.active]:bg-blue-400 ${
          tab.slug == 'events' ? 'active' : ''
        }`"
        :disabled="tab.slug == 'events'"
        @click="switchTab({ slug: 'events', title: 'Events' })"
      >
        Events
      </button>
    </div>

    <div>
      <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
        <h1 class="font-bold uppercase font-sans">Pengaturan {{ tab.title }}</h1>
      </div>

      <div class="bg-white px-4 py-4">
        <button
          class="bg-blue-500 text-white font-sans text-[14px] px-2 py-1 font-bold rounded mb-4"
          type="button"
          @click="openModal"
        >
          Tambah {{ tab.title }}
        </button>

        <div class="font-sans" v-if="isLoading">Loading Data</div>
        <div class="font-sans" v-else-if="!isLoading && list.length == 0">Tidak ada data</div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4" v-if="!isLoading">
          <div v-for="(data, index) in paginatedItems" :key="index">
            <div class="">
              <img :src="data.image" :alt="data.title" />

              <div class="mt-2">
                <h1 class="font-sans font-bold">{{ data.title }}</h1>
                <p class="font-sans font-medium text-[14px]">{{ data.description }}</p>
                <p class="font-sans font-medium text-[13px]">{{ data.date }}</p>
                <button
                  @click="hapus(data)"
                  type="button"
                  class="underline text-blue-600 text-[13px] font-sans mr-2"
                >
                  Hapus
                </button>
                <button
                  @click="editData(data)"
                  type="button"
                  class="underline text-blue-600 text-[13px] font-sans"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="font-sans mt-4" v-if="!isLoading && list.length > 0">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, list.length) }} data dari
          {{ list.length }}
        </div>

        <div class="mt-4 flex justify-start font-sans" v-if="!isLoading">
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
    </div>

    <div
      v-if="isModalOpen"
      class="backdrop-blur-sm fixed top-0 bottom-0 right-0 left-0 bg-black/50"
    >
      <div class="flex items-center justify-center h-full">
        <form @submit.prevent="simpanData" class="mx-4 lg:mx-0 w-[450px] max-w-[450px]">
          <div class="bg-gray-200 px-4 py-2 rounded-tl rounded-tr flex justify-between border-b">
            <h1 class="font-bold font-sans text-[16px]">
              {{ isEdit ? 'Edit' : 'Tambah' }} {{ tab.title }}
            </h1>

            <button type="button" class="font-sans text-gray-800 font-bold" @click="closeModal">
              X
            </button>
          </div>

          <div class="p-4 bg-white min-h-fit max-h-[75vh] overflow-y-auto space-y-4">
            <div class="font-sans">
              <label for="event">Title</label>
              <input
                id="event"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="inputData.title"
              />

              <small class="text-red-500 font-sans text-[15px]" v-if="errors.title">
                {{ errors.title }}
              </small>
            </div>

            <div class="font-sans">
              <label for="image_url">Image URL</label>
              <input
                id="image_url"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="inputData.image"
              />

              <small class="text-red-500 font-sans text-[15px]" v-if="errors.image">
                {{ errors.image }}
              </small>
            </div>

            <div class="font-sans">
              <label for="description">Description</label>
              <input
                id="description"
                type="text"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="inputData.description"
              />

              <small class="text-red-500 font-sans text-[15px]" v-if="errors.description">
                {{ errors.description }}
              </small>
            </div>

            <div class="font-sans">
              <label for="date">Date</label>
              <input
                id="date"
                type="date"
                class="mt-1 w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="inputData.date"
              />

              <small class="text-red-500 font-sans text-[15px]" v-if="errors.date">
                {{ errors.date }}
              </small>
            </div>
          </div>

          <div class="bg-white rounded-bl rounded-br border-t px-4 py-2">
            <button
              type="submit"
              class="bg-green-500 rounded text-white px-2 py-1 font-sans mr-2 text-[15px] disabled:bg-green-400"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Loading' : 'Simpan' }}
            </button>

            <button
              class="bg-gray-500 rounded text-white px-2 py-1 font-sans text-[15px] disabled:bg-gray-400"
              @click="closeModal"
              :disabled="isSaving"
            >
              Tutup
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>
