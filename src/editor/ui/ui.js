/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from '../lib/Component';
import i18n from '../../i18n/i18n';
import $ from 'jquery';

export default class UI extends Component {
	constructor(opts) {
		super();

		this.editor = opts.editor;
		this.opts = opts;
		this.init();
	}

	doInit() {
		let editTitle = i18n.t('message.modifyName');
		// let saveTitle = i18n.t('dataFlow.button.save');
		let taskName = '';
		let changeName = i18n.t('dataFlow.changeName');
		let backList = i18n.t('dataFlow.backlistText');
		// <i class='iconfont icon-baocun el-icon' id="submit" title="${saveTitle}" style="display: none;color:##48B6E2;cursor: pointer" ></i>
		this.el = $(`<div class="editor">
			<div class="e-header">
				<i title="${backList}" class="iconfont icon-sanheng" id="backIcon" style="width: 41px;height: 41px;line-height: 41px;font-size: 24px;text-align: center;color:#fff;cursor: pointer;background-color: #48b6e2"></i>
				<div class="e-title" style="margin-left: 10px">
					<input value="${taskName}" class="ui-input" id="taskNameInput" type="text"  maxlength="150"/>
					<div id="edit" title="${editTitle}"
						style="cursor: pointer;font-size:12px;color:#48b6e2;position: absolute;top: 50%;right: 0;transform: translate(0, -50%);">
							${changeName}
					</div>
				</div>

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

		if (this.opts.actionBarEl) {
			this.getActionBarEl().append(this.opts.actionBarEl);
		}
		this.el.find('input.ui-input').on('click', function() {
			$('#taskNameInput').focus();
			$('#edit').css('display', 'none');
			$('#submit').css('display', 'inline-block');
			// var input = document.getElementById('taskNameInput');
			// input.setSelectionRange(0, -1);
		});
		this.el.find('#edit').on('click', function() {
			$('#taskNameInput').focus();
			// $('#edit').css('display', 'none');
			// $('#submit').css('display', 'inline-block');
			var input = document.getElementById('taskNameInput');
			input.setSelectionRange(0, -1);
		});

		this.el.find('input.ui-input').on('keyup', function(event) {
			if (event.keyCode === '13') {
				$('#taskNameInput').blur();
				$('#submit').css('display', 'none');
				$('#edit').css('display', 'inline-block');
			}
		});

		// this.el.find('#backIcon').on('click', function() {
		// 	location.href = './#/dataFlows?mapping=custom';
		// });

		this.el.find('input.ui-input').on('blur', function() {
			$('#submit').css('display', 'none');
			$('#edit').css('display', 'inline-block');
			var input = document.getElementById('taskNameInput');
			input.setSelectionRange(0, 0);
		});

		// this.el.find('#backIcon').on('click', function() {

		// });
	}

	setDisableName(disable) {
		if (disable) {
			this.el.find('.e-title #taskNameInput').attr('disabled', true);
			this.el.find('#edit').hide();
		} else {
			this.el.find('.e-title #taskNameInput').attr('disabled', false);
			this.el.find('#edit').show();
		}
	}

	getName() {
		return this.el.find('.e-title #taskNameInput').val();
	}
	setName(name) {
		return this.el.find('.e-title #taskNameInput').val(name);
	}

	// getBackButtonEl(){
	// 	return this.el.find('.e-header .e-action-back');
	// }
	getContentEl() {
		return this.el.find('.e-content');
	}
	getNavigatorEl() {
		return this.el.find('.navigator-container');
	}
	getToolbarEl() {
		return this.el.find('.e-toolbar-container');
	}
	getGraphToolbarEl() {
		return this.el.find('.e-toolbar-container .graph-toolbar');
	}
	getActionBarEl() {
		return this.el.find('.action-toolbar');
	}
	getGraphContainer() {
		return this.el.find('.graph-container');
	}
}
