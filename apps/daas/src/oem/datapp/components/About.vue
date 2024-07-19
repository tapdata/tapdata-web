<template>
  <section class="h-100 bg-page p-6 overflow-auto">
    <div class="mb-6">
      <span class="isCard-title">关于</span>
    </div>
    <div class="bg-white rounded-lg p-6">
      <div class="card-header position-relative">
        <span class="card-title position-relative inline-block color-primary fw-sub">软件信息</span>
      </div>
      <div
        class="card-body grid gap-8 justify-center py-8 pt-12"
        style="grid-template-columns: repeat(3, minmax(220px, auto))"
      >
        <div class="flex flex-column align-center gap-3">
          <el-image :src="require('../images/icon_version.svg')" style="width: 64px; height: 64px"></el-image>
          <span class="font-color-dark fw-sub">服务器版本信息</span>
          <span class="font-color-sslight">3.14</span>
        </div>
        <div class="flex flex-column align-center gap-3">
          <el-image :src="require('../images/icon_copyright.svg')" style="width: 64px; height: 64px"></el-image>
          <span class="font-color-dark fw-sub">版权所有</span>
          <span class="font-color-sslight">深圳市数存科技有限公司</span>
        </div>
        <div class="flex flex-column align-center gap-3">
          <el-image :src="require('../images/icon_patch.svg')" style="width: 64px; height: 64px"></el-image>
          <span class="font-color-dark fw-sub">补丁版本</span>
          <span class="font-color-sslight">3.1.012</span>
        </div>
      </div>

      <div class="card-header position-relative">
        <span class="card-title position-relative inline-block color-primary fw-sub">联系方式</span>
      </div>
      <div class="card-body flex flex-column gap-3 py-3">
        <div class="flex gap-3 p-2 border-bottom">
          <el-image :src="require('../images/icon_company.svg')" style="width: 32px; height: 32px"></el-image>
          <div>
            <div class="font-color-dark fw-sub mb-1">公司名称</div>
            <div class="font-color-sslight">深圳市数存科技有限公司</div>
          </div>
        </div>
        <div class="flex gap-3 p-2 border-bottom">
          <el-image :src="require('../images/icon_website.svg')" style="width: 32px; height: 32px"></el-image>
          <div>
            <div class="font-color-dark fw-sub mb-1">官方网址</div>
            <div class="font-color-sslight">
              (<a class="font-color-sslight" href="http:/www.datapp.com.cn" target="_blank">http:/www.datapp.com.cn</a>)
            </div>
          </div>
        </div>
        <div class="flex gap-3 p-2 border-bottom">
          <el-image :src="require('../images/icon_telephone.svg')" style="width: 32px; height: 32px"></el-image>
          <div>
            <div class="font-color-dark fw-sub mb-1">官方电话</div>
            <div class="font-color-sslight">(4008-672-818)</div>
          </div>
        </div>
        <div class="flex gap-3 p-2 border-bottom">
          <el-image :src="require('../images/icon_email.svg')" style="width: 32px; height: 32px"></el-image>
          <div>
            <div class="font-color-dark fw-sub mb-1">官方邮件</div>
            <div class="font-color-sslight">
              (<a class="font-color-sslight" href="mailto:support@datapp.com.cn">support@datapp.com.cn</a>)
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {}
  },

  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.bg-page {
  background-color: #eff1f4;
}

.card-header {
  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #dddddd;
  }
}

.card-title {
  line-height: 44px;
  border-bottom: 2px solid currentColor;
  /*&:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: currentColor;
  }*/
}

.card-body {
  .el-image {
    width: 64px;
    height: 64px;
  }
}
</style>
