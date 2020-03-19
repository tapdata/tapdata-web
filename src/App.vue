<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App'
};
</script>
<style>
@import 'assets/style/font/iconfont.css';
/* @import 'http://at.alicdn.com/t/font_1644289_lsszo6fhnga.css'; */
</style>
<style lang='less'>
@import 'assets/style/index.less';

#app {
  width: 100%;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
