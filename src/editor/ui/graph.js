/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import Component from "../lib/Component";

import _ from 'lodash';
import joint from '../lib/rappid/rappid';
//import shapes from '../lib/rappid/models/shapes';
import navigatorElementView from '../lib/rappid/view/navigator';
//import Panel from "./panel";
import {stencilConfig, selectionConfig, haloConfig, toolbarConfig} from "../lib/rappid/config";
import {VueAdapter} from '../vue-adapter';
import log from "../../log";

window.joint = joint;

export default class Graph extends Component{

	constructor(opts){
		super(opts);

		this.ui = opts.ui;

		this.init();
	}

	doInit() {
		this.initGraph();
		this.initStencil();
		this.initSelection();
		this.initToolsAndInspector();
		this.initializeNavigator();
		this.initializeToolbar();
		this.initKeyboardShortcuts();
		this.initTooltips();
		this.initVueAdapter();
	}

	initGraph(){
		let self = this;

		//shapes(joint);

		const graph = this.graph = new joint.dia.Graph;

		graph.on('add', function(cell, collection, opt) {
			if (opt.stencil) self.createInspector(cell);
		}, this);

		this.commandManager = new joint.dia.CommandManager({ graph: graph });

		const paper = this.paper = new joint.dia.Paper({
			model: graph,
			width: 800,
			height: 800,
			gridSize: 15,
			drawGrid: true,
			defaultLink: new joint.shapes.app.Link,
			defaultConnectionPoint: joint.shapes.app.Link.connectionPoint,
			interactive: { linkMove: false },
			async: true,
			sorting: joint.dia.Paper.sorting.APPROX,
			snapLinks: 75
		});

		paper.on('blank:mousewheel',  _.partial(this.onMousewheel, null), this);
		paper.on('cell:mousewheel', this.onMousewheel, this);
		paper.on('blank:pointerclick', () => {
			this.ui.rightSidebar.hide();
		});
		paper.on('link:connect', function(linkView, evt, elementViewConnected, magent, arrowhead){
			log('Graph.link.connect', arguments);
			let targetCell = linkView.model.getTargetCell();
			if( targetCell && typeof targetCell.updateOutputSchema === 'function'){
				targetCell.updateOutputSchema();
			}
		});
		paper.on('link:disconnect', function(linkView, evt, elementViewDisconnected, magent, arrowhead){
			log('Graph.link.disconnect', arguments);
			let targetCell = elementViewDisconnected.model;
			if( targetCell && typeof targetCell.updateOutputSchema === 'function'){
				targetCell.updateOutputSchema();
			}
		});

		this.snaplines = new joint.ui.Snaplines({ paper: paper });

		const paperScroller = this.paperScroller = new joint.ui.PaperScroller({
			paper: paper,
			autoResizePaper: true,
			cursor: 'grab',
			contentOptions: function(paperScroller) {
				let visibleArea = paperScroller.getVisibleArea();
				return {
					padding: {
						bottom: visibleArea.height / 2,
						top: visibleArea.height / 2,
						left: visibleArea.width / 2,
						right: visibleArea.width / 2
					},
					allowNewOrigin: 'any'
				};
			}
		});

		this.el = paperScroller.el;
		this.ui.add(this);
		paperScroller.render().center();
	}

	initStencil() {
		const stencil = this.stencil = new joint.ui.Stencil({
			paper: this.paperScroller,
			snaplines: this.snaplines,
			scaleClones: true,
			width: 180,
			groups: stencilConfig.groups,
			dropAnimation: true,
			groupsToggleButtons: true,
			layout: {
				columnWidth: 80,
				columns: 2,
				rowHeight: 47,
			},
			/*search: {
				'*': ['type', 'attrs/text/text', 'attrs/root/dataTooltip', 'attrs/label/text'],
				'org.Member': ['attrs/.rank/text', 'attrs/root/dataTooltip', 'attrs/.name/text']
			},*/
			// Remove tooltip definition from clone
			dragStartClone: function(cell) {
				let Cell = _.get(joint.shapes, cell.get('type'));
				// return cell.clone().removeAttr('root/dataTooltip');
				return new Cell({}).removeAttr('root/dataTooltip');
			}
		});

		this.ui.getLeftSidebarEl().append(stencil.el);
		stencil.render().load(stencilConfig.shapes);
	}

	initSelection(){
		this.clipboard = new joint.ui.Clipboard();
		this.selection = new joint.ui.Selection({
			paper: this.paper,
			handles: selectionConfig,
			useModelGeometry: true
		});

		this.selection.collection.on('reset add remove', this.onSelectionChange.bind(this));

		// Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
		// Otherwise, initiate paper pan.
		this.paper.on('blank:pointerdown', function(evt, x, y) {

			if (this.keyboard.isActive('shift', evt)) {
				this.selection.startSelecting(evt);
			} else {
				this.selection.collection.reset([]);
				this.paperScroller.startPanning(evt, x, y);
				this.paper.removeTools();
			}

		}, this);

		this.paper.on('element:pointerdown', function(elementView, evt) {

			// Select an element if CTRL/Meta key is pressed while the element is clicked.
			if (this.keyboard.isActive('ctrl meta', evt)) {
				if (this.selection.collection.find(function(cell) {
					return cell.isLink();
				})) {
					// Do not allow mixing links and elements in the selection
					this.selection.collection.reset([elementView.model]);
				} else {
					this.selection.collection.add(elementView.model);
				}
			}

		}, this);

		this.selection.on('selection-box:pointerdown', function(elementView, evt) {

			// Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
			if (this.keyboard.isActive('ctrl meta', evt)) {
				evt.preventDefault();
				this.selection.collection.remove(elementView.model);
			}

		}, this);
	}

	onSelectionChange() {
		let paper = this.paper;
		let selection = this.selection;
		let collection = selection.collection;
		paper.removeTools();
		joint.ui.Halo.clear(paper);
		joint.ui.FreeTransform.clear(paper);
		joint.ui.Inspector.close();
		if (collection.length === 1) {
			let primaryCell = collection.first();
			let primaryCellView = paper.requireView(primaryCell);
			selection.destroySelectionBox(primaryCell);
			this.selectPrimaryCell(primaryCellView);
		} else if (collection.length === 2) {
			collection.each(function(cell) {
				selection.createSelectionBox(cell);
			});
		}
	}

	selectPrimaryCell(cellView) {
		var cell = cellView.model;
		if (cell.isElement()) {
			this.selectPrimaryElement(cellView);
		} else {
			this.selectPrimaryLink(cellView);
		}
		this.createInspector(cell);
	}

	selectPrimaryElement(elementView) {

		var element = elementView.model;

		if( element.get('freeTransform') !== false) {
			new joint.ui.FreeTransform({
				cellView: elementView,
				allowRotation: false,
				preserveAspectRatio: !!element.get('preserveAspectRatio'),
				allowOrthogonalResize: element.get('allowOrthogonalResize') !== false
			}).render();
		}

		new joint.ui.Halo({
			cellView: elementView,
			handles: haloConfig.handles,
			boxContent: false
		}).render();
	}

	selectPrimaryLink(linkView) {

		var ns = joint.linkTools;
		var toolsView = new joint.dia.ToolsView({
			name: 'link-pointerdown',
			tools: [
				new ns.Vertices(),
				new ns.SourceAnchor(),
				new ns.TargetAnchor(),
				new ns.SourceArrowhead(),
				new ns.TargetArrowhead(),
				new ns.Segments,
				new ns.Boundary({ padding: 15 }),
				new ns.Remove({ offset: -20, distance: 40 })
			]
		});

		linkView.addTools(toolsView);
	}

	createInspector(cell) {

		let self = this;
		let rendered = this.vueAdapter.render(cell);
		if( rendered ){
			self.ui.rightSidebar.show();
		} else {
			self.ui.rightSidebar.hide();
		}


		/*let styles = self.ui.rightTabPanel.getChildByName('styles');
		// styles.removeAll();
		if( !styles) {
			styles = new Panel({
				name: 'styles',
				title: 'Styles'
			});
			self.ui.rightTabPanel.add(styles);
		}

		joint.ui.Inspector.create(styles.getContentEl(), _.extend({
			cell: cell
		}, inspectorConfig[cell.get('type')]));*/

	}

	initToolsAndInspector() {

		this.paper.on({

			'cell:pointerup': function(cellView) {
				let cell = cellView.model;
				let collection = this.selection.collection;
				if (collection.includes(cell)) return;
				collection.reset([cell]);
			},

			'link:mouseenter': function(linkView) {

				if (linkView.hasTools()) return;

				let ns = joint.linkTools;
				let toolsView = new joint.dia.ToolsView({
					name: 'link-hover',
					tools: [
						new ns.Vertices({ vertexAdding: false }),
						new ns.SourceArrowhead(),
						new ns.TargetArrowhead()
					]
				});

				linkView.addTools(toolsView);
			},

			'link:mouseleave': function(linkView) {
				// Remove only the hover tool, not the pointerdown tool
				if (linkView.hasTools('link-hover')) {
					linkView.removeTools();
				}
			}

		}, this);

		this.graph.on('change', function(cell, opt) {

			if (!cell.isLink() || !opt.inspector) return;

			/*let ns = joint.linkTools;
			let toolsView = new joint.dia.ToolsView({
				name: 'link-inspected',
				tools: [
					new ns.Boundary({ padding: 15 }),
				]
			});

			cell.findView(this.paper).addTools(toolsView);*/

		}, this);
	}

	initializeNavigator() {

		navigatorElementView(joint);

		let navigator = this.navigator = new joint.ui.Navigator({
			width: 150,
			height: 150,
			paperScroller: this.paperScroller,
			zoom: {
				grid: 0.2,
				min: 0.2,
				max: 5
			},
			paperOptions: {
				async: true,
				elementView: joint.shapes.app.NavigatorElementView,
				linkView: joint.shapes.app.NavigatorLinkView,
				cellViewNamespace: { /* no other views are accessible in the navigator */ }
			}
		});

		this.ui.getNavigatorEl().append(navigator.el);
		navigator.render();
	}

	initializeToolbar() {

		let toolbar = this.toolbar = new joint.ui.Toolbar({
			autoToggle: true,
			groups: toolbarConfig.groups,
			tools: toolbarConfig.tools,
			references: {
				paperScroller: this.paperScroller,
				commandManager: this.commandManager
			}
		});

		toolbar.on({
			'svg:pointerclick': this.openAsSVG.bind(this),
			'png:pointerclick': this.openAsPNG.bind(this),
			'to-front:pointerclick': this.applyOnSelection.bind(this, 'toFront'),
			'to-back:pointerclick': this.applyOnSelection.bind(this, 'toBack'),
			'layout:pointerclick': this.layoutDirectedGraph.bind(this),
			'snapline:change': this.changeSnapLines.bind(this),
			'clear:pointerclick': this.graph.clear.bind(this.graph),
			'print:pointerclick': this.paper.print.bind(this.paper),
			'grid-size:change': this.paper.setGridSize.bind(this.paper)
		});

		this.ui.getGraphToolbarEl().append(toolbar.el);
		toolbar.render();
	}

	initKeyboardShortcuts() {

		this.keyboard = new joint.ui.Keyboard();
		this.keyboard.on({

			'ctrl+c': function() {
				// Copy all selected elements and their associated links.
				this.clipboard.copyElements(this.selection.collection, this.graph);
			},

			'ctrl+v': function() {

				let pastedCells = this.clipboard.pasteCells(this.graph, {
					translate: { dx: 20, dy: 20 },
					useLocalStorage: true
				});

				let elements = _.filter(pastedCells, function(cell) {
					return cell.isElement();
				});

				// Make sure pasted elements get selected immediately. This makes the UX better as
				// the user can immediately manipulate the pasted elements.
				this.selection.collection.reset(elements);
			},

			'ctrl+x shift+delete': function() {
				this.clipboard.cutElements(this.selection.collection, this.graph);
			},

			'delete backspace': function(evt) {
				evt.preventDefault();
				this.graph.removeCells(this.selection.collection.toArray());
			},

			'ctrl+z': function() {
				this.commandManager.undo();
				this.selection.cancelSelection();
			},

			'ctrl+y': function() {
				this.commandManager.redo();
				this.selection.cancelSelection();
			},

			'ctrl+a': function() {
				this.selection.collection.reset(this.graph.getElements());
			},

			'ctrl+plus': function(evt) {
				evt.preventDefault();
				this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
			},

			'ctrl+minus': function(evt) {
				evt.preventDefault();
				this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
			},

			'keydown:shift': function(evt) {
				this.paperScroller.setCursor('crosshair');
			},

			'keyup:shift': function() {
				this.paperScroller.setCursor('grab');
			}

		}, this);
	}


	initTooltips() {

		new joint.ui.Tooltip({
			rootTarget: document.body,
			target: '[data-tooltip]',
			direction: 'auto',
			padding: 10,
			animation: true
		});
	}

	initVueAdapter() {
		this.vueAdapter = new VueAdapter(this.ui, this);
	}

	resize(width, height) {
		// this.graph.resize(width, height);
		// this.paper.setDimensions(width, height);
	}

	onMousewheel(cellView, evt, x, y, delta){
		if (this.keyboard.isActive('alt', evt)) {
			evt.preventDefault();
			this.paperScroller.zoom(delta * 0.2, { min: 0.2, max: 5, grid: 0.2, ox: x, oy: y });
		}
	}

	exportStylesheet = '.scalable * { vector-effect: non-scaling-stroke }';

	openAsSVG() {

		let paper = this.paper;
		paper.hideTools().toSVG(function(svg) {
			new joint.ui.Lightbox({
				image: 'data:image/svg+xml,' + encodeURIComponent(svg),
				downloadable: true,
				fileName: 'Rappid'
			}).open();
			paper.showTools();
		}, {
			preserveDimensions: true,
			convertImagesToDataUris: true,
			useComputedStyles: false,
			stylesheet: this.exportStylesheet
		});
	}

	openAsPNG() {

		let paper = this.paper;
		paper.hideTools().toPNG(function(dataURL) {
			new joint.ui.Lightbox({
				image: dataURL,
				downloadable: true,
				fileName: 'Rappid'
			}).open();
			paper.showTools();
		}, {
			padding: 10,
			useComputedStyles: false,
			stylesheet: this.exportStylesheet
		});
	}

	applyOnSelection(method) {
		this.graph.startBatch('selection');
		this.selection.collection.models.forEach(function(model) { model[method](); });
		this.graph.stopBatch('selection');
	}

	layoutDirectedGraph() {

		joint.layout.DirectedGraph.layout(this.graph, {
			setLinkVertices: true,
			rankDir: 'LR',
			marginX: 100,
			marginY: 100
		});

		this.paperScroller.centerContent();
	}

	changeSnapLines(checked) {

		if (checked) {
			this.snaplines.startListening();
			this.stencil.options.snaplines = this.snaplines;
		} else {
			this.snaplines.stopListening();
			this.stencil.options.snaplines = null;
		}
	}

	getData(){
		return this.graph.toJSON();
	}

	loadData(jsonObject){
		return this.graph.fromJSON(jsonObject);
	}

	getGraphLib(){
		return this.graph.toGraphLib();
	}
}
