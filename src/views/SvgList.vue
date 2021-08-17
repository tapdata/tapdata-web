<template>
  <section class="svg-wrap" :class="[{ 'error-page-purchase': $route.meta.isPurchase }]">
    <TheHeader></TheHeader>
    <div class="header">{{ 'Tapdata Cloud' }}</div>
    <div class="svg-container p-6">
      <div class="mb-6 text-center fs-5 fw-bolder">svg文件枚举，按照文件名排序</div>
      <div class="ml-1 py-3 fs-6 fw-bolder">svg目录（可以修改颜色）</div>
      <ul class="icon-list svg-list">
        <li
          v-for="(item, index) in list"
          :key="index"
          class="m-1 flex flex-column justify-content-center text-center position-relative shadow"
        >
          <VIcon class="mx-auto mb-3" size="24">{{ item }}</VIcon>
          <div class="icon-name">{{ item }}</div>
          <el-button
            type="primary"
            class="mt-2 position-absolute bottom-0 w-100"
            size="mini"
            v-clipboard:copy="`<VIcon>${item}</VIcon>`"
            v-clipboard:success="copySuccess"
            >Copy</el-button
          >
        </li>
      </ul>
      <div class="ml-1 py-3 fs-6 fw-bolder">colorSvg目录（不支持修改颜色）</div>
      <ul class="icon-list color-svg-list">
        <li
          v-for="(item, index) in colorList"
          :key="index"
          class="m-1 flex flex-column justify-content-center text-center position-relative shadow"
        >
          <VIcon class="mx-auto mb-3" size="24">{{ item }}</VIcon>
          <div class="icon-name">{{ item }}</div>
          <el-button
            type="primary"
            class="mt-2 position-absolute bottom-0 w-100"
            size="mini"
            v-clipboard:copy="`<VIcon>${item}</VIcon>`"
            v-clipboard:success="copySuccess"
            >Copy</el-button
          >
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import TheHeader from '@/components/TheHeader'
import VIcon from '@/components/VIcon'
const svgFiles = require.context('@/assets/icons/svg', false, /\.svg$/).keys()
const colorSvgFiles = require.context('@/assets/icons/colorSvg', false, /\.svg$/).keys()
export default {
  components: {
    TheHeader,
    VIcon
  },
  computed: {
    list() {
      return svgFiles.map(item => item.replace('./', '').replace('.svg', ''))
    },
    colorList() {
      return colorSvgFiles.map(item => item.replace('./', '').replace('.svg', ''))
    }
  },
  methods: {
    copySuccess() {
      this.$message.success('Copy success')
    }
  }
}
</script>

<style lang="scss" scoped>
.svg-wrap {
  padding-top: 68px;
  .header {
    padding: 0 20px;
    line-height: 60px;
    background: #fff;
    font-size: 14px;
    font-weight: 700;
  }
}
.icon-list {
  overflow: hidden;
  li {
    float: left;
    width: 120px;
    height: 120px;
    color: #666;
    background-color: #fff;
    .el-button {
      opacity: 0;
    }
    &:hover {
      .el-button {
        opacity: 1;
      }
    }
  }
  &.svg-list {
    li {
      &:hover {
        color: map-get($color, primary);
      }
    }
  }
}
</style>
