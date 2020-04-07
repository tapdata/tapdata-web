/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/24/20
 * @description
 */
import Component from '../lib/Component';
import $ from 'jquery';
import log from "../../log";
import i18n from '../../i18n/i18n';
import Vue from 'vue';

export default class VueComponent extends Component{

	constructor(opts) {
		super(opts);
		this.init();
	}

	doInit() {
		let self = this;
		let editor = this.opts.editor;
		let component = this.opts.component;

		log('VueComponent.doInit', this.opts.dataFlow);

		self.el = $(`<div class="e-vue-component-wrap"></div>`);

		let Comp = Vue.extend(component);

		let vm = self.vm = new Comp({
			i18n,
			propsData: {
				dataFlow: this.opts.dataFlow || {}
			}
		});
		vm.editor = editor;

		let vueContainerDom = document.createElement('div');
		this.getContentEl().append(vueContainerDom);
		vm.$mount(vueContainerDom);
		vm.$on('dataChanged', (data) => {
			self.emit('dataChanged', data);
		});

		editor.graph.on('selected:stage', this.selectedStage, this);
	}

	getContentEl() {
		return this.el;
	}

	selectedStage(stageData) {
		log('VueComponent.selected.stage', stageData);
		if( this.vm ){
			this.vm.$emit('selected:stage', stageData);
		}
	}

	setData(data){
		if( this.vm && typeof this.vm.setData === 'function'){
			this.vm.setData(data);
		}
	}

	destroy(){
		let component = this.opts.component;
		log(`VueComponent[${component && component.name}].destroy`);
		if( this.vm ){
			this.vm.$destroy();
		}
		this.opts.editor.off('selected:stage', this.selectedStage);
		this.el.remove();
	}

}
