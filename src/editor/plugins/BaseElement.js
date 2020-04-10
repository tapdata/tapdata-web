/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import log from "../../log";
import {FORM_DATA_KEY, SCHEMA_DATA_KEY, OUTPUT_SCHEMA_DATA_KEY, JOIN_TABLE_TPL} from "../constants";
import {mergeJoinTablesToTargetSchema} from "../util/Schema";
import _ from 'lodash';

export const baseElementConfig = {

	/**
	 * the name of the subtype class.
	 *
	 */
	type: 'app.BaseElement',

	/**
	 * define shape
	 * docs see https://github.com/clientIO/joint/blob/master/tutorials/custom-elements.html
	 * @type {object}
	 */
	shape: {
		/**
		 * extends exists shape
		 */
		extends: 'standard.EmbeddedImage',

		/**
		 * object that contains properties to be assigned to every constructed instance of the subtype.
		 *
		 * @example <pre>
		 *     {
		 *        attrs: {
		 *           body: {
		 *              refWidth: '100%',
		 *              refHeight: '100%',
		 *              strokeWidth: 2,
		 *              stroke: '#000000',
		 *              fill: '#FFFFFF'
		 *           },
		 *           label: {
		 *              textVerticalAnchor: 'middle',
		 *              textAnchor: 'middle',
		 *              refX: '50%',
		 *              refY: '50%',
		 *              fontSize: 14,
		 *              fill: '#333333'
		 *           }
		 *        }
		 *     }
		 * </pre>
		 */
		defaultInstanceProperties: {
			freeTransform: false,
			size: { width: 160, height: 36 },
			attrs: {
				image: {
					//xlinkHref: 'static/editor/table.svg',
					refWidth: '19%',
					refHeight: '82%',
					refX: '-4%',
					refY: '-19%'
				},
				body: {
					fill: '#fafafa',
					stroke: '#dedee4',
					strokeWidth: 1,
					rx:20,
					ry:20,
					refWidth: '100%',
					refHeight: '100%',
				},
				label: {
					textVerticalAnchor: 'middle',
					textAnchor: 'left',
					refX: '10%',
					refY: '50%',
					fontSize: 11,
					fill: '#333333',
					x:0,
					y:0,
				}
			},

			[SCHEMA_DATA_KEY]: null,
			[OUTPUT_SCHEMA_DATA_KEY]: null
		},
		/**
		 * object that contains properties to be assigned on the subtype prototype.
		 * Intended for properties intrinsic to the subtype, not usually modified.
		 *
		 * @example <pre>
		 *
		 * {
		 *     markup: [{
		 *          tagName: 'rect',
		 *          selector: 'body',
		 *     }, {
		 *          tagName: 'text',
		 *          selector: 'label'
		 *     }]
		 * }
		 *
		 * </pre>
		 */
		prototypeProperties: {
			portLabelMarkup: [{
				tagName: 'text',
				selector: 'portLabel'
			}],
			initialize(){
				let self = this;

				// validate form data
				self.on('change:' + FORM_DATA_KEY, () => {
					let formData = self.getFormData();

					log(`${this.get('type')} validate form data`, formData);
					let verified = false;
					try {
						verified = self.validate(self.getFormData());
					} catch (e) {
						verified = false;
					}

					log(`${this.get('type')} validate form data`, formData, verified);

					self.attr('body/stroke', verified ? '#2196F3' : '#ff0000');
					if( formData && formData.name )
						self.attr('label/text', formData.name);
				});
			},
			getFormData() {
				return this.get(FORM_DATA_KEY);
			},
			isDataNode(){
				return false;
			},
			isProcess(){
				return false;
			},
			showSettings() {
				return true;
			},
			setSchema(schema){
				this.set(SCHEMA_DATA_KEY, schema);
				this.updateOutputSchema();
			},
			getSchema(){
				return _.cloneDeep(this.get(SCHEMA_DATA_KEY));
			},
			getOutputSchema(){
				return _.cloneDeep(this.get(OUTPUT_SCHEMA_DATA_KEY));
			},
			getInputSchema(){

				let self = this;
				let graph = self.graph;

				let joinTables = graph.getConnectedLinks(self, {inbound: true})
						.map( cell => {
							let sourceCell = cell.getSourceCell();

							if( sourceCell ) {
								let formData = cell.getFormData();
								let joinTable = formData ? formData.joinTable : null;
								let schema = sourceCell.getOutputSchema();

								joinTable = joinTable ? _.cloneDeep(joinTable) : _.cloneDeep(JOIN_TABLE_TPL);

								if( schema ) {
									let fields = schema.fields || [];
									joinTable.primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name).join(',');
									joinTable.tableName = schema && schema.table_name;
									if( ['merge_embed', 'update'].includes(joinTable.joinType)){
										joinTable.joinPath = joinTable.tableName;
									}
									cell.set(FORM_DATA_KEY, {
										joinTable: _.cloneDeep(joinTable)
									});
								}

								joinTable.sourceSchema = sourceCell.getOutputSchema();
								joinTable.stageId = sourceCell.id;

								log('BaseElement.getInputSchema.joinTables', cell.getFormData(), joinTable);
								return joinTable;
							} else {
								return null;
							}
						})
						.filter( v => !!v);

				let result = joinTables.filter( (v) => !!v);
				log(`${this.get('type')}.getInputSchema`, result);
				return result;
			},
			__mergeOutputSchema(){
				let inputSchema = this.getInputSchema() || [];
				let schema= this.getSchema();
				let outputSchema = mergeJoinTablesToTargetSchema(schema, inputSchema);
				log(this.get('type') + '.__mergeOutputSchema[this.schema,inputSchema,outputSchema]', [schema, inputSchema, outputSchema]);
				let _outputSchema;
				try {
					_outputSchema = this.mergeOutputSchema(outputSchema);
				} catch (e) {
					_outputSchema = outputSchema;
					log(this.get('type') + '.mergeOutputSchema.error', e);
				}
				return _outputSchema || outputSchema;
			},
			mergeOutputSchema(outputSchema){
				// children rewrite schema merge logic
				return outputSchema;
			},
			updateOutputSchema(){
				try {
					this.validate();
				} catch (e) {
					log(`${this.get('type')}.updateOutputSchema.validate`, e);
				}
				let mergedOutputSchema = this.__mergeOutputSchema();
				this.set(OUTPUT_SCHEMA_DATA_KEY, mergedOutputSchema);
				log(`${this.get('type')}.updateOutputSchema`, mergedOutputSchema);

				let graph = this.graph;
				graph.getConnectedLinks(this, {outbound: true}).forEach(( link => {
					let targetCell = link.getTargetCell();
					if( targetCell && typeof targetCell.updateOutputSchema === 'function'){
						setTimeout(()=>targetCell.updateOutputSchema(), 0);
					}
				}));
			},
			validate(){
				return true;
			},

			/**
			 * validate this allow connect to target
			 * @param targetCell
			 * @return {boolean}
			 */
			allowTarget(targetCell) {
				return false;
			},

			/**
			 * validate accept source connection
			 * @param sourceCell
			 * @return {boolean}
			 */
			allowSource(sourceCell) {
				return false;
			}
		},

		//staticProperties: {}
	},

};
