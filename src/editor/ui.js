/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "./lib/Component";
import $ from 'jquery';
import Sidebar from "./sidebar";

export default class UI extends Component {

	constructor(editor) {
		super();

		this.editor = editor;

		this.init();
	}

	doInit() {
		this.el = $(`<div class="editor">
			<div class="e-header"></div>
			<div class="e-body">
				<div class="e-content"></div>
			</div>
			<div class="e-footer"></div>
		</div>`);

		this.leftSidebar = new Sidebar({
			region: 'left',
			parent: this,
			editor: this.editor
		});

		this.rightSidebar = new Sidebar({
			region: 'right',
			parent: this,
			editor: this.editor
		});

		this.leftSidebar.render(this.el.find('.e-body'), true);
		this.rightSidebar.render(this.el.find('.e-body'));
	}
	getContentEl(){
		return this.el.find('.e-content');
	}
}
