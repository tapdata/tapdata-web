import Vue from "vue";
import Form from "./form.vue";
import Input from "./input.vue";
import Select from "./select.vue";
import Radio from "./radio.vue";
import Switch from "./switch.vue";

[Form, Input, Select, Radio, Switch].map(c => Vue.component(c.name, c));
