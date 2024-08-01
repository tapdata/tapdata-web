import i18n from '@/i18n'
import Vue from 'vue'
import {
  Alert,
  Card,
  Container,
  Header,
  Main,
  Aside,
  Menu,
  MenuItem,
  Button,
  Drawer,
  Form,
  FormItem,
  Checkbox,
  Image,
  Radio,
  RadioGroup,
  RadioButton,
  Select,
  Option,
  OptionGroup,
  Input,
  InputNumber,
  Tooltip,
  Link,
  Table,
  TableColumn,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Tag,
  Breadcrumb,
  BreadcrumbItem,
  Message as _Message,
  MessageBox,
  Loading,
  Dialog,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Progress,
  Footer,
  Switch,
  Popover,
  Tabs,
  TabPane,
  Transfer,
  Steps,
  Step,
  Badge,
  Cascader,
  ButtonGroup,
  Upload,
  Autocomplete,
  Collapse,
  CollapseItem,
  Notification,
  Divider,
  Tree,
  CheckboxGroup,
  Skeleton,
  SkeletonItem,
  Submenu,
  InfiniteScroll,
  Empty,
  Slider,
  Timeline,
  TimelineItem,
  Result
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import 'element-ui/lib/theme-chalk/index.css'
import { getCell, getColumnByCell } from 'element-ui/packages/table/src/util'
import { getStyle, hasClass } from 'element-ui/src/utils/dom'
import TableBody from 'element-ui/packages/table/src/table-body'

// 提示框默认不显示箭头
Tooltip.props.visibleArrow.default = false

// 优化任务名称和标签一起显示，超出显示提示框的逻辑
TableBody.methods.handleCellMouseEnter = function (event, row) {
  const table = this.table
  const cell = getCell(event)

  if (cell) {
    const column = getColumnByCell(table, cell)
    const hoverState = (table.hoverState = { cell, column, row })
    table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
  }

  // 判断是否text-overflow, 如果是就显示tooltip
  const cellChild = event.target.querySelector('.cell')
  if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
    return
  }

  const showTooltip = () => {
    const tooltip = this.$refs.tooltip
    if (!tooltip) return
    // TODO 会引起整个 Table 的重新渲染，需要优化
    this.tooltipContent = cell.innerText || cell.textContent
    tooltip.referenceElm = cell
    tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
    tooltip.doDestroy()
    tooltip.setExpectedState(true)
    this.activateTooltip(tooltip)
  }

  const padding =
    (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) + (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
  const range = document.createRange()
  let isEllipsisActive
  let tooltipContent

  // 任务名称场景的特殊处理
  const $ellipsis = cellChild.querySelector('[role="ellipsis"]')

  if ($ellipsis) {
    range.setStart($ellipsis, 0)
    range.setEnd($ellipsis, $ellipsis.childNodes.length)
    const rangeWidth = range.getBoundingClientRect().width
    const spacing =
      (parseInt(getStyle($ellipsis, 'paddingLeft'), 10) || 0) +
      (parseInt(getStyle($ellipsis, 'paddingRight'), 10) || 0) +
      (parseInt(getStyle($ellipsis, 'marginLeft'), 10) || 0) +
      (parseInt(getStyle($ellipsis, 'marginRight'), 10) || 0)

    tooltipContent = $ellipsis.innerText || $ellipsis.textContent
    isEllipsisActive =
      rangeWidth + spacing > cellChild.offsetWidth - padding || $ellipsis.scrollWidth > $ellipsis.offsetWidth
  } else {
    range.setStart(cellChild, 0)
    range.setEnd(cellChild, cellChild.childNodes.length)
    const rangeWidth = range.getBoundingClientRect().width

    let textEl = cellChild.querySelector('.ellipsis') || cellChild
    tooltipContent = textEl.innerText || textEl.textContent
    isEllipsisActive = rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth
  }

  // use range width instead of scrollWidth to determine whether the text is overflowing
  // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3

  if (isEllipsisActive && this.$refs.tooltip) {
    const tooltip = this.$refs.tooltip
    // TODO 会引起整个 Table 的重新渲染，需要优化
    this.tooltipContent = tooltipContent
    tooltip.referenceElm = cell
    tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
    tooltip.doDestroy()
    tooltip.setExpectedState(true)
    this.activateTooltip(tooltip)
  }
}

const showMessage = Symbol('showMessage')

class MessageConstructor {
  constructor() {
    const types = ['success', 'warning', 'info', 'error']
    types.forEach(type => {
      this[type] = options => this[showMessage](type, options)
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
          console.log(i18n.t('dfs_plugins_element_chongfuxiaoxi'), dom) // eslint-disable-line
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

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
Vue.prototype.$message = Message

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert

Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$loading = Loading.service
Vue.prototype.$notify = Notification
window.loading = Loading.service

Vue.use(Loading.directive)

Vue.use(Card)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Drawer)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Checkbox)
Vue.use(Image)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Tooltip)
Vue.use(Link)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(TableColumn)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Pagination)
Vue.use(Tag)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Dialog)
Vue.use(Row)
Vue.use(Col)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(Progress)
Vue.use(Footer)
Vue.use(Switch)
Vue.use(Popover)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Transfer)
Vue.use(Badge)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Cascader)
Vue.use(ButtonGroup)
Vue.use(Upload)
Vue.use(Autocomplete)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Divider)
Vue.use(Tree)
Vue.use(CheckboxGroup)
Vue.use(Skeleton)
Vue.use(SkeletonItem)
Vue.use(Submenu)
Vue.use(InfiniteScroll)
Vue.use(Alert)
Vue.use(Empty)
Vue.use(Slider)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Result)
Vue.component(CollapseTransition.name, CollapseTransition)
