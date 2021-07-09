/**
 * 表单生成器
 */

import Form from './form.vue'
import Input from './input.vue'
import Select from './select.vue'
import Radio from './radio.vue'
import Switch from './switch.vue'
import File from './file.vue'
import _Array from './array.vue'
import Group from './group.vue'

const install = function(Vue) {
  ;[Form, Input, Select, Radio, Switch, File, _Array, Group].map(c => Vue.component(c.name, c))
}
export default { install }
