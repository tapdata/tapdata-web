import Chart from './Chart'

Chart.install = function (Vue) {
  Vue.component(Chart.name, Chart)
}

export default Chart
