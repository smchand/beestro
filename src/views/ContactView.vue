<script setup>
// import logo dan konfigurasi website
import Logo from '@/components/icons/Logo.vue'
import konfigurasi from '@/config.js'

import { onMounted, ref } from 'vue'
import { useTitle } from '@vueuse/core'
import { useFirestore } from 'vuefire'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

const name = ref('')
const email = ref('')
const phoneNumber = ref('')
const subject = ref('')
const message = ref('')

const isSaving = ref(false)
const isDone = ref(false)

const errors = ref({
  name: '',
  email: '',
  phoneNumber: '',
  subject: '',
  message: ''
})

const db = useFirestore()

const simpanData = async () => {
  isSaving.value = true

  errors.value = {
    name: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: ''
  }

  if (!name.value) errors.value.name = 'Name cannot empty'
  if (!email.value) errors.value.email = 'Email cannot empty'
  if (!phoneNumber.value) errors.value.phoneNumber = 'Phone Number cannot empty'
  if (phoneNumber.value.length < 10)
    errors.value.phoneNumber = 'Phone Number must have minimal 10 digits'

  if (phoneNumber.value) {
    if (phoneNumber.value.length < 10)
      errors.value.phoneNumber = 'Phone Number must have at least 10 digits'

    const phoneNumberPattern = /^(628|08)/
    if (!phoneNumberPattern.test(phoneNumber.value))
      errors.value.phoneNumber = 'Phone Number must start with 628 or 08'
  }

  if (!subject.value) errors.value.subject = 'Subject cannot empty'
  if (!message.value) errors.value.message = 'Message cannot empty'

  if (
    errors.value.name == '' &&
    errors.value.email == '' &&
    errors.value.phoneNumber == '' &&
    errors.value.subject == '' &&
    errors.value.message == ''
  ) {
    const createdAt = Timestamp.fromDate(new Date())

    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const uniqueIdentifier = `${yyyy}-${mm}-${dd}`

    try {
      await setDoc(doc(db, 'feedback', `CONTACTUS-${uniqueIdentifier}-${name.value}-${Math.floor(dd + Math.random() * mm * 1000)}`), {
        name: name.value,
        email: email.value,
        phoneNumber: phoneNumber.value,
        subject: subject.value,
        message: message.value,
        created_at: createdAt
      })

      isDone.value = true
      isSaving.value = false
    } catch (err) {
      isSaving.value = false
      alert('Error, please refresh this page')
    }
  } else {
    isSaving.value = false
    isDone.value = false
  }
}

const close = () => {
  window.location.reload()
}

useTitle(`Contact Us - ${konfigurasi.app.name}`)
</script>

<template>
  <main>
    <section class="bg-[#101010] text-white">
      <div class="w-full px-4 py-12 md:w-1/2 md:px-0 md:mx-auto">
        <div class="text-center">
          <h1 class="font-antique font-bold text-[28px]">Contact Us</h1>

          <p class="font-rosario text-[18px]">
            Feedback is our fuel to grow much more
          </p>
        </div>

        <form method="POST" class="mt-6 space-y-4" @submit.prevent="simpanData()">
          <div class="space-y-1">
            <label for="name" class="font-rosario text-[20px]">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              v-model="name"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="John Doe"
            />

            <small class="text-red-500 font-sans text-[15px]" v-if="errors.name">
              {{ errors.name }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="email" class="font-rosario text-[20px]">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              v-model="email"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="JohnDoe@gmail.com"
            />

            <small class="text-red-500 font-sans text-[15px]" v-if="errors.email">
              {{ errors.email }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="phone" class="font-rosario text-[20px]">Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              v-model="phoneNumber"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="08xx or 628xx"
            />

            <small class="text-red-500 font-sans text-[15px]" v-if="errors.phoneNumber">
              {{ errors.phoneNumber }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="subject" class="font-rosario text-[20px]">Subject</label>
            <input
              type="text"
              name="subject"
              id="subject"
              v-model="subject"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="Enter Subject"
            />

            <small class="text-red-500 font-sans text-[15px]" v-if="errors.subject">
              {{ errors.subject }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="message" class="font-rosario text-[20px]">Message</label>
            <textarea
              name="message"
              id="message"
              v-model="message"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              rows="8"
              placeholder="Type a message"
            ></textarea>

            <small class="text-red-500 font-sans text-[15px]" v-if="errors.message">
              {{ errors.message }}
            </small>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="bg-[#DBAD39] px-8 py-2 rounded-[3px] font-rosario text-[20px]"
              :disabled="isSaving"
            >
              {{ isSaving ? `Loading` : `Submit` }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <div v-if="isDone" class="fixed inset-0 flex items-center justify-center">
      <div
        class="bg-black/50 backdrop-blur-md h-full absolute top-0 right-0 bottom-0 left-0 z-10"
      ></div>

      <div
        class="h-full flex items-start md:items-center justify-center z-50 relative overflow-y-auto"
      >
        <div
          class="bg-black/80 w-full max-w-4xl mx-auto z-50 relative p-4 rounded-lg text-white grid grid-cols-1 md:grid-cols-2"
        >
          <div class="col-span-2 px-6 py-4">
            <button type="button" @click="close()" class="text-4xl absolute right-3 top-0">
              &times;
            </button>

            <div class="text-center">
              <h1 class="font-bold text-2xl">Thank You</h1>
              <p class="mt-1 text-[16px]">Thanks for your feedback!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
