<script>
export default {
  name: 'Homepage Settings'
}
</script>

<script setup>
import { useTitle } from '@vueuse/core'
import konfigurasi from '@/config'

import { computed, onMounted, ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore'

const isSaving = ref(false)
const discoverText = ref('')
const banners = ref([{ image: '', caption: '' }])
const chefRecommendation = ref([{ image: '' }, { image: '' }, { image: '' }, { image: '' }])
const middleImage = ref([{ image: '' }, { image: '' }])
const bottomImage = ref([{ image: '' }, { image: '' }])

const db = useFirestore()
const settingsRef = collection(db, 'settings')

const queryBanner = query(settingsRef, where('key', '==', 'homepage::banner'))
const queryDiscover = query(settingsRef, where('key', '==', 'homepage::discover_text'))
const queryChefRecommendation = query(
  settingsRef,
  where('key', '==', 'homepage::chef_recommendation')
)
const queryMiddleImage = query(settingsRef, where('key', '==', 'homepage::middle_image'))
const queryBottomImage = query(settingsRef, where('key', '==', 'homepage::bottom_image'))

// LOAD DATA
onMounted(async () => {
  const queryBannerSnapshot = await getDocs(queryBanner)
  if (!queryBannerSnapshot.empty) {
    banners.value = queryBannerSnapshot.docs[0].data().value
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
// END LOAD DATA

// BANNER
const tambahFieldBanner = () => {
  banners.value.push({ image: '', caption: '' })
}

const hapusFieldBanner = (index) => {
  const temp = [...banners.value]

  temp.splice(index, 1)
  banners.value = [...temp]
}
// END BANNER

const simpanData = async () => {
  isSaving.value = true

  const batch = writeBatch(db)

  try {
    batch.set(doc(settingsRef, 'homepage::banner'), {
      key: 'homepage::banner',
      value: banners.value
    })

    batch.set(doc(settingsRef, 'homepage::discover_text'), {
      key: 'homepage::discover_text',
      value: discoverText.value
    })

    batch.set(doc(settingsRef, 'homepage::chef_recommendation'), {
      key: 'homepage::chef_recommendation',
      value: chefRecommendation.value
    })

    batch.set(doc(settingsRef, 'homepage::middle_image'), {
      key: 'homepage::middle_image',
      value: middleImage.value
    })

    batch.set(doc(settingsRef, 'homepage::bottom_image'), {
      key: 'homepage::bottom_image',
      value: bottomImage.value
    })

    await batch.commit()

    isSaving.value = false
    alert('Data berhasil disimpan')
  } catch (error) {
    isSaving.value = false
    alert('Gagal menyimpan data')
  }
}

useTitle(`Pengaturan Homepage - ${konfigurasi.app.name}`)
</script>

<template>
  <div class="">
    <div class="bg-white/60 px-4 py-2 rounded-tl-lg rounded-tr-lg">
      <h1 class="font-bold uppercase font-sans">Pengaturan Homepage</h1>
    </div>

    <div class="bg-white">
      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">BANNER</h1>

        <div v-for="(banner, index) in banners" :key="index">
          <div class="grid grid-cols-1 lg:grid-cols-5 mb-4 gap-4">
            <div class="col-span-2">
              <label :for="`input_url_gambar_${index}`" class="font-sans font-medium">
                URL Gambar Banner {{ index + 1 }}
              </label>

              <input
                :id="`input_url_gambar_${index}`"
                type="text"
                class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="banners[index].image"
              />
            </div>

            <div class="col-span-2">
              <label :for="`input_caption_${index}`" class="font-sans font-medium">
                Caption Banner {{ index + 1 }}
              </label>

              <input
                :id="`input_caption_${index}`"
                type="text"
                class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
                v-model="banners[index].caption"
              />
            </div>

            <div class="block" v-if="index > 0">
              <label :for="`btn_delete_field_${index}`" class="font-sans font-medium">
                Hapus Banner {{ index }}
              </label>

              <button
                :id="`btn_delete_field_${index}`"
                @click="hapusFieldBanner(index)"
                class="bg-red-500 text-white px-2 rounded-lg py-1 font-sans font-medium w-full"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>

        <button
          @click="tambahFieldBanner()"
          class="bg-gray-600/10 px-2 rounded-lg py-1 font-sans font-medium mt-2"
        >
          Tambah Field Banner
        </button>
      </div>

      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">DISCOVER TEXT</h1>

        <div class="">
          <textarea
            type="text"
            class="w-full font-sans border-gray-300 border-2 rounded-lg outline-none px-2 py-1 resize-none"
            rows="5"
            v-model="discoverText"
          ></textarea>
        </div>
      </div>

      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">4 GAMBAR CHEF RECOMMENDATION</h1>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_recommendation_1" class="font-sans font-medium">
              URL Gambar Recommendation 1
            </label>

            <input
              id="input_url_recommendation_1"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="chefRecommendation[0].image"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_recommendation_2" class="font-sans font-medium">
              URL Gambar Recommendation 2
            </label>

            <input
              id="input_url_recommendation_2"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="chefRecommendation[1].image"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_recommendation_3" class="font-sans font-medium">
              URL Gambar Recommendation 3
            </label>

            <input
              id="input_url_recommendation_3"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="chefRecommendation[2].image"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 mb-4 gap-4">
          <div class="col-span-2">
            <label for="input_url_recommendation_4" class="font-sans font-medium">
              URL Gambar Recommendation 4
            </label>

            <input
              id="input_url_recommendation_4"
              type="text"
              class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
              v-model="chefRecommendation[3].image"
            />
          </div>
        </div>
      </div>

      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">2 GAMBAR TENGAH</h1>

        <div class="mb-4">
          <label for="input_middle_image_1" class="font-sans font-medium">
            URL Gambar Tengah 1
          </label>

          <input
            id="input_middle_image_1"
            type="text"
            class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
            v-model="middleImage[0].image"
          />
        </div>

        <div class="">
          <label for="input_middle_image_2" class="font-sans font-medium">
            URL Gambar Tengah 2
          </label>

          <input
            id="input_middle_image_2"
            type="text"
            class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
            v-model="middleImage[1].image"
          />
        </div>
      </div>

      <div class="p-4 border-b">
        <h1 class="font-sans font-semibold text-[18px] mb-2">2 GAMBAR BAWAH</h1>

        <div class="mb-4">
          <label for="input_gambar_bawah_1" class="font-sans font-medium">
            URL Gambar Bawah 1
          </label>

          <input
            id="input_gambar_bawah_1"
            type="text"
            class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
            v-model="bottomImage[0].image"
          />
        </div>

        <div class="">
          <label for="input_gambar_bawah_2" class="font-sans font-medium">
            URL Gambar Bawah 2
          </label>

          <input
            id="input_gambar_bawah_2"
            type="text"
            class="w-full font-sans border-gray-300 focus:border-blue-500 border-2 rounded-lg outline-none px-2 py-1"
            v-model="bottomImage[1].image"
          />
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