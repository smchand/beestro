<script setup>
// import logo dan konfigurasi website
import Logo from "@/components/icons/Logo.vue";
import konfigurasi from "@/config.js";

import base64 from "@/helpers/base64.js";
import { onMounted, ref, computed, watch } from "vue";
import { useTitle } from "@vueuse/core";
import { useFirestore } from "vuefire";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const qris = ref("");

const name = ref("");
const email = ref("");
const numberOfPeople = ref("");
const phoneNumber = ref("");
const bookedDate = ref("");
const bookedTime = ref("");
const paymentProof = ref("");
const startTime = ref("10:00");
const endTime = ref("20:00");
const tomorrow = ref("");
const isModalOpen = ref(false);
const isSaving = ref(false);
const isDone = ref(false);

const errors = ref({
  name: "",
  email: "",
  numberOfPeople: "",
  phoneNumber: "",
  bookedDate: "",
  bookedTime: "",
});

const db = useFirestore();

const disabledDates = ref([]);

onMounted(async () => {
  const queryGeneral = await getDocs(
    query(collection(db, "settings"), where("key", "==", "general::metadatas"))
  );

  if (!queryGeneral.empty) {
    qris.value = queryGeneral.docs[0].data().value;
  }

  const date = new Date();
  date.setDate(date.getDate() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  tomorrow.value = `${yyyy}-${mm}-${dd}`;

  disabledDates.value = await getFullyBookedDates();
  console.log("Disabled Dates:", disabledDates.value);
});


const today = new Date();
today.setHours(0, 0, 0, 0); 

async function getFullyBookedDates() {
  const reservations = await getDocs(
    query(
      collection(db, "reservations"),
      where("status", "==", "Confirmed"),
      where("bookedDate", ">", Timestamp.fromDate(today))
    )
  );
  // console.log("Confirmed Reservations:", reservations.size); 
  const dateCounts = {};

  reservations.forEach(doc => {
    const data = doc.data();
    const bookedDate = data.bookedDate?.toDate?.().toISOString().split('T')[0];
    const numberOfPeople = parseInt(data.numberOfPeople, 10);

    if (bookedDate && !isNaN(numberOfPeople)) {
    
      const formattedDate = new Date(data.bookedDate.toDate()).toISOString().split('T')[0];
      dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + numberOfPeople;
    }
  });

  const disabledDates = Object.keys(dateCounts).filter(date => dateCounts[date] >= 70);
  
  return disabledDates;
}

const disabledDatesHandler = (date) => {
  const formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  // console.log("Checking date: ", formattedDate);
  return disabledDates.value.includes(formattedDate);
};

const amount = computed(() => {
  const numPeople = parseInt(numberOfPeople.value) || 0;
  return numPeople > 5 ? numPeople * 100000 : numPeople * 50000;
});

const formattedAmount = computed(() => {
  return amount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});


const simpanData = async () => {
  isSaving.value = true;

  errors.value = {
    name: "",
    email: "",
    numberOfPeople: "",
    phoneNumber: "",
    bookedDate: "",
    bookedTime: "",
  };

  if (!name.value) errors.value.name = "Name cannot empty";
  if (!email.value) errors.value.email = "Email cannot empty";
  if (!numberOfPeople.value)
    errors.value.numberOfPeople = "Number Of People cannot empty";
  if (!phoneNumber.value)
    errors.value.phoneNumber = "Phone Number cannot empty";
  if (phoneNumber.value.length < 10)
    errors.value.phoneNumber = "Phone Number must have minimal 10 digits";

  if (phoneNumber.value) {
    if (phoneNumber.value.length < 10)
      errors.value.phoneNumber = "Phone Number must have at least 10 digits";

    const phoneNumberPattern = /^(628|08)/;
    if (!phoneNumberPattern.test(phoneNumber.value))
      errors.value.phoneNumber = "Phone Number must start with 628 or 08";
  }

  if (!bookedDate.value) errors.value.bookedDate = "Booking Date cannot empty";
  if (!bookedTime.value) errors.value.bookedTime = "Booking Time cannot empty";

  if (
    errors.value.name == "" &&
    errors.value.email == "" &&
    errors.value.numberOfPeople == "" &&
    errors.value.phoneNumber == "" &&
    errors.value.bookedDate == "" &&
    errors.value.bookedTime == ""
  ) {
    if (confirm(`Make sure the data you entered is correct before continuing, press 'OK' if it is correct`)) {
      isModalOpen.value = true;
      isSaving.value = false;
    }
  }
};

const uploadFile = async (event) => {
  const file = event.target.files[0];
  if (file.size > 1024 * 1024) {
    event.target.value = "";
    alert("Max. file size is 1 MB");
    return;
  }

  const base64image = await base64(file);
  paymentProof.value = base64image;
};

const submitFinal = async () => {
  isSaving.value = true;

  console.log("Time: ", bookedTime);
  const bookingDate = new Date(bookedDate.value);
  const hour = bookedTime.value.hours;
  const minute = bookedTime.value.minutes;


  bookingDate.setHours(hour);
  bookingDate.setMinutes(minute);

  const bookingTimestamp = Timestamp.fromDate(bookingDate);

  if (!paymentProof.value) {
    isSaving.value = false;
    return alert("Please upload screenshot of your payment proof");
  } else {
    try {
      const docName = `BOOKING-${bookedDate.value}-${name.value}-${Math.floor(hour + Math.random() * 1000)}`;
      console.log("Document Name: ", docName); // Untuk de
      await setDoc(
        doc(db, "reservations", `BOOKING-${bookedDate.value}-${name.value}-${Math.floor(hour + Math.random() * 1000)}`),
        {
          name: name.value,
          email: email.value,
          numberOfPeople: numberOfPeople.value,
          phoneNumber: phoneNumber.value,
          bookedDate: bookingTimestamp,
          bookedTime: bookedTime.value,
          paymentProof: paymentProof.value,
          status: "Pending",
        }
      );

      isDone.value = true;
      isSaving.value = false;
    } catch (err) {
      console.log("error: ", err);
      isSaving.value = false;
      alert("Error, please refresh this page");
    }
  }
};

const close = () => {
  window.location.reload();
};

const hoursFilter = (hour) => {
  return hour >= 10 && hour <= 20;
};

useTitle(`Reservations - ${konfigurasi.app.name}`);
</script>

<template>
  <main>
    <section class="grid grid-cols-1 md:grid-cols-2">
      <div class="w-full h-[500px] md:h-full md:max-h-[850px]">
        <img
          src="/assets/img/reservations.png"
          alt="Reservations"
          class="object-cover h-full w-full"
        />
      </div>

      <div class="bg-[#101010] text-white p-12">
        <h1 class="font-antique font-bold text-[28px]">Book a table</h1>

        <p class="font-rosario text-[20px]">
          Reserve your hive before it runs out!
        </p>

        <form
          method="POST"
          class="mt-6 space-y-4"
          @submit.prevent="simpanData()"
        >
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

            <small
              class="text-red-500 font-sans text-[15px]"
              v-if="errors.name"
            >
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

            <small
              class="text-red-500 font-sans text-[15px]"
              v-if="errors.email"
            >
              {{ errors.email }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="people" class="font-rosario text-[20px]"
              >Number of People</label
            >
            <input
              type="number"
              name="people"
              id="people"
              v-model="numberOfPeople"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="0"
            />

            <small
              class="text-red-500 font-sans text-[15px]"
              v-if="errors.numberOfPeople"
            >
              {{ errors.numberOfPeople }}
            </small>
          </div>

          <div class="space-y-1">
            <label for="phone" class="font-rosario text-[20px]"
              >Phone Number</label
            >
            <input
              type="tel"
              name="phone"
              id="phone"
              pattern="^(08|62)\d{6,}$"
              v-model="phoneNumber"
              class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans"
              placeholder="08xx or 628xx"
            />

            <small
              class="text-red-500 font-sans text-[15px]"
              v-if="errors.phoneNumber"
            >
              {{ errors.phoneNumber }}
            </small>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="w-full">
              <div class="space-y-1">
                <label for="date" class="font-rosario text-[20px]">Date</label>
                
                    <DatePicker
                      v-model="bookedDate"
                      :disabled-dates="disabledDatesHandler"
                      :enable-time-picker="false"
                      placeholder="Select Date"
                      :min-date="tomorrow"
                      :class="'dp__theme_dark'"
                      :style="{
                        border: '3px solid #DBAD39',
                        borderRadius: '3px',
                        width: '100%',
                        fontFamily: 'sans-serif',
                        colorScheme: 'dark',
                      }"
                      dark
                    />  
        
                <small
                  class="text-red-500 font-sans text-[15px]"
                  v-if="errors.bookedDate"
                >
                  {{ errors.bookedDate }}
                </small>
              </div>
            </div>

            <div class="w-full">
              <div class="w-full">
                <div class="space-y-1">
                  <label
                    for="time"
                    class="font-rosario text-[20px] flex justify-between items-start"
                  >
                    Time
                    <span class="text-[16px] font-normal">(10:00 - 22:00)</span>
                  </label>

                  <DatePicker
                    v-model="bookedTime"
                    :minutes-increment="5"
                    :filters="{ hours: hoursFilter }"
                    :min-time="{ hours: 10, minutes: 0}"
                    :max-time="{ hours: 20, minutes: 0}"
                    :start-time="{ hours: 10, minutes: 0 }"
                    placeholder="Select Time"
                    :class="'dp__theme_dark'"        
                    :style="{
                      border: '3px solid #DBAD39',
                      borderRadius: '3px',
                      width: '100%',
                      fontFamily: 'sans-serif',
                      colorScheme: 'dark',                   
                    }"
                    time-picker
                    dark
                  >
                    <template #input-icon>
                       <img class="input-slot-image" src="D:\jan-bistro-live\public\assets\img\clock.png"/>
                    </template>
                  </datePicker>

                  <small
                    class="text-red-500 font-sans text-[15px]"
                    v-if="errors.bookedTime"
                  >
                    {{ errors.bookedTime }}
                  </small>
                </div>
              </div>
            </div>
          </div>


          <div class="text-center">
            <!-- <br>
            <h2>Summary Total: Rp{{ formattedAmount }}</h2>
            <br> -->
            <br> 
            <button
              type="submit"
              class="bg-[#DBAD39] px-16 py-2 rounded-[3px] font-rosario text-[20px]"
            >
              Book
            </button>
          </div>
        </form>
      </div>
    </section>

    <form
      @submit.prevent="submitFinal"
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center"
    >
      <div
        class="bg-black/50 backdrop-blur-md h-full absolute top-0 right-0 bottom-0 left-0 z-10"
      ></div>

      <div
        class="h-full flex items-start md:items-center justify-center z-50 relative overflow-y-auto"
      >
        <div
          class="bg-black/80 w-full max-w-4xl mx-auto z-50 relative p-4 rounded-lg text-white grid grid-cols-1 md:grid-cols-2"
        >
          <div v-if="!isDone" class="mb-4">
            <img
              :src="qris[4].qris"
              v-if="qris[4].qris"
              alt="QRIS"
              class="w-full md:w-fit"
            />
          </div>

          <div class="flex items-center justify-center">
            <div v-if="!isDone">
              <div class="text-center">
                <h1 class="font-bold text-2xl">Scan QR Code to pay</h1>
                <p class="mt-1 text-[16px]">
                  Please upload your payment receipt here
                </p>

                <div class="mt-6">
                  <h3 class="text-[20px] font-semibold">Amount to Pay</h3>
                  <h4 class="text-4xl font-antique font-bold">Rp{{ formattedAmount }}</h4>
                </div>

                <div class="mt-6">
                  <div class="block text-left">
                    <input
                      type="file"
                      class="border-2 w-full border-[#DBAD39]"
                      @change="uploadFile($event)"
                      accept=".jpg,.jpeg,.png"
                    />
                    <small class="font-sans">Max. 1mb (png, jpeg, jpg)</small>
                  </div>

                  <button
                    class="bg-[#DBAD39] px-4 py-2 rounded font-bold mt-2 z-[9999] disabled:bg-[#DBAD39]/50 relative"
                    type="submit"
                    :disabled="isSaving"
                  >
                    {{ isSaving ? "Loading" : "Submit" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isDone" class="col-span-2 px-6 py-4">
            <button
              type="button"
              @click="close()"
              class="text-4xl absolute right-3 top-0"
            >
              &times;
            </button>

            <div class="text-center">
              <h1 class="font-bold text-2xl">Thank You</h1>
              <p class="mt-1 text-[16px]">Please wait for our confirmation within 24 hours via WhatsApp/Email</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </main>
</template>

<style>
  .dp__theme_dark {
    --dp-background-color: #101010 !important;
    --dp-text-color: #ffffff !important;
    --dp-hover-text-color: #fff !important;
    --dp-hover-icon-color: #959595 !important;
    --dp-primary-color: #DBAD39 !important;
    --dp-primary-disabled-color: #a9a9a9 !important;
    --dp-primary-text-color: #101010 !important;
    --dp-secondary-color: #a9a9a9 !important;
    --dp-border-color: transparent;
    --dp-border-width: 3px !important;
    --dp-border-radius: 3px !important;
    --dp-menu-border-color: #DBAD39 !important;
    --dp-border-color-hover: #DBAD39 !important;
    --dp-border-color-focus: #DBAD39 !important;
    --dp-disabled-color: #484848 !important; 
    --dp-disabled-color-text: #d0d0d0 !important; 
    --dp-scroll-bar-background: #212121 !important;
    --dp-scroll-bar-color: #484848 !important;
    --dp-success-color: #00701a !important;
    --dp-success-color-disabled: #428f59 !important;
    --dp-icon-color: #DBAD39 !important;
    --dp-danger-color: #e53935 !important;
    --dp-marker-color: #e53935 !important;
    --dp-tooltip-color: #3e3e3e !important;
    --dp-highlight-color: rgb(0 92 178 / 20%) !important;
    --dp-range-between-dates-background-color: var(--dp-hover-color, #484848) !important;
    --dp-range-between-dates-text-color: var(--dp-hover-text-color, #fff) !important;
    --dp-range-between-border-color: var(--dp-hover-color, #fff) !important;
    --dp-time-picker-text-color: #DBAD39 !important;
  }
  .dp__theme_dark .dp__calendar_header,
  .dp__theme_dark .dp__calendar_item {
    color: #DBAD39 !important; 
  }
  .dp__theme_dark input {
  color: #ffffff !important; 
  }

  .dp__theme_dark .dp__input {
    color: #ffffff !important;
  }
  .dp__theme_dark .dp__time_picker,
  .dp__theme_dark .dp__time_display {
    color: #DBAD39 !important;
  }
  .input-slot-image {
        height: 22px;
        width: auto;
        margin-left: 7px;
  }
</style>