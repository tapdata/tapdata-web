// 按需引入element-ui减少项目体积
import Vue from 'vue';


import {
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
} from 'element-ui';

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