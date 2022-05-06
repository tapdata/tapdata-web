<template>
  <div class="page">
    <div class="page-image">
      <!-- <img :src="logoUrl" /> -->
    </div>

    <div class="page-main">
      <div class="page-main-box">
        <div v-if="$getSettingByKey('SHOW_LANGUAGE')" class="switch-lang">
          <span v-for="(value, key) in languages" :key="key" :class="{ bold: key === lang }" @click="langChange(key)">
            {{ value }}
            <ElDivider direction="vertical" v-if="key !== 'tc'"></ElDivider>
          </span>
        </div>
        <slot name="main"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import Cookie from '@tap/shared/src/cookie'
const langMap = {
  sc: 'zh-CN',
  tc: 'zh-TW',
  en: 'en'
}
const Languages = {
  sc: '中文 (简)',
  en: 'English',
  tc: '中文 (繁)'
}
const LanguagesKey = {
  sc: 'zh_CN',
  en: 'en_US',
  tc: 'zh_TW'
}
export default {
  name: 'LoginHeader',
  data() {
    return {
      logoUrl: window._TAPDATA_OPTIONS_.loginUrl,
      languages: Languages,
      lang: localStorage.getItem('tapdata_localize_lang')
    }
  },
  methods: {
    langChange(lang) {
      localStorage.setItem('tapdata_localize_lang', lang)
      Cookie.set('lang', LanguagesKey[lang])
      this.$i18n.locale = langMap[lang]
      this.lang = lang
    }
  }
}
</script>
<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: row;
  min-width: 1440px;
  height: 100%;
  .page-image {
    flex: 1;
    background: url('../../assets/images/login-bg.png') no-repeat left 0;
    background-size: cover;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .page-main {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    .page-main-box {
      display: flex;
      flex-direction: column;
      width: 500px;
      height: 100%;
    }
    .switch-lang {
      padding-top: 50px;
      text-align: right;
      color: map-get($fontColor, slight);
      font-weight: 500;
      font-size: 14px;
      span {
        display: inline-block;
        box-sizing: border-box;
        height: 18px;
        line-height: 18px;
        cursor: pointer;
        &:hover {
          color: map-get($fontColor, dark);
        }
      }
      .bold {
        color: map-get($fontColor, dark);
        font-weight: 500;
      }
    }
  }
}
header {
  padding: 70px 80px 0 80px;
  margin: 0 auto;
  user-select: none;
  min-width: 1400px;
  box-sizing: border-box;
  .logo {
    display: flex;

    align-items: center;
    justify-content: space-between;
    img {
      display: block;
      width: 144px;
    }
    .switch-lang {
      color: #dedee4;
      font-size: 16px;
      span {
        display: inline-block;
        padding: 0 10px;
        border-left: 1px solid map-get($fontColor, dark);
        box-sizing: border-box;
        height: 18px;
        line-height: 18px;
        cursor: pointer;
        &:first-child {
          border: none;
        }
        &:hover {
          color: map-get($fontColor, dark);
        }
      }
    }
  }
  .slogan {
    margin-top: 8px;
    height: 15px;
    line-height: 15px;
    font-size: 14px;
    color: rgba(153, 153, 153, 1);
  }
}
</style>
