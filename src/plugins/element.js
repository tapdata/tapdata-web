// 按需引入element-ui减少项目体积
import Vue from 'vue';


import {
  Popover,
  Radio,
  RadioGroup,
  RadioButton,
  Dialog,
  MessageBox,
  Message,
  Menu,
  MenuItem,
  Form,
  FormItem,
  Input,
  Button,
  Select,
  Table,
  TableColumn,
  Option,
  Row,
  Col,
  Pagination,
  DatePicker,
  Container,
  Main,
  Header,
  Tree,
  Dropdown,
  DropdownItem,
  DropdownMenu, TimePicker, Switch,
} from 'element-ui';

Vue.component(Popover.name, Popover);
Vue.component(Radio.name, Radio);
Vue.component(RadioGroup.name, RadioGroup);
Vue.component(RadioButton.name, RadioButton);
Vue.component(Dialog.name, Dialog);
Vue.component(Menu.name, Menu);
Vue.component(MenuItem.name, MenuItem);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Option.name, Option);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Pagination.name, Pagination);
Vue.component(DatePicker.name, DatePicker);
Vue.component(Container.name, Container);
Vue.component(Main.name, Main);
Vue.component(Header.name, Header);
Vue.component(Tree.name, Tree);
Vue.component(Dropdown.name, Dropdown);
Vue.component(DropdownItem.name, DropdownItem);
Vue.component(DropdownMenu.name, DropdownMenu);
Vue.component(DatePicker.name, DatePicker);
Vue.component(Switch.name, Switch);


/***提示只显示一次**/
// 因为使用了new DonMessage()的原因，所以导致this.$message(options)的方式无法使用
// 推荐使用this.$message.success('成功提示')或者this.$message.success(options)的方式进行调用
const showMessage = Symbol('showMessage');
class DoneMessage {
  [showMessage](type, options, single) {
    if (single) {
      if (document.getElementsByClassName('el-message').length === 0) {
          Message[type](options);
      }
    } else {
      Message[type](options);
    }
  }
  info(options, single = true) {
    this[showMessage]('info', options, single);
  }
  warning(options, single = true) {
    this[showMessage]('warning', options, single);
  }
  error(options, single = true) {
    this[showMessage]('error', options, single);
  }
  success(options, single = true) {
    this[showMessage]('success', options, single);
  }
}
export const message = new DoneMessage();

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = new DoneMessage();
