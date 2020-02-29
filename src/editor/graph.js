/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import Component from "./lib/Component";

import _ from 'lodash';
import joint from './lib/rappid/rappid';
import shapes from './lib/rappid/models/shapes';
import stencilConfig from './lib/rappid/config/stencil';

export default class Graph extends Component{

	constructor(opts){
		super(opts);

		this.init();

	}

	doInit() {
		this.initGraph();
		//this.initKeyboardShortcuts();
	}

	initGraph(){

		shapes(joint);

		const graph = this.graph = new joint.dia.Graph;

		const paper = this.paper = new joint.dia.Paper({
			model: graph,
			width: 500,
			height: 500,
			gridSize: 20,
			drawGrid: true,
			defaultLink: new joint.shapes.app.Link,
			defaultConnectionPoint: joint.shapes.app.Link.connectionPoint,
			interactive: { linkMove: false },
			async: true,
			sorting: joint.dia.Paper.sorting.APPROX
		});

		paper.on('blank:mousewheel', this.onMousewheel, this);
		paper.on('cell:mousewheel', this.onMousewheel, this);

		this.snaplines = new joint.ui.Snaplines({ paper: paper });

		const paperScroller = this.paperScroller = new joint.ui.PaperScroller({
			paper: paper,
			autoResizePaper: true,
			cursor: 'grab',
			contentOptions: function(paperScroller) {
				var visibleArea = paperScroller.getVisibleArea();
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

		if( this.opts.container) {
			this.render(this.opts.container);
		}

		//paperScroller.render().center();
	}

	initializeStencil() {
		const stencil = this.stencil = new joint.ui.Stencil({
			paper: this.paperScroller,
			snaplines: this.snaplines,
			scaleClones: true,
			width: 240,
			groups: stencilConfig.groups,
			dropAnimation: true,
			groupsToggleButtons: true,
			search: {
				'*': ['type', 'attrs/text/text', 'attrs/root/dataTooltip', 'attrs/label/text'],
				'org.Member': ['attrs/.rank/text', 'attrs/root/dataTooltip', 'attrs/.name/text']
			},
			// Use default Grid Layout
			layout: true,
			// Remove tooltip definition from clone
			dragStartClone: function(cell) {
				return cell.clone().removeAttr('root/dataTooltip');
			}
		});

		this.$('.stencil-container').append(stencil.el);
		//stencil.render().load(App.config.stencil.shapes);
	}

	initKeyboardShortcuts() {

		this.keyboard = new joint.ui.Keyboard();
		this.keyboard.on({

			'ctrl+c': function() {
				// Copy all selected elements and their associated links.
				this.clipboard.copyElements(this.selection.collection, this.graph);
			},

			'ctrl+v': function() {

				var pastedCells = this.clipboard.pasteCells(this.graph, {
					translate: { dx: 20, dy: 20 },
					useLocalStorage: true
				});

				var elements = _.filter(pastedCells, function(cell) {
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
}
