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
      <!-- <div class="slogan">{{ $t('app_signIn_slogan') }}</div> -->
    </header>
  </div>
</template>
<script>
import { langMenu, getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'

export default {
  name: 'LoginHeader',
  data() {
    return {
      logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
      languages: langMenu,
      lang: getCurrentLanguage()
    }
  },
  methods: {
    langChange(lang) {
      setCurrentLanguage(lang, this.$i18n)
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
      .bold {
        color: map-get($fontColor, dark);
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
