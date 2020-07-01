/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/18/20
 * @description
 */
import joint from '../../lib/rappid/rappid';
import Component from '../../lib/Component';
import $ from 'jquery';
import shapes from '../models/shapes';
import anchors from '../models/anchors';
import routers from '../models/routers';
import linkTools from '../models/linkTools';
import _ from 'lodash';
import i18n from '../../../i18n/i18n';

import log from '../../../log';
import { convertSchemaToTreeData } from '../../util/Schema';

window.joint = window.joint || joint;

export default class Graph extends Component {
	constructor(props) {
		super(props);

		this.dataMap = props.dataMap;
		this.container = props.container;

		this.sourceLane = null;
		this.tapdataLane = null;
		this.apiLane = null;

		this.spacing = 10;

		this.init();
	}

	doInit() {
		super.doInit();

		shapes(joint);
		anchors(joint);
		routers(joint);
		linkTools(joint);

		this.initGraph();

		// this.initLane();

		this.paper.freeze();
		this.paperScroller.centerContent();
	}

	initGraph() {
		let self = this;
		const graph = (self.graph = new joint.dia.Graph());

		self.paper = new joint.dia.Paper({
			model: graph,
			width: 800,
			height: 800,
			/*gridSize: 30,
			drawGrid: {
				name: 'doubleMesh',
				args: [
					{ color: '#dddddd', thickness: 1 }, // settings for the primary mesh
					{ color: 'black', scaleFactor: 5, thickness: 1 } //settings for the secondary mesh
				]
			},*/
			defaultConnectionPoint: { name: 'boundary', args: { extrapolate: true } },
			// defaultConnectionPoint: joint.shapes.dataMap.Link.connectionPoint,
			defaultConnector: { name: 'rounded' },
			defaultRouter: { name: 'manhattan' },
			restrictTranslate: function(elementView) {
				let parentId = elementView.model.get('parent');
				let parentCell = parentId && this.model.getCell(parentId);
				//let parentCellType = parentCell && parentCell.get('type');
				let parentBBox = parentCell && parentCell.getBBox();
				//if(parentCellType === 'dataMap.Lane'){
				parentBBox = parentBBox || {};
				parentBBox.y += 50;
				parentBBox.height -= 50;
				//}
				return parentCell && parentBBox;
			},
			/*embeddingMode: false,*/
			// frontParentOnly: false,
			defaultAnchor: { name: 'center' },
			linkPinning: false,
			/*frozen: true*/
			//sorting: joint.dia.Paper.sorting.APPROX

			validateConnection: function(sv, sm, tv, tm, end) {
				if (sv === tv) return false;
				if (sv.model.isLink() || tv.model.isLink()) return false;
				if (end === 'target') return tv.model.getItemSide(tv.findAttribute('item-id', tm)) !== 'right';
				return sv.model.getItemSide(sv.findAttribute('item-id', sm)) !== 'left';
			},
			highlighting: {
				default: {
					name: 'addClass',
					options: {
						className: 'active'
					}
				}
			}
		});

		self.paperScroller = self.paperScroller = new joint.ui.PaperScroller({
			el: self.container,
			paper: self.paper,
			autoResizePaper: true,
			cursor: 'grab',
			contentOptions: function() {
				// let visibleArea = paperScroller.getVisibleArea();
				let bbox = self.getContentBBox();
				return {
					maxWidth: bbox.width,
					maxHeight: bbox.height,
					padding: {
						bottom: 20,
						top: 20,
						left: 20,
						right: 20
					},
					allowNewOrigin: 'any'
				};
			}
		});
		self.paper.on('blank:pointerdown', self.paperScroller.startPanning);
		self.paper.on('cell:pointerdown', (cellView, evt, x, y) => {
			self.paperScroller.startPanning(evt, x, y);
		});

		self.paper.on(
			{
				'element:mouseover': self.showProperties,
				'blank:mouseover': self.hideProperties,

				'element:pointerdblclick': self.handlerCellDbClick,
				'blank:pointerdblclick': self.handlerBlankDbClick
			},
			this
		);

		self.paper.on('link:mouseenter', function(cellView) {
			let cells = [];
			self.getCellInbounds(self.graph, cellView.model, cells);
			self.getCellOutbounds(self.graph, cellView.model, cells);

			cells.forEach(function(cell) {
				cell.findView(self.paper).highlight();
			}, self);
		});

		self.paper.on('link:mouseleave link:pointerdown', function(cellView) {
			let cells = [];
			self.getCellInbounds(self.graph, cellView.model, cells);
			self.getCellOutbounds(self.graph, cellView.model, cells);

			cells.forEach(function(cell) {
				cell.findView(self.paper).unhighlight();
			}, self);
		});

		this.paperScroller.center();
	}

	getCellInbounds(graph, cell, result) {
		result.push(cell);
		if (cell.isLink()) {
			this.getCellInbounds(graph, cell.getSourceCell(), result);
		} else if (cell.isElement()) {
			graph.getConnectedLinks(cell, { inbound: true }).forEach(link => this.getCellInbounds(graph, link, result));
		}

		/*let self = this;
		let inCell = graph.getNeighbors(cell, { inbound: true }) || [];
		inCell.forEach( out => {
			inCell.concat(self.getCellInbounds(graph, out));
		});
		return [cell].concat(graph.getConnectedLinks(cell, { inbound: true }));*/
	}

	getCellOutbounds(graph, cell, result) {
		result.push(cell);
		if (cell.isLink()) {
			this.getCellOutbounds(graph, cell.getTargetCell(), result);
		} else if (cell.isElement()) {
			graph
				.getConnectedLinks(cell, { outbound: true })
				.forEach(link => this.getCellOutbounds(graph, link, result));
		}
		/*let self = this;
		let outCell = graph.getNeighbors(cell, { outbound: true }) || [];
		outCell.forEach( out => {
			outCell.concat(self.getCellOutbounds(graph, out));
		});
		return [cell].concat(graph.getConnectedLinks(cell, { outbound: true }));*/
	}

	/**
	 * @deprecated
	 */
	initLane() {
		this.createLanes();

		// this.loadExampleData();

		this.sourceLane.toBack();
		this.tapdataLane.toBack();
		this.apiLane.toBack();

		//this.paperScroller.zoomToFit([opt]);
		// this.paper.fitToContent();
		// this.updateLanes();
	}

	getContentBBox() {
		const parent = $(this.container);
		const width = parent.width();
		const height = parent.height();
		return {
			w: width,
			h: height
		};
	}

	/**
	 * @deprecated
	 */
	createLanes() {
		/*this.sourceLane = new joint.shapes.dataMap.Lane({
			size: {
				width: 200,
				height: 200
			},
			attrs: {
				headerText: {
					text: 'Source'
				},
				body: {
					fill: "#feb663",
					"fill-opacity": 0.2,
					stroke: "#feb663",
					"stroke-width": 3
				}
			}
		}, {
			id: 'sourceLane',
		});
		this.graph.addCell(this.sourceLane);

		this.tapdataLane = new joint.shapes.dataMap.Lane({
			size: {
				width: 200,
				height: 200
			},
			attrs: {
				headerText: {
					text: 'Tapdata'
				},
				body: {
					fill: "#feb663",
					"fill-opacity": 0.2,
					stroke: "#feb663",
					"stroke-width": 3
				}
			}
		}, {
			id: 'tapdataLane'
		});
		this.graph.addCell(this.tapdataLane);

		this.apiLane = new joint.shapes.dataMap.Lane({
			size: {
				width: 200,
				height: 200
			},
			attrs: {
				headerText: {
					text: 'API'
				}
			}
		}, {
			id: 'targetLane',
		});
		this.graph.addCell(this.apiLane);*/
		this.sourceLane = this.createLane(
			{
				attrs: {
					headerText: {
						text: i18n.t('dataMap.source')
					}
				}
			},
			{
				id: 'sourceLane'
			}
		);

		this.tapdataLane = this.createLane(
			{
				attrs: {
					headerText: {
						text: i18n.t('dataMap.tapdata')
					}
				}
			},
			{
				id: 'tapdataLane'
			}
		);

		this.apiLane = this.createLane(
			{
				attrs: {
					headerText: {
						text: i18n.t('dataMap.API')
					}
				}
			},
			{
				id: 'apiLane'
			}
		);

		this.sourceLane.on('change:size', (element, newSize) =>
			this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing)
		);
		this.tapdataLane.on('change:size', (element, newSize) =>
			this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing)
		);
		this.apiLane.on('change:size', (element, newSize) =>
			this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing)
		);

		this.updateLanes();
		// window.addEventListener("resize", this.updateLanes.bind(this));
	}

	getCellsBBox(cells, opt) {
		opt || (opt = {});
		return _.toArray(cells).reduce(function(memo, cell) {
			let rect = cell.getBBox(opt);
			if (!rect) return memo;
			let angle = cell.angle();
			if (angle) rect = rect.bbox(angle);
			if (memo) {
				return memo.union(rect);
			}
			return rect;
		}, null);
	}

	resizeLanes(lane, defaultWidth, defaultHeight) {
		let embedElements = lane.getEmbeddedCells();
		let width = defaultWidth;
		let height = defaultHeight;
		if (embedElements && embedElements.length > 0) {
			let embedBBox = this.getCellsBBox(embedElements);
			width = embedBBox.width > defaultWidth ? embedBBox.width : defaultWidth;
			height = embedBBox.height > defaultHeight ? embedBBox.height : defaultHeight;
		}
		lane.resize(width, height);
		this.setLaneHeaderStyle(lane, width, this.spacing);
	}

	/**
	 * @deprecated
	 */
	updateLanes() {
		let spacing = this.spacing;
		let bbox = this.getContentBBox();
		let width = (bbox.w - spacing * 4) / 3;
		let height = bbox.h - spacing * 2;

		this.resizeLanes(this.sourceLane, width, height);
		this.sourceLane.position(spacing, spacing, { deep: true });
		let sourceBBox = this.sourceLane.getBBox();
		let sourceWidth = sourceBBox.width;

		this.resizeLanes(this.tapdataLane, width, height);
		this.tapdataLane.position(spacing + sourceWidth + spacing, spacing, { deep: true });
		let tapdataBBox = this.tapdataLane.getBBox();
		let tapdataWidth = tapdataBBox.width;

		this.resizeLanes(this.apiLane, width, height);
		this.apiLane.position(spacing + sourceWidth + spacing + tapdataWidth + spacing, spacing, { deep: true });
		let apiBBox = this.apiLane.getBBox();
		let apiWidth = apiBBox.width;

		let maxHeight = [sourceBBox.height, tapdataBBox.height, apiBBox.height].sort((a, b) => b - a)[0];
		this.sourceLane.resize(sourceWidth, maxHeight);
		this.tapdataLane.resize(tapdataWidth, maxHeight);
		this.apiLane.resize(apiWidth, maxHeight);
	}

	fitEmbeds(opts) {
		this.updateElementHeader();

		joint.layout.DirectedGraph.layout(
			this.graph,
			Object.assign(
				{
					setLinkVertices: false,
					rankDir: 'LR',
					marginX: 100,
					marginY: 100,
					// resizeToFit: true,
					nodeSep: 20,
					edgeSep: 10,
					rankSep: 80,
					// ranker: 'tight-tree',
					// align: "UL",
					resizeClusters: true,
					clusterPadding: { top: 50, left: 35, right: 35, bottom: 20 }
					/*setPosition: function(el, position){
						el.transition('position/x', position.x, {
							delay: 100,
							duration: 500,
							timingFunction: function(t) { return t*t; },
							valueFunction: function(a, b) { return function(t) { return a + (b - a) * t }}
						});
						el.transition('position/y', position.y, {
							delay: 100,
							duration: 500,
							timingFunction: function(t) { return t*t; },
							valueFunction: function(a, b) { return function(t) { return a + (b - a) * t }}
						});
					}*/
				},
				opts || {}
			)
		);

		// this.updateLanes();

		/*let embedOpts = {
			deep: true,
			padding: {
				top: 50,
				left: 50,
				right: 50,
				bottom: 50
			}
		};
		this.sourceLane.fitEmbeds(_.cloneDeep(embedOpts));
		this.tapdataLane.fitEmbeds(_.cloneDeep(embedOpts));
		this.apiLane.fitEmbeds(_.cloneDeep(embedOpts));*/

		//this.paperScroller.zoomToFit();
		/*this.paper.scaleContentToFit({
			padding: 50
		});*/

		/*this.paper.scaleContentToFit({
			top: 240, bottom: 240, left: 240, right: 240
		});*/
		this.paperScroller.centerContent({ padding: { top: 200, bottom: 200, left: 200, right: 200 } });
	}

	updateElementHeader() {
		this.graph.getCells().forEach(cell => {
			if (!cell.isElement()) return;

			if (cell.get('type') === 'dataMap.Lane') return;

			let embedElements = cell.getEmbeddedCells();
			if (embedElements && embedElements.length > 0) {
				cell.attr({
					body: {
						'fill-opacity': 0.3
					},
					image: {
						visibility: 'hidden'
					},
					label: {
						textVerticalAnchor: 'middle',
						textAnchor: 'middle',
						refX: '15%',
						refY: 15,
						fill: '#333333'
					}
				});
			}
		});
	}

	/**
	 * @deprecated
	 * @param lane
	 * @param width
	 * @param spacing
	 */
	setLaneHeaderStyle(lane, width, spacing) {
		// log("DataMap.Graph.setLaneHeaderStyle", lane, width, spacing);
		lane.attr({
			header: {
				x: spacing,
				y: spacing,
				refWidth: `${((width - spacing * 2) / width) * 100}%`,
				width: width - spacing * 2
			},
			headerText: {
				refY: spacing + 15
				//text: `${(width - spacing * 2) / width * 100}%`
			}
		});
	}

	/**
	 * @deprecated
	 * @param attrs
	 * @param opts
	 */
	createLane(attrs, opts) {
		let lane = new joint.shapes.dataMap.Lane(
			_.merge(
				{
					size: {
						width: 200,
						height: 200
					},
					attrs: {
						headerText: {
							text: 'API'
						}
					}
				},
				attrs
			),
			opts
		);
		this.graph.addCell(lane);
		return lane;
	}

	createLink(source, target) {
		if (this.graph.getCell(source) && this.graph.getCell(target))
			return new joint.shapes.dataMap.Link({
				source: {
					id: source
				},
				target: {
					id: target
				}
			}).addTo(this.graph);
		return null;
	}

	createCell(cellConfig, cellData) {
		let CellConstructor = _.get(joint.shapes, cellConfig.type);
		let opts = cellConfig.attrs || {};
		if (cellData.id) opts.id = cellData.id;
		let cell = new CellConstructor(
			_.merge(
				{
					attrs: {
						label: {
							text: cellData.name
						}
					},
					properties: _.assignWith(
						cellData.properties || {},
						{ name: cellData.name },
						(oldValue, newValue) => {
							return oldValue || newValue || '';
						}
					)
				},
				opts
			)
		);

		if (cellData.connection) cell.set('connectionId', cellData.connection);

		cell.position(cellConfig.x || 20, cellConfig.y || 50).addTo(this.graph);
		return cell;
	}

	loadExampleData() {
		var order = new joint.shapes.mapping.Record({
			items: [
				[
					{
						id: 'file',
						label: 'File: (default)',
						icon: 'images/file.svg',
						highlighted: true,
						items: [
							{
								id: 'order',
								label: 'Order',
								icon: 'images/document.svg',
								items: [
									{
										id: 'order_id',
										label: 'id',
										icon: 'images/document.svg'
									},
									{
										id: 'order_name',
										label: 'name',
										icon: 'images/document.svg'
									},
									{
										id: 'order_email',
										label: 'email',
										icon: 'images/document.svg'
									},
									{
										id: 'order_entry_date',
										label: 'entry_date',
										icon: 'images/file.svg',
										items: [
											{
												id: 'entry_date_year',
												label: 'year',
												icon: 'images/document.svg'
											},
											{
												id: 'entry_date_month',
												label: 'month',
												icon: 'images/document.svg'
											},
											{
												id: 'entry_date_day',
												label: 'day',
												icon: 'images/document.svg'
											}
										]
									},
									{
										id: 'address',
										label: 'address',
										icon: 'images/file.svg',
										items: [
											{
												id: 'address_city',
												label: 'city',
												icon: 'images/document.svg'
											},
											{
												id: 'address_street',
												label: 'street',
												icon: 'images/document.svg'
											},
											{
												id: 'address_number',
												label: 'number',
												icon: 'images/document.svg'
											},
											{
												id: 'address_shipping',
												label: 'shipping',
												icon: 'images/document.svg'
											},
											{
												id: 'address_billing',
												label: 'billing',
												icon: 'images/document.svg'
											}
										]
									}
								]
							}
						]
					}
				]
			]
		});
		order.setName('Order');
		order.position(780, 200);
		order.addTo(this.graph);

		var nanonull = new joint.shapes.mapping.Record({
			items: [
				[
					{
						id: 'orders',
						label: 'orders',
						icon: 'images/file.svg',
						items: [
							{
								id: 'order_id',
								label: 'id',
								icon: 'images/document.svg'
							},
							{
								id: 'order_created_at',
								label: 'created_at',
								icon: 'images/document.svg'
							},
							{
								id: 'order_updated_at',
								label: 'updated_at',
								icon: 'images/document.svg'
							},
							{
								id: 'orderedproducts',
								label: 'orderedproducts',
								icon: 'images/file.svg',
								group: 'disabled'
							},
							{
								id: 'users',
								label: 'users',
								icon: 'images/file.svg',
								items: [
									{
										id: 'user_id',
										label: 'id',
										icon: 'images/document.svg'
									},
									{
										id: 'user_first_name',
										label: 'first_name',
										icon: 'images/document.svg'
									},
									{
										id: 'user_last_name',
										label: 'last_name',
										icon: 'images/document.svg'
									},
									{
										id: 'user_email',
										label: 'email',
										icon: 'images/document.svg'
									},
									{
										id: 'user_created_at',
										label: 'created_at',
										icon: 'images/document.svg'
									},
									{
										id: 'user_updated_at',
										label: 'updated_at',
										icon: 'images/document.svg'
									},
									{
										id: 'addresses',
										label: 'addresses',
										icon: 'images/file.svg',
										items: [
											{
												id: 'address_id',
												label: 'id',
												icon: 'images/document.svg'
											},
											{
												id: 'address_type',
												label: 'type',
												icon: 'images/document.svg'
											},
											{
												id: 'address_city',
												label: 'city',
												icon: 'images/document.svg'
											},
											{
												id: 'address_street',
												label: 'street',
												icon: 'images/document.svg'
											},
											{
												id: 'address_number',
												label: 'number',
												icon: 'images/document.svg'
											},
											{
												id: 'address_is_shipping',
												label: 'is_shipping',
												icon: 'images/document.svg'
											},
											{
												id: 'address_is_billing',
												label: 'is_billing',
												icon: 'images/document.svg'
											}
										]
									}
								]
							}
						]
					}
				]
			]
		});
		nanonull.setName('Nanonull');
		nanonull.position(50, 130);
		nanonull.addTo(this.graph);

		var links = [
			// order
			new joint.shapes.dataMap.Link({
				source: { id: nanonull.id, port: 'order_id' },
				target: { id: order.id, port: 'order_id' },
				anchor: { name: 'mapping' },
				connectionPoint: { name: 'anchor' }
			}),
			new joint.shapes.dataMap.Link({
				source: { id: nanonull.id, port: 'user_email' },
				target: { id: order.id, port: 'order_email' },
				anchor: { name: 'mapping' },
				connectionPoint: { name: 'anchor' }
			}),
			new joint.shapes.dataMap.Link({
				source: { id: nanonull.id, port: 'address' },
				target: { id: order.id, port: 'address' },
				anchor: { name: 'mapping' },
				connectionPoint: { name: 'anchor' }
			})
		];

		links.forEach(link => {
			link.addTo(this.graph);
		});

		function linkAction(link) {
			var dialog = new joint.ui.Dialog({
				title: 'Confirmation',
				width: 300,
				content: 'Are you sure you want to delete this link?',
				buttons: [
					{ action: 'cancel', content: 'Cancel' },
					{ action: 'remove', content: '<span style="color:#fe854f">Remove</span>' }
				]
			});

			dialog.open();
			dialog.on({
				'action:remove': function() {
					link.remove();
					dialog.remove();
				},
				'action:cancel': function() {
					dialog.remove();
				}
			});
		}
		function showLinkTools(linkView) {
			var tools = new joint.dia.ToolsView({
				tools: [
					new joint.linkTools.mapping.SourceArrowhead(),
					new joint.linkTools.mapping.TargetArrowhead(),
					new joint.linkTools.mapping.Remove({
						distance: '25%',
						action: function() {
							linkAction(this.model);
						}
					})
				]
			});
			linkView.addTools(tools);
		}

		this.paper.on('link:mouseenter', function(linkView) {
			this.removeTools();
			showLinkTools(linkView);
		});

		this.paper.on('link:mouseleave', function() {
			this.removeTools();
		});
	}

	renderCells(level, cells) {
		log('DataMap.renderCells', cells);

		this.paper.unfreeze();
		this.graph.clear();

		if (cells.length <= 1) {
			this.paper.freeze();
			return;
		}

		if (level <= 3) this._renderCells(level, cells);
		else if (level === 4) this._renderFieldMapping(level, cells);

		// this.loadExampleData();

		this.paper.freeze();

		log('DataMap.graph.getData', this.getData());
	}

	_renderFieldMapping(level, stages) {
		let links = [];

		stages.forEach(stage => {
			if (stage.type === 'link') {
				links.push(stage);
				return;
			}

			if (stage.type === 'api') {
				let cell = this.createCell(
					{
						type: 'dataMap.API',
						x: 20,
						y: 20
					},
					stage
				);
				cell.addTo(this.graph);
				return;
			}

			if (!stage.stageId || !stage.fields) return;

			let fields = [];
			let tableName =
				stage.tableName || (stage.fields && stage.fields.length > 0 ? stage.fields[0].table_name : '');
			stage.tableName = stage.tableName || tableName;
			fields = this.convertRecords(stage);
			/*let schema = convertSchemaToTreeData();
			(stage.fields || []).forEach(field => {
				fields.push({
					id: field.id,
					label: `${field.field_name} (${field.javaType})`,
					icon: "static/editor/file.svg",
				});
			});*/

			let cell = new joint.shapes.mapping.Record(
				{
					id: stage.stageId,
					size: { width: 300 },
					attrs: {
						headerLabel: {
							text: tableName || ''
						}
					},
					items: [fields]
				},
				{
					id: stage.stageId
				}
			);
			this.graph.addCell(cell);
			cell.autoresize();
		});

		if (links.length > 0) {
			links.forEach(link => {
				if (_.isObject(link.source) && link.source.port && link.source.id)
					this.ensurePort(link.source.id, link.source.port);

				if (_.isObject(link.target) && link.target.port && link.target.id)
					this.ensurePort(link.target.id, link.target.port);

				let sourceCell = this.graph.getCell(_.isObject(link.source) ? link.source.id : link.source);
				let targetCell = this.graph.getCell(_.isObject(link.target) ? link.target.id : link.target);

				if (sourceCell && targetCell) {
					// let sourceCellType = sourceCell.get('type');
					let targetCellType = targetCell.get('type');
					let linkCell;
					if (targetCellType === 'mapping.Record') {
						linkCell = new joint.shapes.dataMap.Link();

						let linkConfig = {
							anchor: { name: 'mapping' },
							connectionPoint: { name: 'anchor' }
						};
						let linkSourceConfig = _.cloneDeep(linkConfig);
						if (link.source.port) linkSourceConfig.port = link.source.port;
						linkCell.source(sourceCell, linkSourceConfig);

						let linkTargetConfig = _.cloneDeep(linkConfig);
						if (link.target.port) linkTargetConfig.port = link.target.port;
						linkCell.target(targetCell, linkTargetConfig);

						/*linkCell.connector({
							name: 'jumpover',
							args: { jump: 'arc' }
						});*/
						linkCell.router({
							name: 'mapping',
							args: { padding: 30 }
						});
						linkCell.addTo(this.graph);
					} else {
						linkCell = this.createLink(link.source, link.target);
					}
				}
			});
		}

		this.fitEmbeds({
			rankSep: 200
		});

		/*let cell = new joint.shapes.dataMap.Model({
			attrs: {
				headerLabel: {
					text: "Order"
				}
			},
			items: [
				[{
					id: 'orders',
					label: 'orders',
					icon: 'images/file.svg',
					items: [{
						id: 'order_id',
						label: 'id',
						icon: 'images/document.svg',
					}, {
						id: 'order_created_at',
						label: 'created_at',
						icon: 'images/document.svg',
					}, {
						id: 'order_updated_at',
						label: 'updated_at',
						icon: 'images/document.svg',
					}, {
						id: 'orderedproducts',
						label: 'orderedproducts',
						icon: 'images/file.svg',
						group: 'disabled'
					}, {
						id: 'users',
						label: 'users',
						icon: 'images/file.svg',
						items: [{
							id: 'user_id',
							label: 'id',
							icon: 'images/document.svg',
						}, {
							id: 'user_first_name',
							label: 'first_name',
							icon: 'images/document.svg',
						}, {
							id: 'user_last_name',
							label: 'last_name',
							icon: 'images/document.svg',
						}, {
							id: 'user_email',
							label: 'email',
							icon: 'images/document.svg',
						}, {
							id: 'user_created_at',
							label: 'created_at',
							icon: 'images/document.svg',
						}, {
							id: 'user_updated_at',
							label: 'updated_at',
							icon: 'images/document.svg',
						}, {
							id: 'addresses',
							label: 'addresses',
							icon: 'images/file.svg',
							items: [{
								id: 'address_id',
								label: 'id',
								icon: 'images/document.svg',
							}, {
								id: 'address_type',
								label: 'type',
								icon: 'images/document.svg',
							}, {
								id: 'address_city',
								label: 'city',
								icon: 'images/document.svg',
							}, {
								id: 'address_street',
								label: 'street',
								icon: 'images/document.svg',
							}, {
								id: 'address_number',
								label: 'number',
								icon: 'images/document.svg',
							}, {
								id: 'address_is_shipping',
								label: 'is_shipping',
								icon: 'images/document.svg',
							}, {
								id: 'address_is_billing',
								label: 'is_billing',
								icon: 'images/document.svg',
							}]
						}]
					}]
				}]
			]
		});*/

		// this.graph.addCell(cell);
	}

	convertRecords(stage) {
		if (!stage) return [];

		let schema = convertSchemaToTreeData({
			table_name: stage.tableName,
			meta_type: 'collection',
			fields: stage.fields
		});

		function _convert(parent, fields) {
			if (Array.isArray(fields)) {
				fields.forEach(field => _convert(parent, field));
			} else if (_.isObject(fields)) {
				parent.items = parent.items || [];
				let record = {
					id: fields.id,
					label: `${fields.label}    (${fields.type})`,
					icon: 'static/editor/file.svg'
				};
				if (fields.children && fields.children.length > 0) {
					record.icon = '';
					record.items = [];
					_convert(record, fields.children);
				}
				parent.items.push(record);
			}
		}

		let root = {};
		_convert(root, schema.fields);
		log('DataMap.graph.convertRecords', root.items);
		return root.items;
	}

	ensurePort() {
		/*let cellModel = this.graph.getCell(cellId);
		if( cellModel ){
			cellModel.addPort({
				id: portId,
			});
		}*/
	}

	_renderCells(level, cells) {
		// this.initLane();

		cells = cells || [];
		let self = this;

		let cellTypeMapping = {
			database_group: {
				type: 'dataMap.Classification',
				attrs: null,
				x: 20,
				y: 50
			},
			database: {
				type: 'dataMap.Database',
				attrs: null,
				x: 20,
				y: 50
			},
			tapdata: {
				type: 'dataMap.Tapdata',
				attrs: null,
				x: 20,
				y: 50
			},
			api: {
				type: 'dataMap.API',
				attrs: null,
				x: 20,
				y: 50
			},
			api_group: {
				type: 'dataMap.Classification',
				attrs: null,
				x: 20,
				y: 50
			},
			table: {
				type: 'dataMap.Table',
				attrs: null,
				x: 20,
				y: 50
			},
			model: {
				type: 'dataMap.API',
				attrs: null,
				x: 20,
				y: 50
			}
		};

		let links = [];
		/**
		 * server data node id -> joint cell id
		 * @type {{}}
		 */
		let idMap = {};

		/*idMap['sourceLane'] = this.sourceLane.id;
		idMap['tapdataLane'] = this.tapdataLane.id;
		idMap['apiLane'] = this.apiLane.id;*/

		cells.forEach(cellData => {
			let cell = null;
			if (['link'].includes(cellData.type)) {
				links.push(cellData);
			} else if (cellTypeMapping[cellData.type]) {
				cell = self.createCell(cellTypeMapping[cellData.type], cellData);
			} else {
				log('Not implement node ' + cellData.type);
			}

			if (cell) {
				idMap[cellData.id] = cell.id;
			}

			/*if(cell && lane) {
				const laneBBox = lane.getBBox();
				const cellBBox = cell.getBBox();
				const embeddedCells = lane.getEmbeddedCells().filter(cell => cell.isElement());

				let embeddedCellBBox = self.graph.getCellsBBox(embeddedCells);
				embeddedCellBBox = embeddedCellBBox || {
					height: 0,
					width: 0
				};

				let x = (laneBBox.width - cellBBox.width) / 2 + laneBBox.x;
				let y = embeddedCellBBox.height + (embeddedCells.length > 0 ? 10 : 0) + 50 + laneBBox.y;

				cell.position(x, y);
				lane.embed(cell);
			}*/
		});

		links.forEach(cellData => {
			self.createLink(idMap[cellData.source], idMap[cellData.target]);
		});

		let sourceChildren = [],
			tapdataChildren = [],
			apiChildren = [];

		// process element embed
		cells
			.filter(c => !!c.parent)
			.forEach(cellData => {
				let parentId = idMap[cellData.parent] || '';
				let parentCell = self.graph.getCell(parentId);
				let cell = self.graph.getCell(idMap[cellData.id]);
				if (cell) {
					if (parentCell) {
						parentCell.embed(cell);
					}
					if (cellData.parent === 'sourceLane') {
						sourceChildren.push(cell);
					} else if (cellData.parent === 'tapdataLane') {
						tapdataChildren.push(cell);
					} else if (cellData.parent === 'apiLane') {
						apiChildren.push(cell);
					}
				}
			});

		let applyStyle = function(cells, bgColor, borderColor) {
			cells.forEach(cell => {
				cell.attr({
					body: {
						fill: bgColor,
						stroke: borderColor
					}
				});
			});
		};

		let sourceCells = [];
		sourceChildren.forEach(cell => {
			sourceCells.push(cell);
			sourceCells = sourceCells.concat(cell.getEmbeddedCells({ deep: true }));
		});
		applyStyle(sourceCells, '#fcf9fe', '#dedede');

		let tapdataCells = [];
		tapdataChildren.forEach(cell => {
			tapdataCells.push(cell);
			tapdataCells = tapdataCells.concat(cell.getEmbeddedCells({ deep: true }));
		});
		applyStyle(tapdataCells, '#ebf7fc', '#b1e4f8');

		let apiCells = [];
		apiChildren.forEach(cell => {
			apiCells.push(cell);
			apiCells = apiCells.concat(cell.getEmbeddedCells({ deep: true }));
		});
		applyStyle(apiCells, '#fbecec', '#f7dddd');

		self.graph.getCells().forEach(cell => {
			let embeddedCells = cell.getEmbeddedCells();

			if (embeddedCells.length > 0) {
				cell.attr({
					body: {
						'fill-opacity': 0.2
					},
					label: {
						rx: 5,
						ry: 5,
						refWidth: '10%',
						refHeight: '10%'
					}
				});
			}
		});

		this.fitEmbeds();

		// this.updateLanes();
	}

	showProperties(cellView, e) {
		// log("DataMap.Graph.showProperties", cellView, e);

		let cell = cellView.model;
		let properties = cell.get('properties');
		if (!properties || Object.keys(properties).length === 0) {
			this.hideProperties(cellView, e);
			return;
		}

		let bbox = cellView.getBBox();
		let dom = this.paper.$el.find('.properties-info-container');
		if (!dom || dom.length === 0) {
			dom = $(`<div class="properties-info-container"></div>`);
			this.paper.$el.append(dom);
		}
		/*let position = cell.position();
		let paperPoint = this.paper.localToPaperPoint(position.x, position.y);*/
		dom.css('left', `${bbox.x + bbox.width + 10}px`);
		dom.css('top', `${bbox.y + bbox.height / 2 - 30}px`);
		dom.find('>*').remove();
		Object.keys(properties).forEach(key => {
			let label = i18n.t('dataMap.properties.' + key) || key;
			let value = Array.isArray(properties[key]) ? properties[key].join(', ') : properties[key];
			dom.append($(`<div>${label}: ${value}</div>`));
		});
	}

	hideProperties(cellView, e) {
		log('DataMap.Graph.hideProperties', cellView, e);
		this.paper.$el.find('.properties-info-container').remove();
	}

	handlerCellDbClick(cellView, evt) {
		log('DataMap.Graph.handlerCellDbClick', cellView, evt);
		let cellModel = cellView.model;
		if (!cellModel.isElement()) return;
		let cellType = cellModel.get('type');
		if (['dataMap.Classification'].includes(cellType)) {
			this.emit('drill_down', 2);
		} else if (['dataMap.Database'].includes(cellType)) {
			this.emit('drill_down', 3);
		} else if (['dataMap.Table'].includes(cellType)) {
			let connectionId = cellModel.get('connectionId');
			let properties = cellModel.get('properties') || {};
			let originalName = properties.original_name || '';
			this.emit('drill_down', 4, connectionId, originalName);
		} else if (['dataMap.Model'].includes(cellType)) {
			// non-handler
		}
	}

	handlerBlankDbClick() {
		this.emit('drill_down', 0);
	}

	getData() {
		return this.graph.toJSON();
	}

	zoomIn() {
		this.paperScroller.zoom(0.2, { max: 4 });
	}

	zoomOut() {
		this.paperScroller.zoom(-0.2, { min: 0.2 });
	}
}
