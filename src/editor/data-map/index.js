import BaseObject from "../lib/BaseObject";
import UI from "./ui/ui";
import Graph from "./ui/graph";
import Sidebar from "../ui/sidebar";

/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/15/20
 * @description
 */
export default class DataMap extends BaseObject {
	constructor(props) {
		super(props);

		this.container = props.container;

		this.doInit(props);
	}

	doInit(props) {
		this.ui = new UI();
		this.ui.render(this.container);

		let leftSidebar = (this.leftSidebar = new Sidebar({
			container: this.ui.getBody(),
			prepend: true,
			region: "left",
			editor: this,
			split: true,
			width: 280,
			maxWidth: 600,
			// bodyStyle: "display: flex; flex-direction: column;"
		}));
		this.ui.add(leftSidebar);

		if(props && props.leftSidebar){
			leftSidebar.getContentEl().append(props.leftSidebar);
		}

		this.graph = new Graph({
			dataMap: this,
			container: this.ui.getGraphContainer()
		});
	}

	getUI() {
		return this.ui;
	}
}
