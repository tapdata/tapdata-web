/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/15/20
 * @description
 */
import Component from "../../lib/Component";
import $ from "jquery";

export default class UI extends Component {
	constructor(props) {
		super(props);

		this.init();
	}

	doInit() {
		super.doInit();

		this.el = $(`<div class="layout">
			<div class="graph-container"></div>
		</div>`);
	}

	getGraphContainer() {
		return this.el.find(".graph-container");
	}
}
