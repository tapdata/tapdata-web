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
import Nest from './nest.vue'

const install = function (Vue) {
  return [Form, Input, Select, Radio, Switch, File, _Array, Group, Nest].map(c => window.$vueApp.component(c.name, c))
}
export default { install }
