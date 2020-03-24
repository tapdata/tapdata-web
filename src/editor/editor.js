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
import Monitor from "./ui/monitor";

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
	 * @type {Monitor}
	 */
	monitor = null;

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

	initRunningView(dataFlow) {
		let self = this;
		let monitor = self.monitor = new Monitor({editor: this, dataFlow: dataFlow});
		self.rightSidebar.add(monitor);
		self.rightSidebar.show();
		self.bottomTabPanel.removeAll();
	}

	destroyRunningView(){
		this.rightSidebar.hide();
		this.rightSidebar.removeAll();
		this.monitor = null;
	}

	getData(){

		return {
			name: this.ui.getName(),
			graphData: this.graph.getData(),
			graphLib: this.graph.getGraphLib()
		};

	}

	setEditable(editable, dataFlow) {
		this.editable = editable;
		this.graph.setEditable(editable);
		if( editable ){
			this.leftSidebar.show();
			this.destroyRunningView();
		} else {
			this.leftSidebar.hide();
			this.bottomSidebar.hide();
			this.bottomTabPanel.removeAll();
			this.initRunningView(dataFlow);
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
