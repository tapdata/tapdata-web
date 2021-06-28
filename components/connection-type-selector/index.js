/**
 * 数据源类型选择器
 *
 * 注意：增加新数据源时需增加对应图片
 */

import ConnectionTypeSelector from './main.vue'
ConnectionTypeSelector.install = function (Vue) {
  Vue.component(ConnectionTypeSelector.name, ConnectionTypeSelector)
}
export default ConnectionTypeSelector
