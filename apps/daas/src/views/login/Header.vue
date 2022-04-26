<template>
  <div class="header">
    <header>
      <div class="logo">
        <img :src="logoUrl" />
        <div v-if="$getSettingByKey('SHOW_LANGUAGE')" class="switch-lang">
          <span v-for="(value, key) in languages" :key="key" :class="{ bold: key === lang }" @click="langChange(key)">
            {{ value }}
          </span>
        </div>
      </div>
      <!-- <div class="slogan">{{ $t('app.signIn.slogan') }}</div> -->
    </header>
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
      logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
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
        border-left: 1px solid #333333;
        box-sizing: border-box;
        height: 18px;
        line-height: 18px;
        cursor: pointer;
        &:first-child {
          border: none;
        }
        &:hover {
          color: #333;
        }
      }
      .bold {
        color: #333333;
        font-weight: 500;
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
