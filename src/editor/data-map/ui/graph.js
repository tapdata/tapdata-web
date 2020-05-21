/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/18/20
 * @description
 */
import joint from '../../lib/rappid/rappid';
import Component from '../../lib/Component';
import $ from 'jquery';

export default class Graph extends Component {

	constructor(props){
		super(props);

		this.dataMap = props.dataMap;
		this.container = props.container;

		this.init();
	}

	doInit() {
		super.doInit();

		this.initGraph();
	}

	initGraph(){

		const graph = this.graph = new joint.dia.Graph;
		const parent = $(this.container).parent();
		const width = parent.width();
		const height = parent.height();

		this.paper = new joint.dia.Paper({
			model: graph,
			width: width,
			height: height,
			el: this.container
		});

	}
}
