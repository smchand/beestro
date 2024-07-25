<script>
export default {
  name: 'General Settings'
}
</script>

<script setup>
import { useTitle } from '@vueuse/core'
import konfigurasi from '@/config'

import { onMounted, ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

const isSaving = ref(false)
const list = ref([
  { instagram: '' },
  { tiktok: '' },
  { kontak: '' },
  { alamat: '' },
  { qris: '' }
]);

const db = useFirestore()

// LOAD DATA
onMounted(async () => {
  const queryGeneral = await getDocs(
    query(collection(db, 'settings'), where('key', '==', 'general::metadatas'))
  )

  if (!queryGeneral.empty) {
    list.value = queryGeneral.docs[0].data().value
  }
})
// END LOAD DATA

const errors = ref({ 
  list: {
    instagram: "",
    tiktok: "",
    kontak: "",
    alamat: "",
    qris: ""
  }
});

const validateList = () => {
  console.log("Validating list..."); // Logging untuk memeriksa proses validasi

  // Reset pesan kesalahan untuk setiap field dalam list
  errors.value.list = {
    instagram: "",
    tiktok: "",
    kontak: "",
    alamat: "",
    qris: ""
  };

  // Memeriksa setiap field dalam list
  list.value.forEach(item => {
    for (const key in item) {
      if (item.hasOwnProperty(key) && !item[key].trim()) {
        errors.value.list[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} tidak boleh kosong.`;
      }
    }
  });

  // Log hasil validasi
  console.log("Validation result for list:", errors.value.list);
};


const simpanData = async () => {
  isSaving.value = true
  validateList();
   if(Object.values(errors.value.list).every(error => !error)){
    try {
      await setDoc(doc(db, 'settings', 'general::metadatas'), {
        key: 'general::metadatas',
        value: list.value
      })

      isSaving.value = false
      alert('Data berhasil disimpan')
    } catch (error) {
      isSaving.value = false
      alert('Gagal menyimpan data')
    }
  }else{
    isSaving.value = false;
  }
}

useTitle(`Pengaturan Umum - ${konfigurasi.app.name}`)
</script>

<template>
  <div class="">
    <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
      <h1 class="font-bold uppercase font-sans">Pengaturan Umum</h1>
    </div>

    <div class="bg-white">
      <div class="p-4 border-b">
        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_instagram" class="font-sans font-medium"> URL Instagram </label>

            <input
              id="input_url_instagram"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="list[0].instagram"
              placeholder="https://instagram.com/example"
            />
            <small
            class="text-red-500 font-sans text-[15px]"
            v-if="errors.list.instagram"
            >
            {{ errors.list.instagram }}
            </small>
          </div>
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_tiktok" class="font-sans font-medium"> URL TikTok </label>

            <input
              id="input_url_tiktok"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="list[1].tiktok"
              placeholder="https://tiktok.com/example"
            />
            <small
            class="text-red-500 font-sans text-[15px]"
            v-if="errors.list.tiktok"
            >
            {{ errors.list.tiktok }}
            </small>
          </div>
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_nomor_hp" class="font-sans font-medium"> Kontak (Nomor HP) </label>

            <input
              id="input_nomor_hp"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="list[2].kontak"
              placeholder="+621 232323"
            />
            <small
            class="text-red-500 font-sans text-[15px]"
            v-if="errors.list.kontak"
            >
            {{ errors.list.kontak }}
            </small>
          </div>
          
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_alamat" class="font-sans font-medium"> Alamat </label>

            <input
              id="input_alamat"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="list[3].alamat"
              placeholder="Kebon Sirih"
            />
            <small
            class="text-red-500 font-sans text-[15px]"
            v-if="errors.list.alamat"
            >
            {{ errors.list.alamat }}
            </small>
          </div>
          
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_gambar_qris" class="font-sans font-medium"> URL Gambar QRIS </label>

            <input
              id="input_gambar_qris"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="list[4].qris"
              placeholder="https://cdn.example.com/example-qris.jpg"
            />
             <small
            class="text-red-500 font-sans text-[15px]"
            v-if="errors.list.qris"
            >
            {{ errors.list.qris }}
            </small>
          </div>
           
        </div>
      </div>

      <div class="p-4">
        <button
          :class="`bg-blue-500 px-4 py-2 font-sans font-medium text-white rounded-lg disabled:bg-blue-300`"
          @click="simpanData()"
          :disabled="isSaving"
        >
          {{ isSaving ? `Loading` : `Simpan` }}
        </button>
      </div>
    </div>
  </div>
</template>