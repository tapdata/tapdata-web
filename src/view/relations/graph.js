import joint from '../../editor/lib/rappid/rappid';
import paperSetting from './paperSetting';
// import i18n from '../../i18n/i18n';
// import { Message } from 'element-ui';

window.joint = joint;

export default function() {
	paperSetting();

	var toolbarHeight = 50;

	var graph = new joint.dia.Graph();

	var paper = new joint.dia.Paper({
		el: document.getElementById('paper'),
		model: graph,
		width: '100%',
		height: 'calc(100% - ' + toolbarHeight + 'px)',
		gridSize: 10,
		background: { color: '#f6f6f6' },
		magnetThreshold: 'onleave',
		moveThreshold: 5,
		clickThreshold: 5,
		linkPinning: false,
		sorting: joint.dia.Paper.sorting.APPROX,
		interactive: {
			linkMove: false,
			elementMove: false
		},
		markAvailable: true,
		snapLinks: { radius: 40 },
		defaultRouter: {
			name: 'mapping',
			args: { padding: 30 }
		},
		defaultConnectionPoint: { name: 'anchor' },
		defaultAnchor: { name: 'mapping' },
		defaultConnector: {
			name: 'jumpover',
			args: { jump: 'cubic' }
		},
		highlighting: {
			magnetAvailability: {
				name: 'addClass',
				options: {
					className: 'record-item-available'
				}
			},
			connecting: {
				name: 'stroke',
				options: {
					padding: 8,
					attrs: {
						stroke: 'none',
						fill: '#7c68fc',
						'fill-opacity': 0.2
					}
				}
			}
		},
		defaultLink: function() {
			return new joint.shapes.mapping.Link();
		},
		validateConnection: function(sv, sm, tv, tm, end) {
			if (sv === tv) return false;
			if (sv.model.isLink() || tv.model.isLink()) return false;
			if (end === 'target') return tv.model.getItemSide(tv.findAttribute('item-id', tm)) !== 'right';
			return sv.model.getItemSide(sv.findAttribute('item-id', sm)) !== 'left';
		}
	});

	// User Interactions

	paper.on('element:magnet:pointerdblclick', function(elementView, evt, magnet) {
		evt.stopPropagation();
		itemEditAction(elementView.model, elementView.findAttribute('item-id', magnet));
	});

	paper.on('element:contextmenu', function(elementView, evt) {
		var tools = elementView.model.getTools();
		if (tools) {
			evt.stopPropagation();
			elementActionPicker(elementView.el, elementView, tools);
		}
	});

	paper.on('element:magnet:contextmenu', function(elementView, evt, magnet) {
		var itemId = elementView.findAttribute('item-id', magnet);
		var tools = elementView.model.getItemTools(itemId);
		if (tools) {
			evt.stopPropagation();
			itemActionPicker(magnet, elementView, elementView.findAttribute('item-id', magnet), tools);
		}
	});

	paper.on('element:pointerclick', function(elementView) {
		showElementTools(elementView);
	});

	paper.on('element:pointermove', function(view, evt, x, y) {
		var data = evt.data;
		var ghost = data.ghost;
		if (!ghost) {
			var position = view.model.position();
			ghost = view.vel.clone();
			ghost.attr('opacity', 0.3);
			ghost.appendTo(this.viewport);
			evt.data.ghost = ghost;
			evt.data.dx = x - position.x;
			evt.data.dy = y - position.y;
		}
		ghost.attr('transform', 'translate(' + [x - data.dx, y - data.dy] + ')');
	});

	paper.on('element:pointerup', function(view, evt, x, y) {
		var data = evt.data;
		if (data.ghost) {
			data.ghost.remove();
			view.model.position(x - data.dx, y - data.dy);
		}
	});

	// Actions

	function showElementTools(elementView) {
		var element = elementView.model;
		var transform = new joint.ui.FreeTransform({
			cellView: elementView,
			allowRotation: false
		});
		transform.render();
		transform.listenTo(element, 'change', updateMinSize);
		updateMinSize();

		function updateMinSize() {
			var minSize = element.getMinimalSize();
			transform.options.minHeight = minSize.height;
			transform.options.minWidth = minSize.width;
		}
	}

	function itemActionPicker(target, elementView, itemId, tools) {
		var element = elementView.model;
		var toolbar = new joint.ui.ContextToolbar({
			target: target,
			padding: 5,
			vertical: true,
			tools: tools
		});

		toolbar.render();
		toolbar.on({
			'action:remove': function() {
				element.startBatch('item-remove');
				element.removeItem(itemId);
				element.removeInvalidLinks();
				element.stopBatch('item-remove');
				toolbar.remove();
			},
			'action:edit': function() {
				toolbar.remove();
				itemEditAction(element, itemId);
			},
			'action:add-child': function() {
				toolbar.remove();
				element.addItemAtIndex(itemId, Infinity, element.getDefaultItem());
				if (element.isItemCollapsed(itemId)) element.toggleItemCollapse(itemId);
			},
			'action:add-next-sibling': function() {
				toolbar.remove();
				element.addNextSibling(itemId, element.getDefaultItem());
			},
			'action:add-prev-sibling': function() {
				toolbar.remove();
				element.addPrevSibling(itemId, element.getDefaultItem());
			}
		});
	}

	function elementActionPicker(target, elementView, tools) {
		var element = elementView.model;
		var toolbar = new joint.ui.ContextToolbar({
			target: target,
			padding: 5,
			vertical: true,
			tools: tools
		});

		toolbar.render();
		toolbar.on({
			'action:add-item': function() {
				toolbar.remove();
				element.addItemAtIndex(0, Infinity, element.getDefaultItem());
			}
		});
	}

	function itemEditAction(element, itemId) {
		var config = element.getInspectorConfig(itemId);
		if (!config) return;

		var inspector = new joint.ui.Inspector({
			cell: element,
			live: false,
			inputs: joint.util.setByPath({}, element.getItemPathArray(itemId), config)
		});

		inspector.render();
		inspector.el.style.position = 'relative';
		inspector.el.style.overflow = 'hidden';

		var dialog = new joint.ui.Dialog({
			width: 300,
			title: 'Edit Item',
			closeButton: false,
			content: inspector.el,
			buttons: [
				{
					content: 'Cancel',
					action: 'cancel'
				},
				{
					content: '<span style="color:#fe854f">Change</span>',
					action: 'change'
				}
			]
		});

		dialog.open();
		dialog.on({
			'action:cancel': function() {
				inspector.remove();
				dialog.close();
			},
			'action:change': function() {
				inspector.updateCell();
				inspector.remove();
				dialog.close();
			}
		});

		var input = inspector.el.querySelector('[contenteditable]');
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(input);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	(function(joint, graph) {
		var rdatas = [
			{
				id: 'adm_greenbuild_project_date_used_water_count_1',
				label: 'adm_greenbuild_project_date_used_water_count_1',
				items: [
					{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
					{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
					{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
					{ id: 'branch_name', label: 'branch_name', type: 'String' },
					{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
					{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
					{ id: 'used_water_count', label: 'used_water_count', type: 'Double' }
				],
				connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
			},
			{
				id: 'mdm_project_info',
				label: 'mdm_project_info',
				items: [
					{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
					{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
					{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' }
				],
				connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
			},
			{
				id: 'adm_ls_engineer_use_water_temp',
				label: '用水汇总临时表',
				items: [
					{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
					{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
					{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
					{ id: 'branch_name', label: 'branch_name', type: 'String' },
					{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
					{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
					{ id: 'used_water_count', label: 'used_water_count', type: 'Double' },
					{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' }
				],
				connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
			},
			{
				id: 'adm_greenbuild_branch_date_used_water_count',
				label: '用水汇总表',
				items: [
					{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
					{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
					{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
					{ id: 'branch_name', label: 'branch_name', type: 'String' },
					{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
					{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
					{ id: 'used_water_count', label: 'used_water_count', type: 'Double' },
					{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' },
					{ id: 'avg_water_count', label: 'avg_water_count', type: 'Double' }
				],
				connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
			}
		];

		var linkdatas = (links = [
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_abb' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_id' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_name' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_name' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'engineer_id' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'engineer_id' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'water_record_date' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'water_record_date' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'used_water_count' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'used_water_count' },
				dataFlows: [
					{
						id: '60127fe2ace10a61d0570ae9',
						name: '05_ADM_用水用电情况合并_二公司',
						aggregate: { type: 'SUM', field: 'pro_bulid_area', group: 'branch_id' }
					}
				]
			},
			{
				source: { id: 'mdm_project_info', port: 'branch_id' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'mdm_project_info', port: 'pro_bulid_area' },
				target: { id: 'adm_ls_engineer_use_water_temp', port: 'pro_bulid_area' },
				dataFlows: [
					{
						id: '60127fe2ace10a61d0570ae9',
						name: '05_ADM_用水用电情况合并_二公司',
						aggregate: { type: 'SUM', field: 'pro_bulid_area', group: 'branch_id' }
					}
				]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'adm_ls_engineer_use_water_temp' },
				target: {
					id: 'adm_greenbuild_branch_date_used_water_count',
					port: 'adm_greenbuild_branch_date_used_water_count'
				},
				dataFlows: [
					{
						id: '60127fe2ace10a61d0570ae9',
						name: '05_ADM_用水用电情况合并_二公司',
						javascript:
							'function process(record){\n' +
							'\n' +
							'\tif(record.pro_bulid_area && record.pro_bulid_area>0){\n' +
							'\t\trecord.avg_water_count = record.used_water_count/record.pro_bulid_area\n' +
							'\t}else{\n' +
							'\t\trecord.avg_water_count = 0\n' +
							'\t}\n' +
							'\treturn record;\n' +
							'}'
					}
				]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_abb' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_id' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_name' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_name' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'engineer_id' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'engineer_id' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'water_record_date' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'water_record_date' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'used_water_count' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'used_water_count' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'pro_bulid_area' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'pro_bulid_area' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			},
			{
				source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
				target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_abb' },
				dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
			}
		]);

		rdatas.forEach((table, idx) => {
			var node = new joint.shapes.mapping.Record({ items: [[table]] });
			linkdatas.map((link, idx, linkdatas) => {
				if (link.source.id == table.id) linkdatas[idx].source.id = node.id;
				if (link.target.id == table.id) linkdatas[idx].target.id = node.id;
			});
			node.setName(table.connection.name);
			node.position(idx * 350 + 50, 130);
			node.addTo(graph);
		});

		var links = linkdatas.map(link => {
			return new joint.shapes.mapping.Link({
				source: { id: link.source.id, port: link.source.port },
				target: { id: link.target.id, port: link.target.port },
				labels: [
					{
						attrs: { text: { text: link.dataFlows[0].name } }
					}
				]
			});
		});

		links.forEach(function(link) {
			link.addTo(graph);
		});
	})(joint, graph);
}
