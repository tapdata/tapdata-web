/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "../lib/Component";
import $ from 'jquery';
import Sidebar from "./sidebar";
import Tab from "./tab";

export default class UI extends Component {

	constructor(opts) {
		super();

		this.editor = opts.editor;
		this.opts = opts;

		this.init();
	}

	doInit() {
		this.el = $(`<div class="editor">
			<div class="e-header">
				<div class="e-title">
					<h3 contenteditable="true">任务</h3>
				</div>
				<div class="e-toolbar-container">
					<div class="graph-toolbar"></div>
					<div class="action-toolbar"></div>
				</div>
			</div>
			<div class="e-body">
				<div class="e-content"><div class="navigator-container"></div></div>
			</div>
			<div class="e-footer"></div>
		</div>`);

		this.leftSidebar = new Sidebar({
			region: 'left',
			editor: this.editor,
			split: false
		});

		this.rightSidebar = new Sidebar({
			region: 'right',
			editor: this.editor,
			hidden: true,
			maxWidth: 1000,
			width: 520
		});

		this.leftSidebar.render(this.el.find('.e-body'), true);
		this.rightSidebar.render(this.el.find('.e-body'));

		let rightTabPanel = this.rightTabPanel = new Tab();
		this.rightSidebar.add(rightTabPanel);

		if( this.opts.actionBarEl ){
			this.getActionBarEl().append(this.opts.actionBarEl);
		}
	}
	getName(){
		return this.el.find('.e-title h3').text();
	}
	getContentEl(){
		return this.el.find('.e-content');
	}
	getLeftSidebarEl(){
		return this.leftSidebar.getContentEl();
	}
	getRightSidebarEl(){
		return this.rightSidebar.getContentEl();
	}
	getNavigatorEl(){
		return this.el.find('.navigator-container');
	}
	getToolbarEl(){
		return this.el.find('.e-toolbar-container');
	}
	getGraphToolbarEl(){
		return this.el.find('.e-toolbar-container .graph-toolbar');
	}
	getActionBarEl(){
		return this.el.find('.action-toolbar');
	}
}
