<script setup>
// import logo dan konfigurasi website
import Logo from "@/components/icons/Logo.vue";
import konfigurasi from "@/config.js";

import base64 from "@/helpers/base64.js";
import { onMounted, ref, computed } from "vue";
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

const qris = ref("");

const name = ref("");
const email = ref("");
const numberOfPeople = ref("");
const phoneNumber = ref("");
const bookedDate = ref("");
const bookedTime = ref("10:00");
const paymentProof = ref("");

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
});

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

  const bookingDate = new Date(bookedDate.value);
  const [hours, minutes] = bookedTime.value.split(":");

  bookingDate.setHours(hours);
  bookingDate.setMinutes(minutes);

  const bookingTimestamp = Timestamp.fromDate(bookingDate);

  if (!paymentProof.value) {
    isSaving.value = false;
    return alert("Please upload screenshot of your payment proof");
  } else {
    try {
      const docName = `BOOKING-${bookedDate.value}-${name.value}-${Math.floor(hours + Math.random() * 1000)}`;
      console.log("Document Name: ", docName); // Untuk de
      await setDoc(
        doc(db, "reservations", `BOOKING-${bookedDate.value}-${name.value}-${Math.floor(hours + Math.random() * 1000)}`),
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
      isSaving.value = false;
      alert("Error, please refresh this page");
    }
  }
};

const close = () => {
  window.location.reload();
};

const validateTime = () => {
  const minTime = "10:00";
  const maxTime = "22:00";

  if (bookedTime.value < minTime) {
    bookedTime.value = minTime;
  } else if (bookedTime.value > maxTime) {
    bookedTime.value = maxTime;
  }
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
                <input
                  type="date"
                  name="date"
                  id="date"
                  :min="tomorrow"
                  v-model="bookedDate"
                  class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans [color-scheme:dark]"
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

                  <input
                    type="time"
                    name="time"
                    id="time"
                    v-model="bookedTime"
                    @input="validateTime"
                    class="bg-transparent border-[3px] border-[#DBAD39] outline-none rounded-[3px] w-full px-2 py-1 font-sans [color-scheme:dark]"
                  />

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
