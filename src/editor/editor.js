/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './lib/BaseObject';
import UI from './ui/ui';
import Graph from "./ui/graph";
import DataFlows from "../api/DataFlows";
import {loadPlugins} from './plugins';

export default class Editor extends BaseObject {

	constructor(container){
		super();

		this.container = container;

		this.doInit();
	}

	doInit(){
		let self = this;

		// login plugins
		loadPlugins();

		self.ui = new UI(self);
		self.ui.render(self.container);

		self.graph = new Graph({
			ui: self.ui,
			container: self.ui.getContentEl()
		});

		self.ui.on('save', this.doSave.bind(this));
	}

	doSave(data){
		let dataFlows = new DataFlows();
		let graphData = this.graph.getData();

		let postData = Object.assign({
			name: "oracle-mongodb-db-clone",
			description: "",
			status: "scheduled",
			executeMode: "normal",
			category: "数据库克隆",
			stopOnError: false,
			mappingTemplate: "cluster-clone",
			emailWaring: {edited: true, started: false, error: true, paused: false},
			stages: [/*{
				id: "database-oracle",
				type: "database",
				syncType: "initial_sync+cdc",
				readCdcInterval: 500,
				readBatchSize: 25000,
				connectionId: "5d78edca36923953ff2f68c9",
				inputLanes: [],
				ouputLanes: ["database-mongodb"]
			}, {
				id: "database-mongodb",
				type: "database",
				dataQualityTag: false,
				dropTable: false,
				connectionId: "5ddde24de601f925314bf7ed",
				inputLanes: ["database-oracle"],
				ouputLanes: []
			}*/]
		}, data, {
			editorData: JSON.stringify(graphData)
		});

		let stages = {};
		graphData.cells.forEach(cell => {
			if( ['app.SourceDB', 'app.TargetDB'].indexOf(cell.type) !== -1){
				stages[cell.id] = Object.assign({
					id: cell.id,
					type: "database",
					syncType: "initial_sync+cdc",
					readCdcInterval: 500,
					readBatchSize: 25000,
					// connectionId: "5d78edca36923953ff2f68c9",
					inputLanes: [],
					ouputLanes: []
				}, cell.custom_data || {});
			}
		});

		graphData.cells.forEach(cell => {
			if( 'app.Link' === cell.type){
				let sourceId = cell.source.id;
				let targetId = cell.target.id;

				stages[sourceId].ouputLanes.push(targetId);
				stages[targetId].ouputLanes.push(sourceId);
			}
		});

		postData.stages = Object.values(stages);
		dataFlows.post(postData).then((result) => {
			//console.log(result);
		}).catch(e => {
			throw new Error(e);
		});

	}


}
