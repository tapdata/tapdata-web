import Table from './Table.vue'

Table.install = function (app) {
  app.component(Table.name, Table)
}

export { Table as VTable }

export default Table
