<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  components: { VIcon },
  data() {
    return {
      platform: ''
    }
  },
  methods: {
    changePlatform() {}
  }
}
</script>

<template>
  <div class="account">
    <VIcon>guide-top-header</VIcon>
    <header>3、请问您的源和目标数据库, 可以从互联网上直接访问吗?。</header>
    <ul>
      <li
        :class="{
          active: platform === 'integration'
        }"
        class="flex flex-column position-relative"
      >
        <div class="is-active position-absolute top-0 end-0">
          <div class="is-active-triangle"></div>
          <VIcon size="16" class="is-active-icon">check-bold</VIcon>
        </div>
        <div>
          <div>可以</div>
          <div>我的数据库均为云数据库, 且可以暴露到公共网络</div>
        </div>
        <el-image class="w-100 product-type-image" :src="require('@/assets/image/intergration.png')" />
      </li>
      <li
        :class="{
          active: platform === 'realTime'
        }"
        class="flex flex-column position-relative"
        @click="changePlatform('realTime')"
      >
        <div class="is-active position-absolute top-0 end-0">
          <div class="is-active-triangle"></div>
          <VIcon size="16" class="is-active-icon">check-bold</VIcon>
        </div>
        <div>
          <div>可以</div>
          <div>我的数据库均为云数据库, 且可以暴露到公共网络</div>
        </div>
        <el-image class="w-100 product-type-image" :src="require('@/assets/image/real-time.png')" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss"></style>
