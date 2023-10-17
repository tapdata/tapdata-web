import Main from './Main'

Main.install = function (Vue) {
  window.$vueApp.component(Main.name, Main)
}

export default Main
