// 按需引入element-ui减少项目体积
import Vue from 'vue'

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
  Empty
} from 'element-ui'

// 组件默认尺寸为small
Vue.prototype.$ELEMENT = { size: 'small' }
// 提示框默认不显示箭头
Tooltip.props.visibleArrow.default = false

//重写ElementUI Select组件多选时的触发函数，去掉去重的处理
Select.methods.handleOptionSelect = function (option, byClick) {
  var _this12 = this

  if (_this12.multiple) {
    var value = (_this12.value || []).slice()
    var optionIndex = _this12.getValueIndex(value, option.value)
    if (optionIndex > -1 && byClick) {
      value.splice(optionIndex, 1)
    } else if (_this12.multipleLimit <= 0 || value.length < _this12.multipleLimit) {
      value.push(option.value)
    }
    _this12.$emit('input', value)
    _this12.emitChange(value)
    if (option.created) {
      _this12.query = ''
      _this12.handleQueryChange('')
      _this12.inputLength = 20
    }
    if (_this12.filterable) _this12.$refs.input.focus()
  } else {
    _this12.$emit('input', option.value)
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

Vue.component(Card.name, Card)
Vue.component(InputNumber.name, InputNumber)
Vue.component(Autocomplete.name, Autocomplete)
Vue.component(Upload.name, Upload)
Vue.component(Image.name, Image)
Vue.component(Tabs.name, Tabs)
Vue.component(TabPane.name, TabPane)
Vue.component(Popover.name, Popover)
Vue.component(Radio.name, Radio)
Vue.component(RadioGroup.name, RadioGroup)
Vue.component(RadioButton.name, RadioButton)
Vue.component(Checkbox.name, Checkbox)
Vue.component(CheckboxGroup.name, CheckboxGroup)
Vue.component(CheckboxButton.name, CheckboxButton)
Vue.component(Dialog.name, Dialog)
Vue.component(Menu.name, Menu)
Vue.component(Submenu.name, Submenu)
Vue.component(MenuItem.name, MenuItem)
Vue.component(Form.name, Form)
Vue.component(FormItem.name, FormItem)
Vue.component(Input.name, Input)
Vue.component(Button.name, Button)
Vue.component(ButtonGroup.name, ButtonGroup)
Vue.component(Select.name, Select)
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
Vue.component(Option.name, Option)
Vue.component(OptionGroup.name, OptionGroup)
Vue.component(Row.name, Row)
Vue.component(Col.name, Col)
Vue.component(Pagination.name, Pagination)
Vue.component(DatePicker.name, DatePicker)
Vue.component(TimePicker.name, TimePicker)
Vue.component(Container.name, Container)
Vue.component(Aside.name, Aside)
Vue.component(Main.name, Main)
Vue.component(Header.name, Header)
Vue.component(Footer.name, Footer)
Vue.component(Tree.name, Tree)
Vue.component(Link.name, Link)
Vue.component(Dropdown.name, Dropdown)
Vue.component(DropdownItem.name, DropdownItem)
Vue.component(DropdownMenu.name, DropdownMenu)
// Vue.component(DatePicker.name, DatePicker)
Vue.component(Switch.name, Switch)
Vue.component(Tooltip.name, Tooltip)
Vue.component(Tag.name, Tag)
Vue.component(Drawer.name, Drawer)
Vue.component(Notification.name, Notification)
Vue.component(Cascader.name, Cascader)
Vue.component(Alert.name, Alert)
Vue.component(Steps.name, Steps)
Vue.component(Step.name, Step)
Vue.component(Transfer.name, Transfer)
Vue.component(Badge.name, Badge)
Vue.component(Progress.name, Progress)
Vue.component(Collapse.name, Collapse)
Vue.component(CollapseItem.name, CollapseItem)
Vue.component(Divider.name, Divider)
Vue.component(Skeleton.name, Skeleton)
Vue.component(SkeletonItem.name, SkeletonItem)
Vue.component(Breadcrumb.name, Breadcrumb)
Vue.component(BreadcrumbItem.name, BreadcrumbItem)
Vue.component(Empty.name, Empty)
Vue.use(Loading.directive)
Vue.use(InfiniteScroll)

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

Vue.prototype.$loading = Loading.service

Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$message = Message
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$notify = Notification
