import Vue from "vue";
import Form from "./form.vue";
import Input from "./input.vue";
import Select from "./select.vue";
import Radio from "./radio.vue";

[Form, Input, Select, Radio].map(c => Vue.component(c.name, c));
