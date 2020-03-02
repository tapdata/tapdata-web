/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/1/20
 * @description
 */
import Component from "./lib/Component";
import $ from 'jquery';

export default class Panel extends Component {

	constructor(opts){
		super(opts);

		this.init();
	}

	doInit() {
		this.el = $(`<div class="e-panel"></div>`);
	}

	getContentEl() {
		return this.el;
	}

}
