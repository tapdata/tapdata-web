/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/17/20
 * @description
 */
import BaseObject from "./lib/BaseObject";
import log from "../log";

export default class ModelEngine extends BaseObject{
	constructor(graph) {
		super();

		this.graph = graph;

		this.init();
	}

	init(){
		let self = this;
		this.graph.on('add', function(){
			self.addCell(...arguments);
		});
		/*this.graph.on('change', function(){
			self.changeCell(...arguments);
		});*/
		this.graph.on('remove', function(){
			self.removeCell(self, ...arguments);
		});
	}

	/**
	 * on add new cell into graph
	 * @param cell
	 */
	addCell(cell){
		log.log("ModelEngine.addCell", arguments);
		cell.on('change', function(){
			log.log("ModelEngine.cell.change", arguments);
		});
	}

	/**
	 * on cell change in graph, like cell move,resize any wait
	 * @param cell
	 */
	changeCell(cell){
		log.log("ModelEngine.changeCell", arguments);
	}

	/**
	 *
	 * @param cell
	 */
	removeCell(cell){
		log.log("ModelEngine.removeCell", arguments);
	}
}
