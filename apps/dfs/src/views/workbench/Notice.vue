<template>
  <div class="notice g-panel-container ws-main-container fs-8" v-if="$route.query.id === 7">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA12') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2023-3-2</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-3 fw-bolder">{{ $t('workbench_Notice_buDuanYouHuaTi') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notice'
}
</script>

<style lang="scss" scoped>
.notice-header {
  background: url('../../../public/images/notice/notice_title.png') no-repeat 100% / cover;
  .notice-header__title {
  }
  .notice-header__time {
    color: rgba(0, 0, 0, 0.49);
    > img {
      width: 22px;
      height: 22px;
    }
  }
}
.notice-body {
  background: #fff;
  img {
    width: 100%;
  }
  video {
    width: 100%;
  }
  .notice-body__step {
    border-bottom: 1px solid #f2f2f2;
    > div {
      margin-bottom: 16px;
      line-height: 17px;
    }
  }
  .notice-body__intro {
    > div {
      margin-bottom: 16px;
      line-height: 17px;
    }
  }
  .notice-body__intro-img {
    > img {
      width: 60%;
      max-width: 1100px;
      min-width: 667px;
    }
  }
  .QR-code {
    > img {
      width: 164px;
    }
  }
}

.ws-main-container {
  .notice-body__content {
    //width: 700px;
    .banner-box {
      text-align: center;
      //padding: 0 15%;
      background-color: rgb(22, 32, 98);
      img {
        width: 50%;
      }
    }
  }
  .line-height-2 {
    line-height: 2;
  }
}
.section-margin {
  margin: 0 15%;
}
.info-section__header {
  border-radius: 12px 12px 0 0;
  background-color: rgb(1, 121, 179);
  color: rgb(255, 255, 255);
}
.info-section__body {
  border: 1px solid rgb(1, 121, 179);
  border-radius: 0 12px 12px 12px;
  line-height: 2;
}
.activity-section {
  border-left: 2px dashed rgb(1, 121, 179);
  line-height: 2;
}
.index-section {
}
.index-section__header {
  flex-flow: row nowrap;
}
.index-section__number {
  vertical-align: top;
  width: auto;
  background-color: rgb(1, 121, 179);
  min-width: 10%;
  max-width: 100%;
  flex: 0 0 auto;
  height: 40px;
  line-height: 40px;
  align-self: stretch;
  z-index: 1;
  box-sizing: border-box;

  text-align: right;
  font-size: 22px;
  color: rgb(249, 248, 246);
  padding-right: 9px;
  padding-left: 9px;
  letter-spacing: 0px;
  //> span {
  //  text-align: right;
  //  font-size: 22px;
  //  color: rgb(249, 248, 246);
  //  padding-right: 9px;
  //  padding-left: 9px;
  //  line-height: 1;
  //  letter-spacing: 0px;
  //}
}
.index-section__slash {
  display: inline-block;
  vertical-align: top;
  width: 14px;
  background-image: linear-gradient(to right bottom, rgb(1, 121, 179) 50%, rgba(231, 34, 21, 0) 50%);
  flex: 0 0 auto;
  height: auto;
  align-self: stretch;
  line-height: 0;
  z-index: 1;
  border-width: 0px;
  box-sizing: border-box;
}
.index-section__title {
  display: inline-block;
  vertical-align: top;
  width: auto;
  flex: 100 100 0%;
  height: auto;
  align-self: stretch;
  background-color: rgb(229, 241, 247);
  margin-top: 7px;
  margin-left: -15px;
  line-height: 1;
  box-sizing: border-box;
}
.title-top {
  text-align: left;
  transform: translate3d(7px, 0px, 0px);
  margin-top: -15px;
  margin-right: 0%;
  margin-left: 0%;
  justify-content: flex-start;
  height: 16px;
  box-sizing: border-box;
}
.title-top_arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: top;
  overflow: hidden;
  border-style: solid;
  border-width: 8px;
  border-color: rgba(255, 255, 255, 0) rgba(255, 255, 255, 0) rgb(1, 121, 179);
  box-sizing: border-box;
}
.title-bottom {
  color: rgb(1, 121, 179);
  padding-right: 10px;
  padding-left: 10px;
  line-height: 2;
  letter-spacing: 1px;
}
.prize-section {
  img {
    width: 330px;
  }
}
.mode-section {
  //border-left: 1px solid rgb(1, 121, 179);
  &:not(:first-child) {
    border-left: 1px solid #0179b3;
  }
  font-size: 14px;
  color: #646464;
  overflow: hidden;
  background-image: linear-gradient(to right, rgba(255, 90, 104, 0) 0%, rgba(255, 90, 104, 0.05) 100%);
  .mode-section__connect {
    background: url('../../../public/images/notice/bg.png') 0 0 repeat;
    background-size: 3.5%;
  }
  .clear {
    clear: both;
  }
}
.mode-section__header {
  float: left;
  padding: 0 8px;
  height: 16px;
  line-height: 16px;
  font-weight: bolder;
  border-left: 16px solid rgb(1, 121, 179);
  border-right: 2px solid rgb(1, 121, 179);
  color: #333;
}
.QR-code-section {
  img {
    width: 135px;
    height: 135px;
  }
}
.number-title-box {
  text-align: center;
}
.number-title-box__number {
  color: rgb(255, 255, 255);
  text-shadow: rgb(53 119 177) 0px 1.4px, rgb(69 104 188) 1px 1px, rgb(69 104 188) 1.4px 0px, rgb(69 104 188) 1px -1px,
    rgb(69 104 188) 0px -1.4px, rgb(69 104 188) -1px -1px, rgb(69 104 188) -1.4px 0px, rgb(69 104 188) -1px 1px;
  font-size: 51px;
  font-style: italic;
}
.number-title-box__content {
  display: inline-block;
  margin-top: -16px;
  margin-bottom: 24px;
  border-top: 1px solid #3577b1;
  background: #fff;
}
.number-title-box__title {
  background: -moz-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -webkit-gradient(linear, 0 0, 0 right, from(rgb(239, 158, 56)), to(rgb(51, 119, 176)));
  background: -webkit-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -o-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -ms-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 );
  background: linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 28px;
}
.number-title-box__desc {
  margin-top: 16px;
  color: #979494;
  font-size: 20px;
  font-weight: bold;
}

:root .number-title-box__title {
  filter: none;
}
.list-style-disc {
  list-style: disc;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
  background: #000;
  vertical-align: middle;
}
.blue-title {
  color: rgb(0, 122, 181);
  font-weight: bold;
}
.blue-circle-index {
  display: inline-block;
  width: 14px;
  height: 14px;
  font-size: 12px;
  border-radius: 50%;
  border: 1px solid #007ab5;
  text-align: center;
}
</style>
