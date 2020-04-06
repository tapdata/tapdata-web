/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "../lib/Component";
import $ from 'jquery';

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
				<div class="e-action-bar"><a class="e-action-back iconfont icon-xiangzuo"></a></div>
				<div class="e-title">
					<h3 contenteditable="true">任务</h3>
				</div>
				<i class='el-icon-edit el-icon'></i>
				<div class="e-toolbar-container">
					<div class="graph-toolbar"></div>
					<div class="action-toolbar"></div>
				</div>
			</div>
			<div class="e-body">
				<div class="e-content">
					<div class="graph-container"><div class="navigator-container"></div></div>
				</div>
			</div>
			<div class="e-footer"></div>
		</div>`);

		if( this.opts.actionBarEl ){
			this.getActionBarEl().append(this.opts.actionBarEl);
		}
	}
	getName(){
		return this.el.find('.e-title h3').text();
	}
	setName(name){
		return this.el.find('.e-title h3').text(name);
	}
	getBackButtonEl(){
		return this.el.find('.e-header .e-action-back');
	}
	getContentEl(){
		return this.el.find('.e-content');
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
	getGraphContainer() {
		return this.el.find('.graph-container');
	}
}
