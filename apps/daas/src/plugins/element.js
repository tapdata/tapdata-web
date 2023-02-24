import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'

import {
  Card,
  Image,
  Tabs,
  TabPane,
  Popover,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  CheckboxButton,
  Dialog,
  Switch,
  Loading,
  MessageBox,
  Message as _Message,
  Menu,
  Submenu,
  MenuItem,
  Form,
  FormItem,
  Link,
  Input,
  Button,
  ButtonGroup,
  Select,
  Table,
  TableColumn,
  Option,
  OptionGroup,
  Row,
  Col,
  Pagination,
  DatePicker,
  TimePicker,
  Drawer,
  Container,
  Aside,
  Main,
  Header,
  Footer,
  Tree,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Tag,
  Tooltip,
  Upload,
  Autocomplete,
  InputNumber,
  Notification,
  Cascader,
  Alert,
  Steps,
  Step,
  Transfer,
  Badge,
  Progress,
  Collapse,
  CollapseItem,
  Divider,
  Skeleton,
  SkeletonItem,
  InfiniteScroll,
  Breadcrumb,
  BreadcrumbItem,
  Empty,
} from 'element-ui'
import { getCell, getColumnByCell } from 'element-ui/packages/table/src/util'
import { getStyle, hasClass } from 'element-ui/src/utils/dom'

// 组件默认尺寸为small
window.$vueApp.config.globalProperties.$ELEMENT = { size: 'small' }
// 提示框默认不显示箭头
Tooltip.props.visibleArrow.default = false

// 优化任务名称和标签一起显示，超出显示提示框的逻辑
Table.components.TableBody.methods.handleCellMouseEnter = function (
  event,
  row
) {
  const table = this.table
  const cell = getCell(event)

  if (cell) {
    const column = getColumnByCell(table, cell)
    const hoverState = (table.hoverState = { cell, column, row })
    $emit(
      table,
      'cell-mouse-enter',
      hoverState.row,
      hoverState.column,
      hoverState.cell,
      event
    )
  }

  // 判断是否text-overflow, 如果是就显示tooltip
  const cellChild = event.target.querySelector('.cell')
  if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
    return
  }

  const showTooltip = () => {
    const tooltip = this.$refs.tooltip
    // TODO 会引起整个 Table 的重新渲染，需要优化
    this.tooltipContent = cell.innerText || cell.textContent
    tooltip.referenceElm = cell
    tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
    tooltip.doDestroy()
    tooltip.setExpectedState(true)
    this.activateTooltip(tooltip)
  }

  const $ellipsis = cellChild.querySelector('[role="ellipsis"]')

  // 任务名称场景的特殊处理
  if ($ellipsis) {
    $ellipsis.scrollWidth > $ellipsis.offsetWidth && showTooltip()
    return
  }

  // use range width instead of scrollWidth to determine whether the text is overflowing
  // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
  const range = document.createRange()
  range.setStart(cellChild, 0)
  range.setEnd(cellChild, cellChild.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  const padding =
    (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
    (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
  if (
    (rangeWidth + padding > cellChild.offsetWidth ||
      cellChild.scrollWidth > cellChild.offsetWidth) &&
    this.$refs.tooltip
  ) {
    showTooltip()
  }
}

//重写ElementUI Select组件多选时的触发函数，去掉去重的处理
Select.methods.handleOptionSelect = function (option, byClick) {
  var _this12 = this

  if (_this12.multiple) {
    var value = (_this12.value || []).slice()
    var optionIndex = _this12.getValueIndex(value, option.value)
    if (optionIndex > -1 && byClick) {
      value.splice(optionIndex, 1)
    } else if (
      _this12.multipleLimit <= 0 ||
      value.length < _this12.multipleLimit
    ) {
      value.push(option.value)
    }
    $emit(_this12, 'update:value', value)
    _this12.emitChange(value)
    if (option.created) {
      _this12.query = ''
      _this12.handleQueryChange('')
      _this12.inputLength = 20
    }
    if (_this12.filterable) _this12.$refs.input.focus()
  } else {
    $emit(_this12, 'update:value', option.value)
    _this12.emitChange(option.value)
    _this12.visible = false
  }
  _this12.isSilentBlur = byClick
  _this12.setSoftFocus()
  if (_this12.visible) return
  _this12.$nextTick(function () {
    _this12.scrollToOption(option)
  })
}

window.$vueApp.component(Card.name, Card)
window.$vueApp.component(InputNumber.name, InputNumber)
window.$vueApp.component(Autocomplete.name, Autocomplete)
window.$vueApp.component(Upload.name, Upload)
window.$vueApp.component(Image.name, Image)
window.$vueApp.component(Tabs.name, Tabs)
window.$vueApp.component(TabPane.name, TabPane)
window.$vueApp.component(Popover.name, Popover)
window.$vueApp.component(Radio.name, Radio)
window.$vueApp.component(RadioGroup.name, RadioGroup)
window.$vueApp.component(RadioButton.name, RadioButton)
window.$vueApp.component(Checkbox.name, Checkbox)
window.$vueApp.component(CheckboxGroup.name, CheckboxGroup)
window.$vueApp.component(CheckboxButton.name, CheckboxButton)
window.$vueApp.component(Dialog.name, Dialog)
window.$vueApp.component(Menu.name, Menu)
window.$vueApp.component(Submenu.name, Submenu)
window.$vueApp.component(MenuItem.name, MenuItem)
window.$vueApp.component(Form.name, Form)
window.$vueApp.component(FormItem.name, FormItem)
window.$vueApp.component(Input.name, Input)
window.$vueApp.component(Button.name, Button)
window.$vueApp.component(ButtonGroup.name, ButtonGroup)
window.$vueApp.component(Select.name, Select)
window.$vueApp.component(Table.name, Table)
window.$vueApp.component(TableColumn.name, TableColumn)
window.$vueApp.component(Option.name, Option)
window.$vueApp.component(OptionGroup.name, OptionGroup)
window.$vueApp.component(Row.name, Row)
window.$vueApp.component(Col.name, Col)
window.$vueApp.component(Pagination.name, Pagination)
window.$vueApp.component(DatePicker.name, DatePicker)
window.$vueApp.component(TimePicker.name, TimePicker)
window.$vueApp.component(Container.name, Container)
window.$vueApp.component(Aside.name, Aside)
window.$vueApp.component(Main.name, Main)
window.$vueApp.component(Header.name, Header)
window.$vueApp.component(Footer.name, Footer)
window.$vueApp.component(Tree.name, Tree)
window.$vueApp.component(Link.name, Link)
window.$vueApp.component(Dropdown.name, Dropdown)
window.$vueApp.component(DropdownItem.name, DropdownItem)
window.$vueApp.component(DropdownMenu.name, DropdownMenu)
// Vue.component(DatePicker.name, DatePicker)
window.$vueApp.component(Switch.name, Switch)
window.$vueApp.component(Tooltip.name, Tooltip)
window.$vueApp.component(Tag.name, Tag)
window.$vueApp.component(Drawer.name, Drawer)
window.$vueApp.component(Notification.name, Notification)
window.$vueApp.component(Cascader.name, Cascader)
window.$vueApp.component(Alert.name, Alert)
window.$vueApp.component(Steps.name, Steps)
window.$vueApp.component(Step.name, Step)
window.$vueApp.component(Transfer.name, Transfer)
window.$vueApp.component(Badge.name, Badge)
window.$vueApp.component(Progress.name, Progress)
window.$vueApp.component(Collapse.name, Collapse)
window.$vueApp.component(CollapseItem.name, CollapseItem)
window.$vueApp.component(Divider.name, Divider)
window.$vueApp.component(Skeleton.name, Skeleton)
window.$vueApp.component(SkeletonItem.name, SkeletonItem)
window.$vueApp.component(Breadcrumb.name, Breadcrumb)
window.$vueApp.component(BreadcrumbItem.name, BreadcrumbItem)
window.$vueApp.component(Empty.name, Empty)
window.$vueApp.use(Loading.directive)
window.$vueApp.use(InfiniteScroll)

const showMessage = Symbol('showMessage')

class MessageConstructor {
  constructor() {
    const types = ['success', 'warning', 'info', 'error']
    types.forEach((type) => {
      this[type] = (options) => this[showMessage](type, options)
    })
  }

  [showMessage](type, options) {
    const domList = document.getElementsByClassName('el-message')

    if (!domList.length) {
      return _Message[type](options)
    } else {
      let canShow = true
      const message = typeof options === 'string' ? options : options.message
      for (const dom of domList) {
        if (message === dom.innerText) {
          console.log('重复消息', dom) // eslint-disable-line
          canShow = false
          break
        }
      }
      if (canShow) {
        return _Message[type](options)
      }
    }
  }
}

export const Message = new MessageConstructor()
export const message = Message

window.$vueApp.config.globalProperties.$loading = Loading.service

window.$vueApp.config.globalProperties.$prompt = MessageBox.prompt
window.$vueApp.config.globalProperties.$alert = MessageBox.alert
window.$vueApp.config.globalProperties.$message = Message
window.$vueApp.config.globalProperties.$msgbox = MessageBox
window.$vueApp.config.globalProperties.$notify = Notification
