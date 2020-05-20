/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import log from "../../log";
import {
	FORM_DATA_KEY,
	SCHEMA_DATA_KEY,
	OUTPUT_SCHEMA_DATA_KEY,
	JOIN_TABLE_TPL
} from "../constants";
import { mergeJoinTablesToTargetSchema } from "../util/Schema";
import _ from "lodash";
import joint from "../lib/rappid/rappid";

export const baseElementConfig = {
	/**
	 * the name of the subtype class.
	 *
	 */
	type: "app.BaseElement",

	/**
	 * define shape
	 * docs see https://github.com/clientIO/joint/blob/master/tutorials/custom-elements.html
	 * @type {object}
	 */
	shape: {
		/**
		 * extends exists shape
		 */
		extends: "standard.EmbeddedImage",

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
					refWidth: "19%",
					refHeight: "82%",
					refX: "-4%",
					refY: "-19%"
				},
				body: {
					fill: "#fafafa",
					stroke: "#dedee4",
					strokeWidth: 1,
					rx: 20,
					ry: 20,
					refWidth: "100%",
					refHeight: "100%"
				},
				label: {
					textVerticalAnchor: "middle",
					textAnchor: "left",
					refX: "10%",
					refY: "50%",
					fontSize: 11,
					fill: "#333333",
					x: 0,
					y: 0
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
					tagName: "text",
					selector: "portLabel"
				}
			],
			initialize() {
				let self = this;

				// validate form data
				self.on("change:" + FORM_DATA_KEY, () => {
					let formData = self.getFormData();

					log(`${this.get("type")} validate form data`, formData);
					let verified = false;
					try {
						verified = self.validate(self.getFormData());
					} catch (e) {
						verified = false;
					}

					log(`${this.get("type")} validate form data`, formData, verified);

					self.attr("body/stroke", verified ? "#2196F3" : "#ff0000");
					if (formData && formData.name) {
						let name = formData.name;
						let isDataNode =
							typeof self.isDataNode === "function" ? self.isDataNode() : false;
						let isProcess =
							typeof self.isProcess === "function" ? self.isProcess() : false;
						let width = isDataNode ? 125 : isProcess ? 95 : false;
						if (width) {
							name = self.breakText(name, width);
							log(`${this.get("type")} break text`, formData.name, name);
						}
						self.attr("label/text", name);
					}
				});
			},
			breakText(text, width) {
				let str = joint.util.breakText(
					text,
					{ width: width, height: 20 },
					{ "font-size": 12 },
					{ hyphen: "^$", ellipsis: true }
				);
				if (str === text) {
					return str;
				} else {
					let before = joint.util.breakText(
						text,
						{ width: width / 2, height: 20 },
						{ "font-size": 12 },
						{ hyphen: "^$" }
					);
					let after = text
						.substr(before.length)
						.split("")
						.reverse()
						.join("");
					after = joint.util.breakText(
						after,
						{ width: width / 2, height: 20 },
						{ "font-size": 12 },
						{ hyphen: "^$" }
					);
					after = after
						.split("")
						.reverse()
						.join("");
					return before + "..." + after;
				}
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
						let targetCell = cell.getTargetCell();

						if (sourceCell) {
							let formData = cell.getFormData() || {};
							let joinTable = formData ? formData.joinTable : null;
							let schema = sourceCell.getOutputSchema();

							joinTable = joinTable
								? _.cloneDeep(joinTable)
								: _.cloneDeep(JOIN_TABLE_TPL);

							if (schema) {
								let fields = schema.fields || [];
								joinTable.primaryKeys = fields
									.filter(f => f.primary_key_position > 0)
									.map(f => f.field_name)
									.join(",");
								joinTable.tableName = schema && schema.table_name;
								/* if( !joinTable.joinPath && ['merge_embed', 'update'].includes(joinTable.joinType)){
										joinTable.joinPath = joinTable.tableName;
									} */
								formData.joinTable = _.cloneDeep(joinTable);
								cell.set(FORM_DATA_KEY, formData);
							}

							joinTable.sourceSchema = schema;
							let parentDataNodes =
								typeof targetCell.getFirstDataNode === "function"
									? targetCell.getFirstDataNode()
									: [];
							joinTable.stageId =
								parentDataNodes.length > 0 ? parentDataNodes[0].id : "";

							log(
								"BaseElement.getInputSchema.joinTables",
								cell.getFormData(),
								joinTable
							);
							return joinTable;
						} else {
							return null;
						}
					})
					.filter(v => !!v);

				let result = joinTables.filter(v => !!v);
				log(`${this.get("type")}.getInputSchema`, result);
				return result;
			},
			__mergeOutputSchema() {
				let inputSchema = this.getInputSchema() || [];
				let schema = this.getSchema() || {
					meta_type: this.get("type") === "app.Collection" ? "collection" : "table"
				};
				let outputSchema = mergeJoinTablesToTargetSchema(schema, inputSchema);
				log(
					this.get("type") + ".__mergeOutputSchema[this.schema,inputSchema,outputSchema]",
					[schema, inputSchema, outputSchema]
				);
				let _outputSchema;
				try {
					_outputSchema = this.mergeOutputSchema(outputSchema);
				} catch (e) {
					_outputSchema = outputSchema;
					log(this.get("type") + ".mergeOutputSchema.error", e);
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
					log(`${this.get("type")}.updateOutputSchema.validate`, e);
				}
				let mergedOutputSchema = this.__mergeOutputSchema();
				this.set(OUTPUT_SCHEMA_DATA_KEY, mergedOutputSchema);
				log(`${this.get("type")}.updateOutputSchema`, mergedOutputSchema);

				let graph = this.graph;
				graph.getConnectedLinks(this, { outbound: true }).forEach(link => {
					let targetCell = link.getTargetCell();
					if (targetCell && typeof targetCell.updateOutputSchema === "function") {
						setTimeout(() => targetCell.updateOutputSchema(), 0);
					}
				});
			},

			getFirstDataNode() {
				if (typeof this.isDataNode === "function" && this.isDataNode()) return [this];
				let graph = this.graph;
				let inboundLinks = graph.getConnectedLinks(this, {
					inbound: true
				});
				let parentDataNodes = [];
				for (let i = 0; i < inboundLinks.length; i++) {
					let link = inboundLinks[i];
					let sourceCell = link.getSourceCell();
					if (sourceCell) {
						if (
							typeof sourceCell.isDataNode === "function" &&
							sourceCell.isDataNode()
						) {
							parentDataNodes.push(sourceCell);
						} else if (
							typeof sourceCell.isProcess === "function" &&
							sourceCell.isProcess()
						) {
							parentDataNodes.push(...sourceCell.getFirstDataNode());
						}
					}
				}
				log(`${this.get("type")}.getParentDataNode`, parentDataNodes);
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
		}

		// staticProperties: {}
	}
};
