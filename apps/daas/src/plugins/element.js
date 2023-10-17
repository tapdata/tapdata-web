import ElementPlus, { ElLoading } from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import 'element-plus/es/components/loading/style/css'
import i18n from '@/i18n'
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'

import { getCell, getColumnByCell } from 'element-ui/packages/table/src/util'
import { getStyle, hasClass } from 'element-ui/src/utils/dom'

export const install = app => {
  app.use(ElementPlus, { size: 'small', i18n: i18n.global.t })
  // app.use(ElLoading)
}

// TODO 可能需要重写适配
// 优化任务名称和标签一起显示，超出显示提示框的逻辑
// Table.components.TableBody.methods.handleCellMouseEnter = function (event, row) {
//   const table = this.table
//   const cell = getCell(event)
//
//   if (cell) {
//     const column = getColumnByCell(table, cell)
//     const hoverState = (table.hoverState = { cell, column, row })
//     $emit(table, 'cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
//   }
//
//   // 判断是否text-overflow, 如果是就显示tooltip
//   const cellChild = event.target.querySelector('.cell')
//   if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
//     return
//   }
//
//   const showTooltip = () => {
//     const tooltip = this.$refs.tooltip
//     // TODO 会引起整个 Table 的重新渲染，需要优化
//     this.tooltipContent = cell.innerText || cell.textContent
//     tooltip.referenceElm = cell
//     tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
//     tooltip.doDestroy()
//     tooltip.setExpectedState(true)
//     this.activateTooltip(tooltip)
//   }
//
//   const $ellipsis = cellChild.querySelector('[role="ellipsis"]')
//
//   // 任务名称场景的特殊处理
//   if ($ellipsis) {
//     $ellipsis.scrollWidth > $ellipsis.offsetWidth && showTooltip()
//     return
//   }
//
//   // use range width instead of scrollWidth to determine whether the text is overflowing
//   // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
//   const range = document.createRange()
//   range.setStart(cellChild, 0)
//   range.setEnd(cellChild, cellChild.childNodes.length)
//   const rangeWidth = range.getBoundingClientRect().width
//   const padding =
//     (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) + (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
//   if (
//     (rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) &&
//     this.$refs.tooltip
//   ) {
//     showTooltip()
//   }
// }

// TODO 可能需要重写适配
// 重写ElementUI Select组件多选时的触发函数，去掉去重的处理
// Select.methods.handleOptionSelect = function (option, byClick) {
//   var _this12 = this
//
//   if (_this12.multiple) {
//     var value = (_this12.value || []).slice()
//     var optionIndex = _this12.getValueIndex(value, option.value)
//     if (optionIndex > -1 && byClick) {
//       value.splice(optionIndex, 1)
//     } else if (_this12.multipleLimit <= 0 || value.length < _this12.multipleLimit) {
//       value.push(option.value)
//     }
//     $emit(_this12, 'update:value', value)
//     _this12.emitChange(value)
//     if (option.created) {
//       _this12.query = ''
//       _this12.handleQueryChange('')
//       _this12.inputLength = 20
//     }
//     if (_this12.filterable) _this12.$refs.input.focus()
//   } else {
//     $emit(_this12, 'update:value', option.value)
//     _this12.emitChange(option.value)
//     _this12.visible = false
//   }
//   _this12.isSilentBlur = byClick
//   _this12.setSoftFocus()
//   if (_this12.visible) return
//   _this12.$nextTick(function () {
//     _this12.scrollToOption(option)
//   })
// }

// TODO 可能需要重写适配
// const showMessage = Symbol('showMessage')
//
// class MessageConstructor {
//   constructor() {
//     const types = ['success', 'warning', 'info', 'error']
//     types.forEach(type => {
//       this[type] = options => this[showMessage](type, options)
//     })
//   }
//
//   [showMessage](type, options) {
//     const domList = document.getElementsByClassName('el-message')
//
//     if (!domList.length) {
//       return _Message[type](options)
//     } else {
//       let canShow = true
//       const message = typeof options === 'string' ? options : options.message
//       for (const dom of domList) {
//         if (message === dom.innerText) {
//           console.log('重复消息', dom) // eslint-disable-line
//           canShow = false
//           break
//         }
//       }
//       if (canShow) {
//         return _Message[type](options)
//       }
//     }
//   }
// }
//
// export const Message = new MessageConstructor()
// export const message = Message

// window.$vueApp.config.globalProperties.$prompt = MessageBox.prompt
// window.$vueApp.config.globalProperties.$alert = MessageBox.alert
// window.$vueApp.config.globalProperties.$message = Message
// window.$vueApp.config.globalProperties.$msgbox = MessageBox
// window.$vueApp.config.globalProperties.$notify = Notification
