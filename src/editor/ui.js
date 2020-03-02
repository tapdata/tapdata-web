/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "./lib/Component";
import $ from 'jquery';
import Sidebar from "./sidebar";
import Tab from "./tab";

export default class UI extends Component {

	constructor(editor) {
		super();

		this.editor = editor;

		this.init();
	}

	doInit() {
		this.el = $(`<div class="editor">
			<div class="e-header"><div class="toolbar-container"></div></div>
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
			maxWidth: 600
		});

		this.leftSidebar.render(this.el.find('.e-body'), true);
		this.rightSidebar.render(this.el.find('.e-body'));

		let rightTabPanel = this.rightTabPanel = new Tab();
		this.rightSidebar.add(rightTabPanel);
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
		return this.el.find('.toolbar-container');
	}
}
