import BaseObject from "../lib/BaseObject";
import UI from "./ui/ui";
import Graph from "./ui/graph";

/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/15/20
 * @description
 */
export default class DataMap extends BaseObject {
	constructor(props) {
		super(props);

		this.container = props.container;

		this.doInit();
	}

	doInit() {
		this.ui = new UI();

		this.ui.render(this.container);

		this.graph = new Graph({
			dataMap: this,
			container: this.ui.getGraphContainer()
		});
	}

	getUI() {
		return this.ui;
	}
}
