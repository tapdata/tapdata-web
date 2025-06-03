import Chart from './Chart'

Chart.install = function (app) {
  app.component(Chart.name, Chart)
}

export default Chart
