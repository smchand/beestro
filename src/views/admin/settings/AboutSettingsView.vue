<script>
export default {
  name: 'About Settings'
}
</script>

<script setup>
import { useTitle } from '@vueuse/core'
import konfigurasi from '@/config'

import { onMounted, ref } from 'vue'
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const isSaving = ref(false)
const kataSambutan = ref('')
const jamBuka = ref({
  senin: '',
  selasa: '',
  rabu: '',
  kamis: '',
  jumat: '',
  sabtu: '',
  minggu: ''
})

const db = useFirestore()
const settingsRef = collection(db, 'settings')

const queryKataSambutan = query(settingsRef, where('key', '==', 'about::kata_sambutan'))
const queryJamBuka = query(settingsRef, where('key', '==', 'about::jam_buka'))

onMounted(async () => {
  const queryJamBukaSnapshot = await getDocs(queryJamBuka)
  if (!queryJamBukaSnapshot.empty) {
    jamBuka.value = queryJamBukaSnapshot.docs[0].data().value
  }

  const queryKataSambutanSnapshot = await getDocs(queryKataSambutan)
  if (!queryKataSambutanSnapshot.empty) {
    kataSambutan.value = queryKataSambutanSnapshot.docs[0].data().value
  }
})

const simpanData = async () => {
  isSaving.value = true

  const batch = writeBatch(db)
  try {
    batch.set(doc(settingsRef, 'about::kata_sambutan'), {
      key: 'about::kata_sambutan',
      value: kataSambutan.value
    })

    batch.set(doc(settingsRef, 'about::jam_buka'), {
      key: 'about::jam_buka',
      value: jamBuka.value
    })

    isSaving.value = false
    alert('Data berhasil disimpan')
  } catch (err) {
    isSaving.value = false
    alert('Gagal menyimpan data')
  }
}

useTitle(`Pengaturan Tentang Kami - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
      <h1 class="font-bold uppercase font-sans">Pengaturan Tentang Kami</h1>
    </div>

    <div class="bg-white">
      <div class="p-4 border-b">
        <label for="kata_sambutan" class="font-sans font-medium">Kata Sambutan</label>

        <textarea
          v-model="kataSambutan"
          id="kata_sambutan"
          type="text"
          class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1 mt-1 resize-none"
          rows="5"
        ></textarea>
      </div>

      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">JAM BUKA</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="">
            <label for="senin" class="font-sans font-medium">Senin</label>

            <input
              id="senin"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['senin']"
            />
          </div>

          <div class="">
            <label for="selasa" class="font-sans font-medium">Selasa</label>

            <input
              id="selasa"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['selasa']"
            />
          </div>

          <div class="">
            <label for="rabu" class="font-sans font-medium">Rabu</label>

            <input
              id="rabu"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['rabu']"
            />
          </div>

          <div class="">
            <label for="kamis" class="font-sans font-medium">Kamis</label>

            <input
              id="kamis"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['kamis']"
            />
          </div>

          <div class="">
            <label for="jumat" class="font-sans font-medium">Jumat</label>

            <input
              id="jumat"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['jumat']"
            />
          </div>

          <div class="">
            <label for="sabtu" class="font-sans font-medium">Sabtu</label>

            <input
              id="sabtu"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['sabtu']"
            />
          </div>

          <div class="">
            <label for="minggu" class="font-sans font-medium">Minggu</label>

            <input
              id="minggu"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="jamBuka['minggu']"
            />
          </div>
        </div>
      </div>

      <div class="border-t p-4">
        <button
          :class="`bg-blue-500 px-4 py-2 font-sans font-medium text-white rounded-lg disabled:bg-blue-300`"
          @click="simpanData()"
          :disabled="isSaving"
        >
          {{ isSaving ? `Loading` : `Simpan` }}
        </button>
      </div>
    </div>
  </main>
</template>