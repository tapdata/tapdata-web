/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/18/20
 * @description
 */
import joint from "../../lib/rappid/rappid";
import Component from "../../lib/Component";
import $ from "jquery";
import shapes from "../models/shapes";
import _ from "lodash";

import log from "../../../log";

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

		this.initGraph();

		this.initLane();

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
			defaultConnectionPoint: { name: "boundary", args: { extrapolate: true } },
			// defaultConnectionPoint: joint.shapes.dataMap.Link.connectionPoint,
			defaultConnector: { name: "rounded" },
			defaultRouter: { name: "metro" },
			restrictTranslate: function(elementView) {
				let parentId = elementView.model.get('parent');
				let parentCell = parentId && this.model.getCell(parentId);
				let parentCellType = parentCell && parentCell.get('type');
				let parentBBox = parentCell && parentCell.getBBox();
				if(parentCellType === 'dataMap.Lane'){
					parentBBox = parentBBox || {};
					parentBBox.y += 50;
					parentBBox.height -= 50;
				}
				return parentCell && parentBBox;
			},
			/*embeddingMode: false,*/
			// frontParentOnly: false,
			defaultAnchor: { name: 'perpendicular' },
			/*frozen: true*/
			//sorting: joint.dia.Paper.sorting.APPROX
		});

		self.paperScroller = (self.paperScroller = new joint.ui.PaperScroller({
			el: self.container,
			paper: self.paper,
			autoResizePaper: true,
			cursor: "grab",
			contentOptions: function(paperScroller) {
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
					allowNewOrigin: "any"
				};
			}
		}));
		self.paper.on('blank:pointerdown', self.paperScroller.startPanning);
		self.paper.on('cell:pointerdown', (cellView, evt, x, y) => {
			self.paperScroller.startPanning(evt, x, y);
		});

		this.paperScroller.center();
	}

	initLane(){
		this.createLanes();

		// this.loadExampleData();

		this.sourceLane.toBack();
		this.tapdataLane.toBack();
		this.apiLane.toBack();

		//this.paperScroller.zoomToFit([opt]);
		// this.paper.fitToContent();
		// this.updateLanes();
	}

	getContentBBox(){
		const parent = $(this.container).parent();
		const width = parent.width();
		const height = parent.height();
		return {
			w: width,
			h: height
		};
	}

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
		this.sourceLane = this.createLane({
			attrs: {
				headerText: {
					text: 'SOURCE'
				}
			}
		}, {
			id: 'sourceLane'
		});

		this.tapdataLane = this.createLane({
			attrs: {
				headerText: {
					text: 'Tapdata'
				}
			}
		}, {
			id: 'tapdataLane'
		});

		this.apiLane = this.createLane({
			attrs: {
				headerText: {
					text: 'API'
				}
			}
		}, {
			id: 'apiLane'
		});

		this.sourceLane.on("change:size", (element, newSize, opt) => this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing));
		this.tapdataLane.on("change:size", (element, newSize, opt) => this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing));
		this.apiLane.on("change:size", (element, newSize, opt) => {
			this.setLaneHeaderStyle(this.sourceLane, newSize.width, this.spacing);
		});

		this.updateLanes();
		window.addEventListener("resize", this.updateLanes.bind(this));
	}

	updateLanes() {
		let spacing = this.spacing;
		let bbox = this.getContentBBox();
		let width = (bbox.w - spacing * 4) / 3;
		let height = bbox.h - spacing * 2;

		let sourceWidth = width;
		let tapdataWidth = width;
		let apiWidth = width;

		this.sourceLane.resize(sourceWidth, height);
		this.sourceLane.position(spacing, spacing);
		this.setLaneHeaderStyle(this.sourceLane, sourceWidth, spacing);

		this.tapdataLane.resize(tapdataWidth, height);
		this.tapdataLane.position(spacing + sourceWidth + spacing, spacing);
		this.setLaneHeaderStyle(this.tapdataLane, sourceWidth, spacing);

		this.apiLane.resize(apiWidth, height);
		this.apiLane.position(spacing + sourceWidth + spacing + tapdataWidth + spacing, spacing);
		this.setLaneHeaderStyle(this.apiLane, sourceWidth, spacing);
	}

	fitEmbeds(){

		joint.layout.DirectedGraph.layout(this.graph, {
			setLinkVertices: false,
			rankDir: "LR",
			marginX: 50,
			marginY: 50,
			// resizeToFit: true,
			nodeSep: 10,
			edgeSep: 10,
			clusterPadding: { top: 50, left: 10, right: 10, bottom: 10 }
		});

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

		this.paperScroller.zoomToFit();
		/*this.paper.scaleContentToFit({
			padding: 50
		});*/

	}

	setLaneHeaderStyle(lane, width, spacing){
		lane.attr({
			header: {
				x: spacing,
				y: spacing,
				refWidth: `${(width - spacing * 2) / width * 100}%`,
				width: width - spacing * 2
			},
			headerText: {
				refY: spacing + 15,
				//text: `${(width - spacing * 2) / width * 100}%`
			}
		});
		//lane.attr('header/width', width - spacing * 2);
	}

	createLane(attrs, opts){
		let lane = new joint.shapes.dataMap.Lane(_.merge({
			size: {
				width: 200,
				height: 200
			},
			attrs: {
				headerText: {
					text: 'API'
				}
			}
		}, attrs), opts);
		this.graph.addCell(lane);
		return lane;
	}

	createLink(source, target) {
		return new joint.shapes.standard.Link({
			source: {
				id: source
			},
			target: {
				id: target
			}
		}).addTo(this.graph);
	}

	createCell(cellType, x, y, attrs, cellData) {
		let CellConstructor = _.get(joint.shapes, cellType);
		let cell = new CellConstructor(_.merge({
			attrs: {
				label: {
					text: cellData.name
				}
			}
		}, attrs || {}));

		cell.position(x, y).addTo(this.graph);
		return cell;
	}

	loadExampleData(){
		let self = this;
		let tapdataLaneBBox = self.tapdataLane.getBBox();
		let x = tapdataLaneBBox.width / 2;
		let y = tapdataLaneBBox.height / 2;
		x = Number(Number(x).toFixed(0));
		y = Number(Number(y).toFixed(0));
		/*let tapdataCell = this.createCell("dataMap.Tapdata", x, y);

		// self.graph.addCell(tapdataCell);
		self.tapdataLane.embed(tapdataCell);*/

		let tapdataCell = null;

		x = 20;
		y = 55;
		Array.from({length: 10}).forEach(() => {
			let source = null;
			["dataMap.Database", "dataMap.Classification", "dataMap.Tapdata", "dataMap.API"].forEach( cellType => {
				let cell;
				if( cellType === "dataMap.Tapdata"){
					if( tapdataCell ){
						cell = tapdataCell;
					} else {
						tapdataCell = cell = self.createCell(cellType, x+=300, y);
						self.tapdataLane.embed(cell);
					}
				} else {
					cell = self.createCell(cellType, x+=300, y);
				}

				if(["dataMap.Database", "dataMap.Classification"].includes(cellType)){
					self.sourceLane.embed(cell);
				} else if( cellType === "dataMap.Tapdata"){
					//
				} else {
					self.apiLane.embed(cell);
				}
				if(source){
					self.graph.addCell(self.createLink(source.id, cell.id));
				}
				source = cell;
			});
			x = 20;
			y += 100;
		});

	}

	renderCells(level, cells){
		log("DataMap.renderCells", cells);

		this.paper.unfreeze();
		this.graph.clear();
		this.initLane();

		cells = cells || [];
		let self = this;

		let links = [];
		let idMap = {};
		cells.forEach((cellData) => {
			let cell = null;
			let lane = null;
			if(["link"].includes(cellData.type)) {
				links.push(cellData);
			} else if(["database_group"].includes(cellData.type)){
				lane = self.sourceLane;
				cell = self.createCell("dataMap.Classification", 20, 50, null, cellData);
			} else if(["database"].includes(cellData.type)){
				lane = self.sourceLane;
				cell = self.createCell("dataMap.Database", 20, 50, null, cellData);
			} else if(["tapdata"].includes(cellData.type)){
				lane = self.tapdataLane;
				cell = self.createCell("dataMap.Tapdata", 20, 50, null, cellData);
			} else if(["api"].includes(cellData.type)){
				lane = self.apiLane;
				cell = self.createCell("dataMap.API", 20, 50, null, cellData);
			} else if(["api_group"].includes(cellData.type)){
				lane = self.apiLane;
				cell = self.createCell("dataMap.Classification", 20, 50, null, cellData);
			} else if(["model"].includes(cellData.type)){
				cell = self.createCell("dataMap.API", 20, 50, null, cellData);
			}

			if(cell) {
				idMap[cellData.id] = cell.id;
			}

			if(cell && lane) {
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
			}

		} );

		links.forEach((cellData) => {
			self.createLink(idMap[cellData.source], idMap[cellData.target]);
		});

		cells.filter(c => !!c.parent).forEach(cellData => {
			let parentId = idMap[cellData.parent] || '';
			let parentCell = self.graph.getCell(parentId);
			let cell = self.graph.getCell(idMap[cellData.id]);
			if(parentCell && cell){
				parentCell.embed(cell);
			}
		});

		this.fitEmbeds();

		this.paper.freeze();

		log("DataMap.graph.getData", self.getData());
	}

	getData() {
		return this.graph.toJSON();
	}

	zoomIn(){
		this.paperScroller.zoom(0.2, {max: 4});
	}

	zoomOut(){
		this.paperScroller.zoom(-0.2, {min: 0.2});
	}

}
