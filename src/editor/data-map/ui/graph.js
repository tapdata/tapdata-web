/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/18/20
 * @description
 */
import joint from "../../lib/rappid/rappid";
import Component from "../../lib/Component";
import $ from "jquery";
import Lane from "../models/lane";
import shapes from "../models/shapes";
import _ from "lodash";
window.joint = window.joint || joint;

export default class Graph extends Component {
	constructor(props) {
		super(props);

		this.dataMap = props.dataMap;
		this.container = props.container;

		this.sourceLane = null;
		this.tapdataLane = null;
		this.apiLane = null;

		this.init();
	}

	doInit() {
		super.doInit();

		shapes(joint);

		this.initGraph();

		this.createLanes();

		this.loadExampleData();

		this.paper.freeze();
	}

	initGraph() {

		const graph = (this.graph = new joint.dia.Graph());
		let bbox = this.getContentBBox();

		this.paper = new joint.dia.Paper({
			el: this.container,
			model: graph,
			width: 3000,
			height: 3000,
			defaultConnectionPoint: { name: "boundary", args: { extrapolate: true } },
			defaultConnector: { name: "rounded" },
			defaultRouter: { name: "orthogonal" },
			restrictTranslate: {
				x: 0,
				y: 0,
				width: bbox.w,
				height: bbox.h
			},
			gridSize: 1,
			/*frozen: true*/
			//sorting: joint.dia.Paper.sorting.APPROX
		});

		//graph.on("change:position", this.updateLanes, this);

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
		this.sourceLane = new Lane({
			title: "source",
			titleHeight: 30,
			width: 200,
			height: 200,
			x: 10,
			y: 10
		});
		this.sourceLane.addTo(this.paper);

		this.tapdataLane = new Lane({
			title: "Tapdata",
			titleHeight: 30,
			width: 200,
			height: 200,
			x: 10,
			y: 10
		});
		this.tapdataLane.addTo(this.paper);

		this.apiLane = new Lane({
			title: "API",
			titleHeight: 30,
			width: 200,
			height: 200,
			x: 10,
			y: 10
		});
		this.apiLane.addTo(this.paper);

		this.updateLanes();
		window.addEventListener("resize", this.updateLanes.bind(this));
	}

	updateLanes() {
		let bbox = this.getContentBBox();
		let width = (bbox.w - 40) / 3;
		let height = bbox.h - 20;

		let sourceWidth = width;
		let tapdataWidth = width;
		let apiWidth = width;

		this.sourceLane.setBBox({
			width: sourceWidth,
			height: height,
			x: 10,
			y: 10
		});
		this.tapdataLane.setBBox({
			width: tapdataWidth,
			height: height,
			x: 10 + sourceWidth + 10,
			y: 10
		});

		this.apiLane.setBBox({
			width: apiWidth,
			height: height,
			x: 10 + sourceWidth + 10 + tapdataWidth + 10,
			y: 10
		});
	}

	loadExampleData(){
		let x = 20;
		let y = 100;

		let _joint = joint;
		let self = this;

		["dataMap.Database", "dataMap.Classification", "dataMap.Tapdata", "dataMap.API"].forEach( cellType => {
			let CellConstructor = _.get(_joint.shapes, cellType);
			let cell = new CellConstructor({});

			cell.position(x+=200, y).addTo(self.graph);
		});
	}

}
