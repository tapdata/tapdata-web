/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from 'vue';
import Panel from './ui/panel';
import { EditorEventType } from './lib/events';
import BaseObject from './lib/BaseObject';
import { FORM_DATA_KEY } from './constants';
import i18n from '../i18n/i18n';

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
		// if (this.vm) {
		// 	this.vm.$destroy();
		// 	this.vm = null;
		// }

		if (!cell.showSettings || !cell.showSettings()) {
			return null;
		}

		if (this.editor.seeMonitor) return;

		this.editor.getRightSidebar().hide();
		let self = this;
		let name = cell.get('type');
		let formData = self.getFormDataForCell(cell);
		let isDataNode = cell.isElement() && typeof cell.isDataNode === 'function' && cell.isDataNode();
		let isSourceDataNode = isDataNode && self.graphUI.graph.getConnectedLinks(cell, { inbound: true }).length === 0;
		self.curcell = cell;

		if (vueAdapter[name] && vueAdapter[name].component) {
			if (!vueAdapter[name]._panel || !self.editor.getRightTabPanel().getChildByName(name)) {
				let vueComponentConfig = vueAdapter[name];
				let Comp = Vue.extend(vueComponentConfig.component);

				let settings = self.editor.getRightTabPanel().getChildByName(name);
				if (!settings) {
					settings = new Panel({
						name: name,
						title: i18n.t('editor.ui.sidebar.node_setting')
					});
					self.editor.getRightTabPanel().add(settings, true);
				}

				self.vm = new Comp({
					i18n,
					propsData: Object.assign({}, vueComponentConfig.props || {})
				});

				self.vm._initData = JSON.parse(JSON.stringify(self.vm._data));

				self.editor.getRightTabPanel().select(settings);
				settings.removeAll();

				let vueContainerDom = document.createElement('div');
				settings.getContentEl().append(vueContainerDom);
				self.vm.$mount(vueContainerDom);
				vueAdapter[name]._vm = self.vm;
				vueAdapter[name]._panel = settings;
			} else {
				self.vm = vueAdapter[name]._vm;
				self.vm.$off('dataChanged');
				self.vm.$off('schemaChange');
				Object.keys(self.vm._initData).forEach(key => {
					self.vm[key] = self.vm._initData[key];
				});
				if (self.vm.$options.mounted) self.vm.$options.mounted[0].call(self.vm);
				self.editor.getRightTabPanel().select(vueAdapter[name]._panel);
				self.vm.$on(EditorEventType.HIDE, () => {
					self.vm.$off('dataChanged');
					self.vm.$off('schemaChange');
				});
			}
			let editable = self.editor.editable;
			if (!editable) {
				// running mode
				if (typeof self.vm.setDisabled === 'function') {
					self.vm.setDisabled(true);
				}
			}
			self.editor.getRightSidebar().show();
			if (typeof self.vm.setData === 'function') {
				self.vm.setData(formData, cell, isSourceDataNode, self);
				self.vm.$on('dataChanged', data => {
					self.setFormData(self.curcell, data);
				});
				self.vm.$on('schemaChange', schema => {
					self.curcell.setSchema(schema);
				});
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}

			return self.vm;
		}
	}

	handlerResize(e) {
		if (this.vm) {
			this.vm.$emit(EditorEventType.RESIZE, e);
		}
	}

	handlerHide() {
		if (this.vm) {
			//this.vm.$destroy();
			this.vm.$emit(EditorEventType.HIDE);
		}
		let settings = this.editor.getRightSidebar().getChildByName('settings');
		if (settings) {
			this.editor.getRightSidebar().remove(settings);
		}
	}

	handlerTapChanged(tab) {
		if (this.vm) {
			if (tab && tab.opts && tab.opts.name === 'settings') {
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
		cell.set(FORM_DATA_KEY, data);
	}
	getFormDataForCell(cell) {
		if (typeof cell === 'string') cell = this.graphUI.graph.getCell(cell);

		if (typeof cell.id === 'string') cell = this.graphUI.graph.getCell(cell.id);

		return cell && (cell.get('form_data') ? cell.get('form_data') : cell.attributes.attrs.form_data);
	}
}
