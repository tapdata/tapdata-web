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
import factory from "../../../api/factory";
import log from "../../../log";

window.joint = window.joint || joint;

const metadataInstances = factory("MetadataInstances");

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

		this.createLanes();

		this.loadData();
		// this.loadExampleData();

		this.sourceLane.toBack();
		this.tapdataLane.toBack();
		this.apiLane.toBack();

		let embedOpts = {
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
		this.apiLane.fitEmbeds(_.cloneDeep(embedOpts));

		/*joint.layout.DirectedGraph.layout(this.graph, {
			setLinkVertices: true,
			rankDir: "LR",
			marginX: 100,
			marginY: 100,
			resizeToFit: true
		});*/

		//this.paperScroller.zoomToFit([opt]);
		this.paper.fitToContent();
		// this.updateLanes();
		// this.paper.freeze();
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
			defaultConnector: { name: "rounded" },
			defaultRouter: { name: "orthogonal" },
			restrictTranslate: function(elementView) {
				let parentId = elementView.model.get('parent');
				return parentId && this.model.getCell(parentId).getBBox();
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
		/*self.paper.on('cell:pointerdown', (cellView, evt, x, y) => {
			self.paperScroller.startPanning(evt, x, y);
		});*/

		this.paperScroller.center();
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
		this.sourceLane = new joint.shapes.dataMap.Lane({
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
		this.graph.addCell(this.apiLane);

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

	createLink(source, target) {
		return new joint.shapes.standard.Link({
			router: {
				name: "manhattan"
			},
			connector: {
				name: "rounded"
			},
			source: {
				id: source
			},
			target: {
				id: target
			}
		});
	}

	createCell(cellType, x, y) {
		let CellConstructor = _.get(joint.shapes, cellType);
		let cell = new CellConstructor({});

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

	loadData(){
		let self = this;
		metadataInstances.dataMap(1).then(result => {

			if(result && result.data){
				let cells = result.data.records;
				self.renderCells(cells);
			}

		}).catch(err => {

		});
	}

	getData(){
		return this.graph.toJSON();
	}

	renderCells(cells){
		log("DataMap.renderCells", cells);
		cells = cells || [];

		let links = [];
		cells.forEach((cellData) => {
			let cellType = null;
			switch (cellData.type) {
				case "link":
					links.push(cellData);
					break;
				case "database_group":
					cellType = "dataMap.Classification";
					break;
				case "database":
					cellType = "dataMap.Database";
					break;
				case "tapdata":
					cellType = "dataMap.Tapdata";
					break;
				case "api_group":
					cellType = "dataMap.APIClassification";
					break;
				case "api":
					cellType = "dataMap.API";
					break;
				case "model":
					cellType = "dataMap.API";
					break;
				default:
					cellType = "dataMap.API";
			}

			if(cellType){
				let cell = self.createCell(cellType, 20, 50);
			}

		} );
	}

}
