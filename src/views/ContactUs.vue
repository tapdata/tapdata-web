<template>
  <div class="contact-us">
    <TheHeader></TheHeader>
    <div class="contact-us-container mx-auto mb-8 fs-6">
      <div class="contact-header mb-10 text-center fs-4 fw-normal">
        <span>Tapdata 钛铂数据</span>
        <span class="mx-2">|</span>
        <span>联系我们</span>
      </div>

      <div class="contact-body-img mx-auto px-1">
        <img src="../assets/icons/glasses.gif" alt="" />
      </div>
      <div class="contact-body p-4 m-n4">
        <div class="contact-content">
          <div class="contact-content__describe">
            钛铂数据（Tapdata）是企业数据即服务DaaS解决方案提供商，致力于打造一站式实时数据融合平台，帮助企业在面临复杂的数据孤岛问题时，通过简单、高效的方式实现从数据孤岛系统的实时获取、处理和服务，加速企业数字化转型进程。
          </div>
          <div class="contact-content__telephone mt-7">
            <span>电话</span>
            <span>：</span>
            <span>0755 2665 6080</span>
          </div>
          <div class="contact-content__email mt-2">
            <span>邮箱</span>
            <span>：</span>
            <span>team@tapdata.io</span>
          </div>
        </div>
      </div>
      <div
        class="contact-footer flex justify-content-center align-center mx-auto mt-16"
      >
        <div class="contact-footer__content">
          <div class="contact-footer__top px-6">扫码添加客服</div>
          <div class="contact-footer__bottom  px-6">进行咨询与交流</div>
        </div>
        <img
          class="contact-footer__logo"
          src="../assets/image/LarkQR.jpeg"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader'

export default {
  name: 'ContactUs',
  components: { TheHeader }
}
</script>

<style lang="scss" scoped>
.contact-us {
  padding-top: 128px;
  height: 100%;
  background-color: #fff;
  box-sizing: border-box;
}
.contact-us-container {
  width: 677px;
  color: #084686;
}
.contact-header {
  color: #333;
}
.contact-body {
  border: 1px solid #084686;
  border-radius: 10px;
}
.contact-body-img {
  background-color: #fff;
  width: 40px;
  transform: rotateX(0deg);
  > img {
    width: 100%;
    height: 18px;
  }
}
.contact-content__describe {
  line-height: 1.7;
}
.contact-footer {
  width: 300px;
}
.contact-footer__content {
  width: 100%;
}
.contact-footer__top {
  line-height: 30px;
  height: 30px;
  background-color: #084686;
  color: #fff;
}
.contact-footer__bottom {
  line-height: 30px;
  height: 30px;
}
.contact-footer__logo {
  margin-left: -145px;
  border: 2px solid #084686;
  width: 116px;
}
</style>
