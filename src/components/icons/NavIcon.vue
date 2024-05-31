<script>
export default {
  name: 'Nav Icon',
  props: {
    _color: String,
    w: Number,
    h: Number
  }
}
</script>

<template>
  <svg
    :width="`${typeof w !== 'undefined' ? w : 24}px`"
    :height="`${typeof h !== 'undefined' ? h : 24}px`"
    :viewBox="`0 0 ${typeof w !== 'undefined' ? w : 24} ${typeof h !== 'undefined' ? h : 24}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 18L20 18"
      :stroke="typeof _color !== 'undefined' ? _color : '#000000'"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4 12L20 12"
      :stroke="typeof _color !== 'undefined' ? _color : '#000000'"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4 6L20 6"
      :stroke="typeof _color !== 'undefined' ? _color : '#000000'"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>