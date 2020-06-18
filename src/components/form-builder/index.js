import Vue from 'vue';
import Form from './form.vue';
import Input from './input.vue';
import Select from './select.vue';
import Radio from './radio.vue';
import Switch from './switch.vue';
import File from './file.vue';

[Form, Input, Select, Radio, Switch, File].map(c => Vue.component(c.name, c));
