/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from 'vue';
import Panel from "./ui/panel";
import {EditorEventType} from "./lib/events";

export const vueAdapter = {};

//const privateMap = new WeakMap();
let vm = null,
	handlerResize = function(e){
		if( vm ){
			vm.$emit(EditorEventType.RESIZE, e);
		}
	},
	handlerHide = function(e){
		if( vm ){
			vm.$destroy();
		}
	},
	handlerTapChanged =function(tab){
		if (vm){
			if( tab && tab.opts && tab.opts.name === 'settings'){
				vm.$emit('show');
			} else {
				vm.$emit('hide');
			}
		}

	};
export const render = function(ui, name, data, callback){

	let settings = ui.rightTabPanel.getChildByName('settings');
	if(!settings) {
		settings = new Panel({
			name: 'settings',
			title: 'Settings'
		});
		ui.rightTabPanel.add(settings);
	}
	settings.removeAll();

	let containerEl = settings.getContentEl();

	if( vueAdapter[name] ){
		let vueComponentConfig = vueAdapter[name];
		if( vm ){
			vm.$destroy();
		}
		let Comp = Vue.extend(vueComponentConfig.component);
		vm = new Comp({
			propsData: Object.assign({}, vueComponentConfig.props || {})
		});

		let vueContainerDom = document.createElement('div');
		containerEl.append(vueContainerDom);
		vm.$mount(vueContainerDom);

		if( data ) {
			if( typeof vm.setData === "function"){
				vm.setData(data);
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}
		}
		vm.$on('dataChanged', callback);

		if( !ui.rightSidebar._callbackIsExists(EditorEventType.RESIZE, handlerResize) ) {
			ui.rightSidebar.on(EditorEventType.RESIZE, handlerResize);
		}
		if( !ui.rightSidebar._callbackIsExists(EditorEventType.HIDE, handlerHide) ) {
			ui.rightSidebar.on(EditorEventType.HIDE, handlerHide);
		}
		if( !ui.rightTabPanel._callbackIsExists(EditorEventType.SELECTED, handlerTapChanged)){
			ui.rightTabPanel.on(EditorEventType.SELECTED, handlerTapChanged);
		}

		return vm;

	}
};
