import konfigurasi from '@/config'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export const firebaseApp = initializeApp(konfigurasi.firebase)

getFirestore(firebaseApp)