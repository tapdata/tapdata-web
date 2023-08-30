<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  props: ['platform'],
  components: { VIcon },
  mounted() {
    this.$emit('changePlatform', 'selfHost')
  }
}
</script>

<template>
  <div class="deployMethod">
    <div class="flex justify-content-center align-items-center">
      <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    </div>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">{{ $t('dfs_components_taskalarmtour_deployment_qingwen') }}</div>
    <ul class="deployMethod-ul mt-4">
      <li
        :class="{
          active: platform === 'fullManagement'
        }"
        class="flex flex-column position-relative cursor-pointer overflow-hidden"
        @click="$emit('changePlatform', 'fullManagement')"
      >
        <div class="flex justify-content-around align-items-center px-4 py-4">
          <div class="mr-4">
            <div class="fs-6 fw-bold mb-2 font-color-dark">
              {{ $t('dfs_components_taskalarmtour_deployment_keyi') }}
            </div>
            <div class="font-color-light">{{ $t('dfs_components_taskalarmtour_deployment_yunshujuku') }}</div>
          </div>
          <el-image class="deployMethod-image" :src="require('@/assets/image/fully_managed.png')" />
        </div>
        <div class="is-active position-absolute top-0 end-0">
          <div class="is-active-triangle"></div>
          <VIcon size="16" class="is-active-icon">check-bold</VIcon>
        </div>
      </li>
      <li
        :class="{
          active: platform === 'selfHost'
        }"
        class="flex flex-column position-relative cursor-pointer mb-4 overflow-hidden"
        @click="$emit('changePlatform', 'selfHost')"
      >
        <div class="flex justify-content-around align-items-center px-4 py-4">
          <div>
            <div class="fs-6 fw-bold mb-2 font-color-dark">
              {{ $t('dfs_components_taskalarmtour_deployment_bukeyi') }}
            </div>
            <div class="font-color-light">{{ $t('dfs_components_taskalarmtour_deployment_wodeshujuku') }}</div>
          </div>
          <el-image class="deployMethod-image" :src="require('@/assets/image/self_host_managed.png')" />
        </div>
        <div class="is-active position-absolute top-0 end-0">
          <div class="is-active-triangle"></div>
          <VIcon size="16" class="is-active-icon">check-bold</VIcon>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.deployMethod-ul li {
  border-radius: 8px;
  border: 1px solid var(--unnamed, #e5e6eb);
  background: var(--color-white, #fff);
  .is-active {
    display: none;
  }
  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
    box-shadow: 0 2px 16px rgba(44, 101, 255, 0.2);
    .is-active {
      display: block;
      &-triangle {
        width: 0;
        height: 0;
        border-top: 18px solid $primary;
        border-left: 18px solid transparent;
        border-bottom: 18px solid transparent;
        border-right: 18px solid $primary;
      }
      &-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        color: #fff;
      }
    }
  }
}
.deployMethod-image {
  width: 280px;
  height: 80px;
}
</style>
