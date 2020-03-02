/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './lib/BaseObject';
import UI from './ui';
import Graph from "./graph";

export default class Editor extends BaseObject {

	constructor(container){
		super();

		this.container = container;

		this.doInit();
	}

	doInit(){
		this.ui = new UI(this);
		this.ui.render(this.container);

		this.graph = new Graph({
			ui: this.ui,
			container: this.ui.getContentEl()
		});
	}
}
