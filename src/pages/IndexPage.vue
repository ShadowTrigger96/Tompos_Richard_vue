<script setup lang="ts">
import { useStore } from '../stores/store';
// import { onMounted } from 'vue';
// import { useRouter } from 'vue-router';

const s = useStore();
// const $r = useRouter();

// onMounted(() => {
//   s.ManyGetAll();
// });
</script>

<template>
  <q-page class="column flex-center">
    <q-img alt="Jedlik logo" loading="eager" src="../assets/Jedlik_big.png" width="150px" />
    <h2>Jedlik Ányos Technikum - Győr - {{ s.app.currentYear }}</h2>
  </q-page>
</template>

<style lang="scss" scoped>
h2 {
  font-size: 3vw;
}
</style>
