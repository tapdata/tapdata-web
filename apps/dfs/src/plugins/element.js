import * as Vue from 'vue'
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
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

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

window.$vueApp.config.globalProperties.$ELEMENT = {
  size: 'small',
  zIndex: 3000,
}
window.$vueApp.config.globalProperties.$message = Message

window.$vueApp.config.globalProperties.$msgbox = MessageBox
window.$vueApp.config.globalProperties.$alert = MessageBox.alert

window.$vueApp.config.globalProperties.$prompt = MessageBox.prompt
window.$vueApp.config.globalProperties.$loading = Loading.service
window.$vueApp.config.globalProperties.$notify = Notification
window.loading = Loading.service

window.$vueApp.use(Loading.directive)

window.$vueApp.use(Card)
window.$vueApp.use(Container)
window.$vueApp.use(Header)
window.$vueApp.use(Main)
window.$vueApp.use(Aside)
window.$vueApp.use(Drawer)
window.$vueApp.use(Menu)
window.$vueApp.use(MenuItem)
window.$vueApp.use(Button)
window.$vueApp.use(Form)
window.$vueApp.use(FormItem)
window.$vueApp.use(Checkbox)
window.$vueApp.use(Image)
window.$vueApp.use(Radio)
window.$vueApp.use(RadioGroup)
window.$vueApp.use(RadioButton)
window.$vueApp.use(Select)
window.$vueApp.use(Option)
window.$vueApp.use(OptionGroup)
window.$vueApp.use(Input)
window.$vueApp.use(InputNumber)
window.$vueApp.use(Tooltip)
window.$vueApp.use(Link)
window.$vueApp.use(Table)
window.$vueApp.use(TableColumn)
window.$vueApp.use(TableColumn)
window.$vueApp.use(Dropdown)
window.$vueApp.use(DropdownMenu)
window.$vueApp.use(DropdownItem)
window.$vueApp.use(Pagination)
window.$vueApp.use(Tag)
window.$vueApp.use(Breadcrumb)
window.$vueApp.use(BreadcrumbItem)
window.$vueApp.use(Dialog)
window.$vueApp.use(Row)
window.$vueApp.use(Col)
window.$vueApp.use(DatePicker)
window.$vueApp.use(TimePicker)
window.$vueApp.use(Progress)
window.$vueApp.use(Footer)
window.$vueApp.use(Switch)
window.$vueApp.use(Popover)
window.$vueApp.use(Tabs)
window.$vueApp.use(TabPane)
window.$vueApp.use(Transfer)
window.$vueApp.use(Badge)
window.$vueApp.use(Steps)
window.$vueApp.use(Step)
window.$vueApp.use(Cascader)
window.$vueApp.use(ButtonGroup)
window.$vueApp.use(Upload)
window.$vueApp.use(Autocomplete)
window.$vueApp.use(Collapse)
window.$vueApp.use(CollapseItem)
window.$vueApp.use(Divider)
window.$vueApp.use(Tree)
window.$vueApp.use(CheckboxGroup)
window.$vueApp.use(Skeleton)
window.$vueApp.use(SkeletonItem)
window.$vueApp.use(Submenu)
window.$vueApp.use(InfiniteScroll)
window.$vueApp.use(Alert)
window.$vueApp.use(Empty)
