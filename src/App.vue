<script setup>
import LayoutDefault from '@/layouts/LayoutDefault.vue'
import LayoutAdmin from '@/layouts/LayoutAdmin.vue'
import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

let route = useRoute()
let layout = shallowRef('div')

watch(
  () => route.meta.layout,
  (newLayout) => {
    if (newLayout === 'admin') {
      layout.value = LayoutAdmin
    } else if (newLayout === 'default') {
      layout.value = LayoutDefault
    } else {
      layout.value = 'div'
    }
  }
)
</script>

<template>
  <layout v-if="layout">
    <router-view />
  </layout>
</template>
