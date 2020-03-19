/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from 'vue';
import Panel from "./ui/panel";
import {EditorEventType} from "./lib/events";
import BaseObject from './lib/BaseObject';
import log from '../log';
import _ from 'lodash';
import {mergeJoinTablesToTargetSchema} from "../view/job/components/Schema";

export const vueAdapter = {};
//const privateMap = new WeakMap();
export const FORM_DATA_KEY = 'form_data';
export const SCHEMA_DATA_KEY = 'schema_form_data';

export class VueAdapter extends BaseObject {

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
		log.log('VueAdapter.render', cell);
		let self = this;
		let name = cell.get('type');
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
				if( !self.vm.canShow(cell.toJSON(), allCell, graphLib, self.graphUI) ){
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
				self.vm.setData(formData, cell.toJSON(), allCell, graphLib, self);
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}

			self.vm.$on('dataChanged', (data) => {
				self.setFormData(cell, data);
			});

			self.vm.$on('changeSchema', (schema) => {
				self.setSchema(cell, schema);
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
		log.log('VueAdapter.setFormData', ...arguments);
		cell.set(FORM_DATA_KEY, data);
	}
	getFormDataForCell(cell){
		if( typeof cell === 'string')
			cell = this.graphUI.graph.getCell(cell);

		if( typeof cell.id === 'string')
			cell = this.graphUI.graph.getCell(cell.id);

		return cell && cell.get(FORM_DATA_KEY);
	}
	setSchema(cell, schema) {
		log.log('VueAdapter.setSchema', ...arguments);

		if( ['app.Table', 'app.Collection'].includes(cell.type) ){

			cell.set(SCHEMA_DATA_KEY, schema);

			let self = this;
			let allCell =  self.graphUI.getData();

			// 1. get predecessors and merge

			// 2. push all successors and merge
			let cells = allCell.cells ? allCell.cells : [];
			let edgeCells = {};
			let nodeCells = {};
			cells.forEach(cell => {
				if( cell.type === 'app.Link')
					edgeCells[cell.id] = cell;
				else
					nodeCells[cell.id] = cell;
			});
			let graphLib = self.graphUI.graph.toGraphLib();
			const dataNodeTypes = ['app.Table', 'app.Collection'];
			//const processTypes = ['app.Script'];
			const recursive = function(currentNodeId, forward = true){

				let nodeCell = nodeCells[currentNodeId];
				if( nodeCell ){

					// 1. get joinTable config
					let mergedSchema;
					if( dataNodeTypes.includes(cell.type)) {
						mergedSchema = _.cloneDeep(self.getSchemaForCell());
						let joinTables = self.getJoinTablesForTargetCell(nodeCell, allCell);
						mergeJoinTablesToTargetSchema(mergedSchema, joinTables);
					} else {
						mergedSchema = nodeCell.get(SCHEMA_DATA_KEY);
					}

					nodeCell.set(SCHEMA_DATA_KEY, mergedSchema);

					// 2. push all successors and merge
					let nextNodes = forward ?
						graphLib.successors(currentNodeId) :
						graphLib.predecessors(currentNodeId);
					if( nextNodes && nextNodes.length > 0 ){
						nextNodes.forEach((nodeId) => recursive(nodeId, forward));
					}
				}
			};
			recursive(cell.id, true);

		}
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
		log.log('VueAdapter.getJoinTablesForTargetCell', ...arguments);
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
			.map( edge => edge[FORM_DATA_KEY] && edge[FORM_DATA_KEY].joinTable);

		// assign source schema to joinTable
		joinTables.forEach( joinTable => {
			if( joinTable ){
				joinTable.sourceSchemas = [];
				if( joinTable.sourceNodeIds && joinTable.sourceNodeIds.length > 0 ){
					joinTable.sourceNodeIds.forEach(
						nodeId => joinTable.sourceSchemas.push(
							nodeCells[nodeId] &&
							nodeCells[nodeId][FORM_DATA_KEY] &&
							nodeCells[nodeId][FORM_DATA_KEY].schema));
				}
			}
		});

		return joinTables.filter( (v) => !!v);
	}
}
