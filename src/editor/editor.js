/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './lib/BaseObject';
import UI from './ui/ui';
import Graph from "./ui/graph";
import {loadPlugins} from './plugins';
import Sidebar from "./ui/sidebar";
import Tab from "./ui/tab";
import VueComponent from "./ui/VueComponent";
import EchartData from '../view/job/echartData';
import Capture from '../view/job/Preview';
import Setting from '../view/job/Setting';
import DebugLogs from '../view/job/DebugLogs';
import DataVerify from  '../view/job/DataVerify/List';
import DVLoading from  '../view/job/DataVerify/Loading';
import DVResult from  '../view/job/DataVerify/Result';

import log from "../log";
import Panel from "./ui/panel";
import TableSelector from "../view/job/TableSelector";
import {DEFAULT_SETTING} from "./constants";
import {EditorEventType} from "./lib/events";
import i18n from "../i18n/i18n";

export default class Editor extends BaseObject {

	/**
	 * user interface
	 * @type {UI}
	 */
	ui = null;

	/**
	 * left sidebar
	 * @type {Sidebar}
	 */
	leftSidebar = null;

	/**
	 * right sidebar
	 * @type {Sidebar}
	 */
	rightSidebar = null;

	/**
	 * bottom sidebar
	 * @type {Sidebar}
	 */
	bottomSidebar = null;

	/**
	 * right tab panel
	 * @type {Tab}
	 */
	bottomTabPanel = null;

	/**
	 * graph ui
	 * @type {Graph}
	 */
	graph = null;

	/**
	 *
	 * @type {boolean}
	 */
	editable = true;

	constructor(opts){
		super();

		this.container = opts.container;
		this.opts = opts;

		this.doInit();
	}

	doInit(){
		let self = this;

		// login plugins
		loadPlugins();

		let ui = self.ui = new UI(Object.assign({editor: self}, this.opts));
		ui.render(self.container);

		let leftSidebar = self.leftSidebar = new Sidebar({
			container: self.ui.el.find('.e-body'),
			prepend: true,
			region: 'left',
			editor: this,
			split: false,
			width: 235,
			bodyStyle: 'display: flex; flex-direction: column;'
		});
		ui.add(leftSidebar);

		let stencilPanel = new Panel({
			name: 'stencil',
			bodyStyle: 'height:223px'
		});
		leftSidebar.add(stencilPanel);

		self.rightSidebar = new Sidebar({
			container: self.ui.el.find('.e-body'),
			region: 'right',
			editor: this,
			hidden: true,
			maxWidth: 1000,
			minWidth: 500,
			width: 600
		});
		ui.add(self.rightSidebar);

		let rightTabPanel = new Tab({
			name: 'rightTabPanel'
		});
		self.rightSidebar.add(rightTabPanel);

		self.bottomSidebar = new Sidebar({
			container: self.ui.getContentEl(),
			region: 'bottom',
			editor: this,
			hidden: true,
			maxHeight: 1000,
			height: 520
		});
		ui.add(self.bottomSidebar);

		let bottomTabPanel = self.bottomTabPanel = new Tab();
		self.bottomSidebar.add(bottomTabPanel);

		self.graph = new Graph({
			editor: self,
			container: self.ui.getGraphContainer()
		});

		let treePanel = new Panel({
			name: 'treePanel',
			bodyStyle: 'flex: 1;height:57%;position:relative'
		});
		leftSidebar.add(treePanel);

		let treeVueComponent = new VueComponent({
			name: 'treeVueComponent',
			editor: this,
			component: TableSelector
		});
		treePanel.add(treeVueComponent);

		this.initSettings();
	}

	initSettings(){
		let self = this;
		let rightTabPanel = this.getRightTabPanel();
		if( !rightTabPanel) {
			rightTabPanel = new Tab({
				name: 'rightTabPanel'
			});
			this.getRightSidebar().add(rightTabPanel);
		}
		this.rightSidebar.add(rightTabPanel);

		let setting = rightTabPanel.getChildByName('setting');
		if( !setting ){
			setting = new VueComponent({
				title: i18n.t('editor.ui.sidebar.setting'),
				name: 'setting',
				editor: this,
				component: Setting
			});
			this.getRightTabPanel().add(setting);
		}

		setting.on('dataChanged', (data) => {
			self.graph.setSettingData(data);
		});
	}

	initRunningMode(dataFlow) {
		log('Editor.initRunningMode');
		let self = this;

		// hide stencil
		this.getLeftSidebar().hide();

		// remove stage config
		let nodeSettingPanel = self.getRightTabPanel().getChildByName('nodeSettingPanel');
		if( nodeSettingPanel ) self.getRightTabPanel().remove(nodeSettingPanel);

		// remove setting
		let setting = self.getRightTabPanel().getChildByName('setting');
		if( setting ) self.getRightTabPanel().remove(setting);

		// remove right tab panel
		let rightTabPanel = self.getRightSidebar().getChildByName('rightTabPanel');
		if( rightTabPanel ) self.getRightSidebar().remove(rightTabPanel);

		// add monitor
		let monitor = self.getRightSidebar().getChildByName('monitor');
		if( !monitor ){
			monitor = new VueComponent({
				name: 'monitor',
				editor: this,
				propsData: {
					dataFlow: dataFlow,
				},
				component: EchartData
			});
			self.getRightSidebar().add(monitor);
		}
		self.getRightSidebar().show();

		self.showLogs(dataFlow);
	}

	initEditingMode(){
		log('editor.initEditingMode');
		this.getRightSidebar().removeAll();
		this.getRightSidebar().hide();

		this.initSettings();

		this.getLeftSidebar().show();

		this.getBottomSidebar().hide();
		this.getBottomTabPanel().removeAll();
	}

	//setting
	showSetting(name){
		this.getRightSidebar().removeAll();
		let self = this;
		self.initSettings();
		let rightTabPanel = self.getRightTabPanel();
		if( rightTabPanel ) {
			let setting = rightTabPanel.getChildByName('setting');
			if( setting ){
				let settingData = self.graph.getSettingData();
				if(name){
					settingData.name = name;
				}
				setting.setData(settingData);
			}
			rightTabPanel.select(setting);
			self.getRightSidebar().show();
		}
	}

	showLogs(dataFlow){
		let bottomTabPanel = this.getBottomTabPanel();
		let logsPanel = bottomTabPanel.getChildByName('logsPanel');

		if( !logsPanel ) {
			logsPanel = new VueComponent({
				title: i18n.t('editor.ui.sidebar.logs'),
				name: 'logsPanel',
				editor: this,
				propsData: {
					dataFlow: dataFlow,
				},
				component: DebugLogs
			});
			this.getBottomTabPanel().add(logsPanel);
		}

		if( this.getBottomSidebar().isShow() && logsPanel.selected ) {
			this.getBottomSidebar().hide();
		} else {
			this.getBottomTabPanel().select(logsPanel);
			this.getBottomSidebar().show();
		}
	}

	showCapture(dataFlow) {
		// add capture
		let capture = this.getBottomTabPanel().getChildByName('capture');
		if( !capture ){
			capture = new VueComponent({
				container: '',
				title: i18n.t('editor.ui.sidebar.capture'),
				name: 'capture',
				editor: this,
				propsData: {
					dataFlow: dataFlow,
				},
				component: Capture
			});
			this.getBottomTabPanel().add(capture);
		}
		// if( this.getBottomSidebar().isShow() && capture.selected ) {
		// 	this.getBottomSidebar().hide();
		// } else {
			this.getBottomTabPanel().select(capture);
			this.getBottomSidebar().show();
		// }
	}
	showDataVerify(){
		// add capture
		this.getRightSidebar().removeAll();
		let dataVerify = this.getBottomTabPanel().getChildByName('dataVerify');
		if( !dataVerify ){
			dataVerify = new VueComponent({
				container: '',
				title: i18n.t('editor.ui.sidebar.capture'),
				name: 'dataVerify',
				editor: this,
				propsData: {
					dataFlow: '',
				},
				component: DataVerify
			});
			this.getRightSidebar().add(dataVerify);
		}
		this.getRightSidebar().show();
		this.getBottomSidebar().hide();
	}
	showLoading(){
		// add capture
		this.getRightSidebar().removeAll();
		let dvLoading = this.getBottomTabPanel().getChildByName('dvLoading');
		if( !dvLoading ){
			dvLoading = new VueComponent({
				container: '',
				title: i18n.t('editor.ui.sidebar.capture'),
				name: 'dvLoading',
				editor: this,
				propsData: {
					dataFlow: '',
				},
				component: DVLoading
			});
			this.getRightSidebar().add(dvLoading);
		}
		this.getRightSidebar().show();
		this.getBottomSidebar().hide();
	}
	showResult(){
		// add capture
		this.getRightSidebar().removeAll();
		let dvResult = this.getBottomTabPanel().getChildByName('dvResult');
		if( !dvResult ){
			dvResult = new VueComponent({
				container: '',
				title: i18n.t('editor.ui.sidebar.capture'),
				name: 'dvResult',
				editor: this,
				propsData: {
					dataFlow: '',
				},
				component: DVResult
			});
			this.getRightSidebar().add(dvResult);
		}
		this.getRightSidebar().show();
		this.getBottomSidebar().hide();
	}
	setData(dataFlow){
		this.graph.loadData(JSON.parse(dataFlow.editorData));
		this.ui.setName(dataFlow.name);
	}

	getData(){

		let graphLib = this.graph.getGraphLib();
		let distance = this.distanceForSink(graphLib);

		return {
			name: this.ui.getName(),
			graphData: this.graph.getData(),
			graphLib: graphLib,
			distanceForSink: distance,
			settingData: this.graph.getSettingData() || DEFAULT_SETTING,
			graph: this.graph.graph,
		};

	}

	distanceForSink(graphLib){
		let distanceResult = {};

		let predecessors = function(node, distance){

			if( distanceResult.hasOwnProperty(node) )
				distanceResult[node] = distanceResult[node] >= distance ? distanceResult[node] : distance;
			else
				distanceResult[node] = distance;

			graphLib.predecessors(node).forEach((node) => predecessors(node, distance + 1));
		};
		graphLib.sinks().forEach( (node) => predecessors(node, 0) );

		log('Editor.distanceForSink', distanceResult);

		return distanceResult;
	}

	setEditable(editable, dataFlow) {
		log('Editor.setEditable', editable, dataFlow);
		this.editable = editable;
		this.graph.setEditable(editable);
		if( editable ){
			this.initEditingMode();
		} else {
			this.initRunningMode(dataFlow);
		}
	}

	validate(){
		let verified = this.graph.validate();
		if( verified !== true ) return verified;
		return this.validateGraphData();
	}

	/**
	 * Validate graph to meet business logic
	 * @return {boolean | string}
	 */
	validateGraphData() {

		log('Job.validateGraphData');
		let editorData = this.getData();
		let graph = editorData.graph;
		/*let graphData = editorData.graphData;
		let graphLib = graphData.graphLib;*/

		// at least 2 data node
		// at least 1 link
		let dataNodeCount = 0,
			linkCount = 0;
		graph.getCells().forEach(cell => {
			if( cell.isLink() ){
				linkCount++;
			} else if( cell.isElement() && typeof cell.isDataNode === 'function' && cell.isDataNode()) {
				dataNodeCount++;
			}
		});
		if( dataNodeCount < 2 ) return i18n.t('editor.cell.validate.none_data_node');

		if( linkCount < 1) return i18n.t('editor.cell.validate.none_link_node');

		let sources = graph.getSources() || [];
		let processorSources = sources.filter(
			cell => cell.isElement() && typeof cell.isProcess === 'function' && cell.isProcess());
		if( processorSources.length > 0 ){
			this.graph.selectCell(processorSources);
			return i18n.t('editor.cell.validate.start_with_data_node');
		}

		// validate graph acyclic
		let acyclic = this.graph.isAcyclic();
		if( !acyclic ) {
			return i18n.t('editor.cell.validate.acyclic');
		}

		return true;
	}

	destroy(){
		this.emit(EditorEventType.BEFORE_DESTROY, this);
		this.ui.destroy();
	}

	getUI(){
		return this.ui;
	}
	getLeftSidebar(){
		return this.leftSidebar;
	}
	getRightSidebar(){
		return this.rightSidebar;
	}
	getRightTabPanel(){
		let rightSidebar = this.getRightSidebar();
		if( rightSidebar ){
			return rightSidebar.getChildByName('rightTabPanel');
		}
		return null;
	}
	getBottomSidebar(){
		return this.bottomSidebar;
	}
	getBottomTabPanel(){
		return this.bottomTabPanel;
	}
	getLeftSidebarEl(){
		return this.leftSidebar.getContentEl();
	}
	getRightSidebarEl(){
		return this.rightSidebar.getContentEl();
	}
}
