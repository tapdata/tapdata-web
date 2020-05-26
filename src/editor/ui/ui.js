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
				<div class="e-action-bar"><a class="e-action-back iconfont icon-biaotongbu"></a></div>
				<div class="e-title">
					<input value="新任务未命名" class="ui-input" id="taskNameInput" type="text"  maxlength="50"/>
				</div>
				<i class='el-icon-edit el-icon' id="edit"></i>
				<i class='iconfont icon-baocun el-icon' id="submit" style="display: none;color:##48B6E2" ></i>
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
		this.el.find('input.ui-input').on('click', function(){
      $('#taskNameInput').focus();
      $('#edit').css('display','none');
      $('#submit').css('display','inline-block');
      var input = document.getElementById("taskNameInput");
      input.setSelectionRange(0, -1);
    });
    this.el.find('i.el-icon-edit').on('click',function(){
      $('#taskNameInput').focus();
      $('#edit').css('display','none');
      $('#submit').css('display','inline-block');
      var input = document.getElementById("taskNameInput");
      input.setSelectionRange(0, -1);
    });

    this.el.find('input.ui-input').on('keyup', function(event){
      if (event.keyCode == "13") {
        $('#taskNameInput').blur();
        $('#submit').css('display','none');
        $('#edit').css('display','inline-block');
      }
    });

    this.el.find('input.ui-input').on('blur', function(){
      $('#submit').css('display','none');
      $('#edit').css('display','inline-block');
      var input = document.getElementById("taskNameInput");
      input.setSelectionRange(0, 0);
    });
	}
	getName(){
		return this.el.find('.e-title #taskNameInput').val();
	}
	setName(name){
		return this.el.find('.e-title #taskNameInput').val(name);
	}

	// getBackButtonEl(){
	// 	return this.el.find('.e-header .e-action-back');
	// }
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
