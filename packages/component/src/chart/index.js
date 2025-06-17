import Chart from './Chart.vue'

Chart.install = function (app) {
  app.component(Chart.name, Chart)
}

export default Chart

export { Chart }
