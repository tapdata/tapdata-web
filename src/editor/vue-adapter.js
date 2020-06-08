/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from "vue";
import Panel from "./ui/panel";
import {
	EditorEventType
} from "./lib/events";
import BaseObject from "./lib/BaseObject";
import log from "../log";
import {
	FORM_DATA_KEY
} from "./constants";
import i18n from "../i18n/i18n";

export const vueAdapter = {};
// const privateMap = new WeakMap();

export class VueAdapter extends BaseObject {
	vm = null;

	constructor(editor, graphUI) {
		super();

		this.editor = editor;
		this.graphUI = graphUI;

		this.editor.on(EditorEventType.BEFORE_DESTROY, this.destroy.bind(this));
		editor.getRightSidebar().on(EditorEventType.RESIZE, this.handlerResize.bind(this));
		editor.getRightSidebar().on(EditorEventType.HIDE, this.handlerHide.bind(this));
		editor.getRightTabPanel().on(EditorEventType.SELECTED, this.handlerTapChanged.bind(this));
		editor.on(EditorEventType.DATA_FLOW_UPDATED, this.handlerDataFlowUpdated.bind(this));
	}

	/**
	 * render selected cell attribute form
	 * @param cell
	 * @return {*}
	 */
	render(cell) {
		log("VueAdapter.render", cell);

		if (this.vm) {
			this.vm.$destroy();
			this.vm = null;
		}

		if (!cell.showSettings || !cell.showSettings()) {
			return null;
		}

		let self = this;
		let name = cell.get("type");
		let formData = self.getFormDataForCell(cell);
		let isDataNode = cell.isElement() && typeof cell.isDataNode === "function" && cell.isDataNode();
		let isSourceDataNode = isDataNode && self.graphUI.graph.getConnectedLinks(cell, {
			inbound: true
		}).length === 0;

		if (vueAdapter[name] && vueAdapter[name].component) {
			let vueComponentConfig = vueAdapter[name];
			let Comp = Vue.extend(vueComponentConfig.component);

			let settings = self.editor.getRightTabPanel().getChildByName("nodeSettingPanel");
			if (!settings) {
				settings = new Panel({
					name: "nodeSettingPanel",
					title: i18n.t("editor.ui.sidebar.node_setting")
				});
				self.editor.getRightTabPanel().add(settings, true);
			}

			self.vm = new Comp({
				i18n,
				propsData: Object.assign({}, vueComponentConfig.props || {})
			});

			if(self.editor.editable)
				self.editor.getRightTabPanel().select(settings);
			settings.removeAll();

			let vueContainerDom = document.createElement("div");
			settings.getContentEl().append(vueContainerDom);
			self.vm.$mount(vueContainerDom);

			if (typeof self.vm.setData === "function") {
				self.vm.setData(formData, cell, isSourceDataNode, self);
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}

			let editable = self.editor.editable;
			if (!editable) { // running mode
				if (typeof self.vm.setDisabled === "function") {
					self.vm.setDisabled(true);
				}
			}

			self.vm.$on("dataChanged", data => {
				self.setFormData(cell, data);
			});

			self.vm.$on("schemaChange", schema => {
				log("VueAdapter.schemaChange", arguments);
				cell.setSchema(schema);
			});

			self.editor.getRightSidebar().show();

			return self.vm;
		}
	}

	handlerResize(e) {
		if (this.vm) {
			this.vm.$emit(EditorEventType.RESIZE, e);
		}
	}

	handlerHide(e) {
		if (this.vm) {
			this.vm.$destroy();
		}
		let settings = this.editor.getRightSidebar().getChildByName("settings");
		if (settings) {
			this.editor.getRightSidebar().remove(settings);
		}
	}

	handlerTapChanged(tab) {
		if (this.vm) {
			if (tab && tab.opts && tab.opts.name === "settings") {
				this.vm.$emit(EditorEventType.SHOW);
			} else {
				this.vm.$emit(EditorEventType.HIDE);
			}
		}
	}

	handlerDataFlowUpdated(dataFlow) {
		if (this.vm) {
			this.vm.$emit(EditorEventType.DATA_FLOW_UPDATED, dataFlow);
		}
	}

	destroy() {
		if (this.vm) {
			this.vm.$destroy();
		}
		this.editor.off(EditorEventType.BEFORE_DESTROY, this.destroy);
	}

	/**
	 *
	 * @param cell
	 * @param data
	 */
	setFormData(cell, data) {
		log("VueAdapter.setFormData", this, ...arguments);
		cell.set(FORM_DATA_KEY, data);
	}
	getFormDataForCell(cell) {
		if (typeof cell === "string") cell = this.graphUI.graph.getCell(cell);

		if (typeof cell.id === "string") cell = this.graphUI.graph.getCell(cell.id);

		return cell && cell.get(FORM_DATA_KEY);
	}
}
