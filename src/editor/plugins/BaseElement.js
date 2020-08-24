/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import log from '../../log';
import { FORM_DATA_KEY, SCHEMA_DATA_KEY, OUTPUT_SCHEMA_DATA_KEY, JOIN_TABLE_TPL } from '../constants';
import { mergeJoinTablesToTargetSchema } from '../util/Schema';
import _ from 'lodash';
// import joint from '../lib/rappid/rappid';
import breakText from '../breakText';

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
					// xlinkHref: 'static/editor/table.svg',
					refWidth: '19%',
					refHeight: '82%',
					refX: '-4%',
					refY: '-19%'
				},
				body: {
					fill: '#fafafa',
					stroke: '#dedee4',
					strokeWidth: 1,
					rx: 20,
					ry: 20,
					refWidth: '100%',
					refHeight: '100%'
				},
				label: {
					textVerticalAnchor: 'middle',
					textAnchor: 'left',
					refX: '10%',
					refY: '50%',
					fontSize: 11,
					fill: '#333333',
					x: 0,
					y: 0
				}
			},
			ports: {
				groups: {
					greens: {
						attrs: {
							circle: {
								fill: '#f56c6c',
								stroke: 'red',
								strokeWidth: 1,
								r: 6
							}
						},
						position: 'absolute'
					}
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
			portLabelMarkup: [
				{
					tagName: 'text',
					selector: 'portLabel'
				}
			],
			initialize() {
				let self = this;

				let validate = function() {
					let formData = self.getFormData();

					// log(`${this.get("type")} validate form data`, formData);
					let verified = false;
					try {
						verified = self.validate(self.getFormData());
					} catch (e) {
						verified = false;
					}

					if (formData && !formData.disabled) self.attr('body/stroke', verified ? '#2196F3' : '#ff0000');
					if (formData && formData.name) {
						let name = formData.name;
						let isDataNode = typeof self.isDataNode === 'function' ? self.isDataNode() : false;
						let isProcess = typeof self.isProcess === 'function' ? self.isProcess() : false;
						let width = isDataNode ? 120 : isProcess ? 90 : false;
						if (width) {
							name = breakText.breakText(name, width);
							// log(`${this.get("type")} break text`, formData.name, name,width);
						}
						self.attr('label/text', name);
					}
				};

				// validate form data
				self.on('change:' + FORM_DATA_KEY, () => {
					validate();
				});
				validate();
			},

			getFormData() {
				return this.get(FORM_DATA_KEY);
			},

			setFormData(data) {
				this.set(FORM_DATA_KEY, data);
			},
			isDataNode() {
				return false;
			},
			isProcess() {
				return false;
			},
			showSettings() {
				return true;
			},

			setSchema(schema, updateSchema) {
				this.set(SCHEMA_DATA_KEY, schema);

				if (updateSchema !== false) this.updateOutputSchema();
			},
			getSchema() {
				return _.cloneDeep(this.get(SCHEMA_DATA_KEY));
			},
			getOutputSchema() {
				return _.cloneDeep(this.get(OUTPUT_SCHEMA_DATA_KEY));
			},
			getInputSchema() {
				let self = this;
				let graph = self.graph;

				let joinTables = graph
					.getConnectedLinks(self, { inbound: true })
					.map(cell => {
						let sourceCell = cell.getSourceCell();
						// let targetCell = cell.getTargetCell();

						if (sourceCell) {
							let formData = cell.getFormData() || {};
							let joinTable = formData ? formData.joinTable : null;
							let schema = sourceCell.getOutputSchema();

							joinTable = joinTable ? _.cloneDeep(joinTable) : _.cloneDeep(JOIN_TABLE_TPL);

							if (schema) {
								// let fields = schema.fields || [];
								// joinTable.primaryKeys = fields
								// 	.filter(f => f.primary_key_position > 0)
								// 	.map(f => f.field_name)
								// 	.join(',');
								joinTable.tableName = schema && schema.table_name;
								/* if( !joinTable.joinPath && ['merge_embed', 'update'].includes(joinTable.joinType)){
										joinTable.joinPath = joinTable.tableName;
									} */
							}
							let parentDataNodes =
								typeof sourceCell.getFirstDataNode === 'function' ? sourceCell.getFirstDataNode() : [];
							joinTable.stageId = parentDataNodes.length > 0 ? parentDataNodes[0].id : '';

							formData.joinTable = _.cloneDeep(joinTable);
							cell.set(FORM_DATA_KEY, formData);

							joinTable.sourceSchema = schema;

							log('BaseElement.getInputSchema.joinTables', cell.getFormData(), joinTable);
							return joinTable;
						} else {
							return null;
						}
					})
					.filter(v => !!v);

				let result = joinTables.filter(v => !!v);
				log(`${this.get('type')}.getInputSchema`, result);
				return result;
			},
			__mergeOutputSchema() {
				let inputSchema = this.getInputSchema() || [];
				let schema = this.getSchema() || {
					meta_type: this.get('type') === 'app.Collection' ? 'collection' : 'table'
				};
				let outputSchema = mergeJoinTablesToTargetSchema(schema, inputSchema);
				log(this.get('type') + '.__mergeOutputSchema[this.schema,inputSchema,outputSchema]', [
					schema,
					inputSchema,
					outputSchema
				]);
				let _outputSchema;
				try {
					_outputSchema = this.mergeOutputSchema(outputSchema);
				} catch (e) {
					_outputSchema = outputSchema;
					log(this.get('type') + '.mergeOutputSchema.error', e);
				}
				return _outputSchema || outputSchema;
			},
			mergeOutputSchema(outputSchema) {
				// children rewrite schema merge logic
				return outputSchema;
			},
			updateOutputSchema() {
				try {
					this.validate();
				} catch (e) {
					log(`${this.get('type')}.updateOutputSchema.validate`, e);
				}
				let mergedOutputSchema = this.__mergeOutputSchema();
				this.set(OUTPUT_SCHEMA_DATA_KEY, mergedOutputSchema);
				log(`${this.get('type')}.updateOutputSchema`, mergedOutputSchema);

				let graph = this.graph;
				graph.getConnectedLinks(this, { outbound: true }).forEach(link => {
					let targetCell = link.getTargetCell();
					if (targetCell && typeof targetCell.updateOutputSchema === 'function') {
						setTimeout(() => targetCell.updateOutputSchema(), 0);
					}
				});
			},

			getFirstDataNode() {
				if (typeof this.isDataNode === 'function' && this.isDataNode()) return [this];
				let graph = this.graph;
				let inboundLinks = graph.getConnectedLinks(this, { inbound: true });
				let parentDataNodes = [];
				for (let i = 0; i < inboundLinks.length; i++) {
					let link = inboundLinks[i];
					let sourceCell = link.getSourceCell();
					if (sourceCell) {
						if (typeof sourceCell.isDataNode === 'function' && sourceCell.isDataNode()) {
							parentDataNodes.push(sourceCell);
						} else if (typeof sourceCell.isProcess === 'function' && sourceCell.isProcess()) {
							parentDataNodes.push(...sourceCell.getFirstDataNode());
						}
					}
				}
				log(`${this.get('type')}.getParentDataNode`, parentDataNodes);
				return parentDataNodes;
			},

			validate() {
				return true;
			},

			/**
			 * validate this allow connect to target
			 * @param targetCell
			 * @return {boolean}
			 */
			allowTarget() {
				return false;
			},

			/**
			 * validate accept source connection
			 * @param sourceCell
			 * @return {boolean}
			 */
			allowSource() {
				return false;
			},
			setDisabled(cell, checked) {
				let onewayIn = false,
					onewayOut = false,
					self = this;
				self.graph.startBatch('disable');
				if (self.graph.getConnectedLinks(cell, { inbound: true }).length == 0) onewayIn = true;
				if (self.graph.getConnectedLinks(cell, { outbound: true }).length == 0) onewayOut = true;
				self.graph.getConnectedLinks(cell, { inbound: true }).forEach(link => {
					if (!link.attributes.form_data.disabled) onewayIn = true;
				});
				self.graph.getConnectedLinks(cell, { outbound: true }).forEach(link => {
					if (!link.attributes.form_data.disabled) onewayOut = true;
				});
				if (!(onewayIn && onewayOut) || checked) {
					cell.attributes.form_data.disabled = true;
					if (checked) cell.attributes.form_data.disablChecker = true;
					cell.attr('body/fill', '#f1f1f1');
					cell.attr('body/stroke', 'grey');
					cell.attr('label/fill', '#ccc');
					self.graph.getConnectedLinks(cell, { inbound: true }).forEach(link => {
						if (!!link.attributes.form_data.disabled && !checked) return;
						link.attributes.form_data.disabled = true;
						link.attr('line/stroke', '#dedede');
						link.toBack();
						self.setDisabled(link.getSourceCell());
					});
					self.graph.getConnectedLinks(cell, { outbound: true }).forEach(link => {
						if (!!link.attributes.form_data.disabled && !checked) return;
						link.attributes.form_data.disabled = true;
						link.attr('line/stroke', '#dedede');
						link.toBack();
						if (!link.getTargetCell().isDataNode()) self.setDisabled(link.getTargetCell());
					});
				}
				if (checked) {
					cell.attr('body/fill', '#f1f1f1');
					cell.attr('body/stroke', 'silver');
					cell.attr('label/fill', '#ccc');
					cell.addPort({
						id: 'dis',
						group: 'greens',
						args: {
							x: '97%',
							y: '20%'
						}
					});
				}
				self.graph.stopBatch('disable');
			},
			setEnabled(cell) {
				let self = this;
				self.graph.startBatch('enble');
				cell.attributes.form_data.disabled = false;
				cell.attributes.form_data.disablChecker = false;
				cell.attr('body/fill', '#fafafa');
				cell.attr('body/stroke', '#2196F3');
				cell.attr('label/fill', '#333333');
				cell.removePort('dis');
				let cells = [];
				self.graph.search(cell, cel => {
					if (cel.cid) cells.push(cel);
				});
				cells.forEach(cell => {
					cell.attributes.form_data.disabled = false;
					cell.attr('body/fill', '#fafafa');
					cell.attr('body/stroke', '#2196F3');
					cell.attr('label/fill', '#333333');
					cell.removePort('dis');
					self.graph.getConnectedLinks(cell).forEach(link => {
						link.attr('line/stroke', '#8f8f8f');
						link.toFront();
						link.attributes.form_data.disabled = false;
					});
				});
				self.graph.stopBatch('enble');
				cells.forEach(cell => {
					if (cell.attributes.form_data.disablChecker) {
						self.graph.getConnectedLinks(cell).forEach(link => {
							link.attr('line/stroke', '#dedede');
							link.toBack();
							link.attributes.form_data.disabled = true;
						});
						self.graph.startBatch('enble');
						self.setDisabled(cell, true);
						self.graph.stopBatch('enble');
					}
				});
			}
		}

		// staticProperties: {}
	}
};
