/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './lib/BaseObject';
import UI from './ui/ui';
import Graph from "./ui/graph";
import {loadPlugins} from './plugins';

export default class Editor extends BaseObject {

	/**
	 * user interface
	 * @type {UI}
	 */
	ui = null;

	/**
	 * graph ui
	 * @type {Graph}
	 */
	graph = null;

	constructor(opts){
		super();

		this.container = opts.container;
		this.opts = opts;

		this.doInit();
	}

	doInit(){
		let self = this;

		// login plugins
		loadPlugins();

		self.ui = new UI(Object.assign({editor: self}, this.opts));
		self.ui.render(self.container);

		self.graph = new Graph({
			ui: self.ui,
			container: self.ui.getContentEl()
		});

	}

	getData(){

		return {
			name: this.ui.getName(),
			graphData: this.graph.getData(),
			graphLib: this.graph.getGraphLib()
		};

	}


}
