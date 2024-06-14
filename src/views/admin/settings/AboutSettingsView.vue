<script>
export default {
  name: 'About Settings'
}
</script>

<script setup>
import { useTitle } from '@vueuse/core'
import konfigurasi from '@/config'

import { onMounted, ref } from 'vue'
import { collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const isSaving = ref(false)
const kataSambutan = ref('')

const db = useFirestore()
const settingsRef = collection(db, 'settings')

const queryKataSambutan = query(settingsRef, where('key', '==', 'about::kata_sambutan'))

onMounted(async () => {
  const queryKataSambutanSnapshot = await getDocs(queryKataSambutan)
  if (!queryKataSambutanSnapshot.empty) {
    kataSambutan.value = queryKataSambutanSnapshot.docs[0].data().value
  }
})

const simpanData = async () => {
  isSaving.value = true
  
  try {
    await setDoc(doc(db, 'settings', 'about::kata_sambutan'), {
      key: 'about::kata_sambutan',
      value: kataSambutan.value
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
