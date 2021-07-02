import Vue from 'vue'
import {
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
  Message,
  MessageBox,
  Loading,
  Dialog,
  Row,
  Col,
  DatePicker,
  Progress
} from 'element-ui'

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
Vue.prototype.$message = Message

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert

// 封装确认弹窗
Vue.prototype.$confirm = (param1, param2, param3 = { type: 'warning' }) => {
  return new Promise((resolve, reject) => {
    MessageBox.confirm(param1, param2, param3)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  }).catch(() => {
    // TODO error
  })
}

Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$loading = Loading.service
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
Vue.use(Progress)
