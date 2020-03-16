/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from 'vue';
import Panel from "./ui/panel";
import {EditorEventType} from "./lib/events";
import BaseObject from './lib/BaseObject';

export const vueAdapter = {};
//const privateMap = new WeakMap();

export class VueAdapter extends BaseObject {

	formDataKey = 'form_data';
	vm = null;

	constructor(ui, graphUI){
		super();

		this.ui = ui;
		this.graphUI = graphUI;

		ui.rightSidebar.on(EditorEventType.RESIZE, this.handlerResize.bind(this));
		ui.rightSidebar.on(EditorEventType.HIDE, this.handlerHide.bind(this));
		ui.rightTabPanel.on(EditorEventType.SELECTED, this.handlerTapChanged.bind(this));
	}

	render(cell){
		let self = this;
		let name = cell.type;
		let formData = self.getFormDataForCell(cell);
		let allCell =  self.graphUI.getData();
		let graphLib = self.graphUI.graph.toGraphLib();

		if( vueAdapter[name] ){
			let vueComponentConfig = vueAdapter[name];
			let Comp = Vue.extend(vueComponentConfig.component);
			let settings = self.ui.rightTabPanel.getChildByName('settings');

			if( self.vm )
				self.vm.$destroy();

			self.vm = new Comp({
				propsData: Object.assign({}, vueComponentConfig.props || {})
			});

			if( typeof self.vm.canShow === 'function'){
				if( !self.vm.canShow(cell, allCell, graphLib, self.graphUI) ){
					self.vm.$destroy();
					if( settings ) self.ui.rightTabPanel.remove(settings);
					return null;
				}
			}

			if(!settings) {
				settings = new Panel({
					name: 'settings',
					title: 'Settings'
				});
				self.ui.rightTabPanel.add(settings);
				self.ui.rightTabPanel.select(settings);
			}
			settings.removeAll();
			let vueContainerDom = document.createElement('div');
			settings.getContentEl().append(vueContainerDom);
			self.vm.$mount(vueContainerDom);

			if( typeof self.vm.setData === "function"){
				self.vm.setData(formData, cell, allCell, graphLib, self);
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}

			self.vm.$on('dataChanged', (data) => {
				self.setFormData(cell, data);
			});

			return self.vm;

		}
	}

	/**
	 * validate form data
	 * @param nodeCell
	 * @returns {*}
	 */
	validate(nodeCell){
		if( nodeCell ){
			let typeName = nodeCell.type;
			let formData = this.getFormDataForCell(nodeCell);
			if( vueAdapter[typeName] && vueAdapter[typeName].settingFormConfig ){
				if( typeof vueAdapter[typeName].settingFormConfig.validate === 'function') {
					return vueAdapter[typeName].settingFormConfig.validate(formData);
				}
			}
		}
		return true;
	}

	handlerResize(e){
		if( this.vm ){
			this.vm.$emit(EditorEventType.RESIZE, e);
		}
	}

	handlerHide(e){
		if( this.vm ){
			this.vm.$destroy();
		}
	}

	handlerTapChanged(tab){
		if (this.vm){
			if( tab && tab.opts && tab.opts.name === 'settings'){
				this.vm.$emit('show');
			} else {
				this.vm.$emit('hide');
			}
		}

	}

	setFormData(cell, data) {
		//console.log(data);
		cell[this.formDataKey] = data;
	}
	getFormDataForCell(cell){
		return cell && cell[this.formDataKey];
	}
	getSchemaForCell(cell){
		let formData = this.getFormDataForCell(cell);
		return formData && formData.schema;
	}
	getJoinTableForCell(cell){
		let formData = this.getFormDataForCell(cell);
		return formData && formData.joinTable;
	}
	getJoinTablesForTargetCell(targetCell, allCell){
		let cells = allCell.cells ? allCell.cells : [];
		let edgeCells = {};
		let nodeCells = {};
		cells.forEach(cell => {
			if( cell.type === 'app.Link')
				edgeCells[cell.id] = cell;
			else
				nodeCells[cell.id] = cell;
		});
		let joinTables = Object.values(edgeCells)
			.filter(edge => edge.target && edge.target.id === targetCell.id )
			.map( edge => edge[this.formDataKey] && edge[this.formDataKey].joinTable);

		// assign source schema to joinTable
		joinTables.forEach( joinTable => {
			if( joinTable ){
				joinTable.sourceSchemas = [];
				if( joinTable.sourceNodeIds && joinTable.sourceNodeIds.length > 0 ){
					joinTable.sourceNodeIds.forEach(
						nodeId => joinTable.sourceSchemas.push(
							nodeCells[nodeId] &&
							nodeCells[nodeId][this.formDataKey] &&
							nodeCells[nodeId][this.formDataKey].schema));
				}
			}
		});

		return joinTables.filter( (v) => !!v);
	}
}
