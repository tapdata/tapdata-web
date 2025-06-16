import Main from './Main.vue'

Main.install = function (app) {
  app.component(Main.name, Main)
}

export default Main
