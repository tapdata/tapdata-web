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
import Capture from '../view/job/preview';
import log from "../log";

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
			width: 180
		});
		ui.add(leftSidebar);

		self.rightSidebar = new Sidebar({
			container: self.ui.el.find('.e-body'),
			region: 'right',
			editor: this,
			hidden: true,
      maxWidth: 1000,
      minWidth: 500,
			width: 520
		});
		ui.add(self.rightSidebar);

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
	}

	initRunningMode(dataFlow) {
		log('Editor.initRunningMode');
		let self = this;

		// hide stencil
		this.getLeftSidebar().hide();

		// remove stage config
		let settings = self.getRightSidebar().getChildByName('settings');
		if( settings ) self.getRightSidebar().remove(settings);

		// add monitor
		let monitor = self.getRightSidebar().getChildByName('monitor');
		if( !monitor ){
			monitor = new VueComponent({
				name: 'monitor',
				editor: this,
				dataFlow: dataFlow,
				component: EchartData
			});
			self.getRightSidebar().add(monitor);
		}
		self.getRightSidebar().show();

		// add capture
		let capture = self.getBottomTabPanel().getChildByName('capture');
		if( !capture ){
			capture = new VueComponent({
				title: 'Capture',
				name: 'capture',
				editor: this,
				dataFlow: dataFlow,
				component: Capture
			});
			self.getBottomTabPanel().add(capture);
		}
		self.getBottomTabPanel().select(capture);
		self.getBottomSidebar().show();
	}

	initEditingMode(){
		log('editor.initEditingMode');
		this.getLeftSidebar().show();
		this.getBottomSidebar().hide();
		this.getRightSidebar().hide();

		// this.rightSidebar.removeAll();
		let monitor = this.getRightSidebar().getChildByName('monitor');
		this.getRightSidebar().remove(monitor);

		// remove capture
		let capture = this.getBottomTabPanel().getChildByName('capture');
		this.getBottomTabPanel().remove(capture);
	}

	getData(){

		return {
			name: this.ui.getName(),
			graphData: this.graph.getData(),
			graphLib: this.graph.getGraphLib()
		};

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

	getUI(){
		return this.ui;
	}
	getLeftSidebar(){
		return this.leftSidebar;
	}
	getRightSidebar(){
		return this.rightSidebar;
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
