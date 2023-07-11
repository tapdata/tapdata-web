<script>
import Details from '@/components/guide/Details.vue'
import TheHeader from '@/components/the-header'
export default {
  components: {
    Details,
    TheHeader
  }
}
</script>

<template>
  <section class="pay-wrap">
    <TheHeader></TheHeader>
    <!--费用清单-->
    <Details class="pay-main" ref="details" :isCard="true"></Details>
  </section>
</template>

<style scoped lang="scss">
.pay-wrap {
  background-color: map-get($color, submenu);
}
.pay-main {
  width: 80%;
  height: 100vh;
  margin: 0 auto;
  padding-top: 65px;
}
</style>
