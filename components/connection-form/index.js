/**
 * 数据源类型表单生成器
 *
 *
 */

import ConnectionFormSelector from './formBuilder.vue'
ConnectionFormSelector.install = function(Vue) {
  Vue.component(ConnectionFormSelector.name, ConnectionFormSelector)
}
export default ConnectionFormSelector
