/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/24/20
 * @description
 */
import Component from "../lib/Component";
import $ from "jquery";
import log from "../../log";
import i18n from "../../i18n/i18n";
import Vue from "vue";
import { EditorEventType } from "../lib/events";

export default class VueComponent extends Component {
  constructor(opts) {
    super(opts);
    this.init();
  }

  doInit() {
    let self = this;
    let editor = this.opts.editor;
    let component = this.opts.component;

    log("VueComponent.doInit", this.opts.dataFlow);

    self.el = $(`<div class="e-vue-component-wrap"></div>`);

    let Comp = Vue.extend(component);

    let propsData = this.opts.propsData || {};
    let vm = (self.vm = new Comp({
      i18n,
      propsData
    }));
    vm.editor = editor;

    let vueContainerDom = document.createElement("div");
    this.getContentEl().append(vueContainerDom);
    vm.$mount(vueContainerDom);
    vm.$on("dataChanged", data => {
      self.emit("dataChanged", data);
    });

    editor.graph.on(EditorEventType.SELECTED_STAGE, this.selectedStage, this);
    this.on(EditorEventType.RESIZE, function() {
      self.handlerResize(...arguments);
    });
  }

  getContentEl() {
    return this.el;
  }

  handlerResize() {
    if (this.vm) {
      this.vm.$emit(EditorEventType.RESIZE, ...arguments);
    }
  }

  selectedStage(stageData) {
    log("VueComponent.selected.stage", stageData);
    if (this.vm) {
      this.vm.$emit(EditorEventType.SELECTED_STAGE, stageData);
    }
  }

  setData(data) {
    if (this.vm && typeof this.vm.setData === "function") {
      this.vm.setData(data);
    }
  }

  destroy() {
    let component = this.opts.component;
    log(`VueComponent[${component && component.name}].destroy`);
    if (this.vm) {
      this.vm.$destroy();
    }
    this.opts.editor.off(EditorEventType.SELECTED_STAGE, this.selectedStage);
    this.el.remove();
  }
}
