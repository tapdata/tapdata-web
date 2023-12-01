import Chart from './Chart'

Chart.install = function (Vue) {
  window.$vueApp.component(Chart.name, Chart)
}

export default Chart
