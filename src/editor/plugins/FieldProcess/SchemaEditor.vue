<template>
	<div class="e-schema-editor" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom">
		<el-container>
			<el-header height="20">
				<!--{{schema ? schema.name : ''}}-->
			</el-header>
			<div class="header-row">
				<div class="e-col">
					{{ $t("editor.cell.processor.field.form.fieldName") }}
				</div>
				<div class="e-col">
					{{ $t("editor.cell.processor.field.form.fieldType") }}
				</div>
				<div class="e-col">{{ $t("message.operator") }}</div>
			</div>
			<el-main>
				<el-tree
					:data="schema ? schema.fields : []"
					:node-key="nodeKey"
					default-expand-all
					:expand-on-click-node="false"
					@node-drag-start="handleDragStart"
					@node-drag-enter="handleDragEnter"
					@node-drag-leave="handleDragLeave"
					@node-drag-over="handleDragOver"
					@node-drag-end="handleDragEnd"
					@node-drop="handleDrop"
					:draggable="editable"
					:allow-drop="allowDrop"
					:allow-drag="allowDrag"
					icon-class="icon-none"
					@node-expand="handlerNodeExpand"
					@node-collapse="handlerNodeCollapse"
					ref="tree"
				>
					<span class="custom-tree-node" slot-scope="{ node, data }">
						<span class="e-triangle" :style="`border-bottom-color: ${data.color || '#ddd'};`"></span>

						<span class="e-port e-port-in" :data-id="getId(data)"></span>

						<!--<span class="e-label" v-if="originalSchema.type ==='collection' && data.primary_key_position > 0 ">-->
						<!--<span class="e-pk">{{ data.primary_key_position > 0 ? 'PK' : '' }}</span>-->
						<!--<el-input v-model="data.label" :disabled="true"></el-input>-->
						<!--</span>-->

						<!--<span class="e-label" v-else :class="{ activename: isRename(data.id) }" >-->
						<span
							class="e-label"
							:class="{
								activename: isRename(data.id) || isCreate(data.id)
							}"
						>
							<el-input
								v-model="data.label"
								@blur="handleRename(node, data)"
								@change="handleRename(node, data)"
								:disabled="isRemove(data.id)"
							></el-input>
						</span>

						<!--<el-select v-model="data.type" v-if="originalSchema.type ==='collection' && data.primary_key_position > 0 " class="e-select"  :disabled="true" >-->
						<!--<el-option value="String" label="String"></el-option>-->
						<!--</el-select>-->

						<!--<el-select v-model="data.type" v-else  class="e-select" :class="{ activedatatype: isConvertDataType(data.id) }" :disabled="isRemove(data.id)" @change="handleDataType(node,data)">-->
						<el-select
							v-model="data.type"
							class="e-select"
							:class="{
								activedatatype: isConvertDataType(data.id)
							}"
							:disabled="isRemove(data.id)"
							@change="handleDataType(node, data)"
						>
							<el-option
								value="String"
								label="String"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="Integer"
								label="Integer"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="Double"
								label="Double"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="Float"
								label="Float"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="BigDecimal"
								label="BigDecimal"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="Long"
								label="Long"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>
							<el-option
								value="Short"
								label="Short"
								v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
							></el-option>

							<el-option value="Map" label="Map" v-if="isCreate(data.id)"></el-option>
							<el-option value="Array" label="Array" v-if="isCreate(data.id)"></el-option>
						</el-select>

						<el-button
							type="text"
							v-if="isRemove(data.id)"
							class=" e-field-action el-icon-plus"
							disabled
						></el-button>
						<el-dropdown
							v-else
							size="mini"
							:show-timeout="10"
							:hide-on-click="false"
							@command="command => handleCreate(command, node, data)"
						>
							<span
								class="e-field-action el-icon-plus"
								@click="handleCreate('create_sibling', node, data)"
							></span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item command="create_sibling" icon="iconfont icon-create_sibling_node">{{
									$t("editor.cell.processor.field.form.addField")
								}}</el-dropdown-item>
								<el-dropdown-item
									command="create_child"
									icon="iconfont icon-create_child_node"
									v-if="['Map', 'Array'].includes(data.type)"
									>{{ $t("editor.cell.processor.field.form.addEmbedField") }}</el-dropdown-item
								>
							</el-dropdown-menu>
						</el-dropdown>

						<el-button
							type="text"
							v-if="isRemove(data.id) || ['Array', 'Map'].includes(data.type)"
							class=" e-field-action iconfont icon-script"
							disabled
						></el-button>
						<span
							v-else
							class="e-field-action iconfont icon-script"
							:style="isScript(data.id) ? 'color: #71c179;' : ''"
							@click="handleScript(node, data)"
						></span>

						<el-button
							type="text"
							v-if="originalSchema.type === 'collection' && data.primary_key_position > 0"
							class=" e-field-action iconfont icon-l-del"
							disabled
						></el-button>
						<span
							v-else
							class="e-field-action iconfont icon-l-del"
							@click="handleDelete(node, data)"
						></span>

						<el-button
							type="text"
							v-if="originalSchema.type === 'collection' && data.primary_key_position > 0"
							class=" e-field-action iconfont icon-return"
							disabled
						></el-button>
						<span
							v-else
							class="e-field-action iconfont icon-return"
							@click="handleReset(node, data)"
						></span>

						<span class="e-port e-port-out" :data-id="getId(data)"></span>
					</span>
				</el-tree>
			</el-main>
		</el-container>

		<el-dialog
			:title="
				$t('editor.cell.processor.field.form.scriptDialogTitle') +
					' (' +
					scriptDialog.tableName +
					'[ ' +
					scriptDialog.fieldName +
					' ])'
			"
			:visible.sync="scriptDialog.open"
			append-to-body
		>
			<el-form>
				<el-form-item>
					<JsEditor :code.sync="scriptDialog.script" :width.sync="jsEditorWidth"></JsEditor>
					<!--					<el-input type="textarea" v-model="scriptDialog.script" rows="10"></el-input>-->
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="scriptDialog.open = false" size="mini">{{ $t("message.cancel") }}</el-button>
				<el-button @click="scriptDialog.fn" type="primary" size="mini">{{ $t("message.confirm") }}</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import $ from "jquery";
import log from "../../../log";
import _ from "lodash";
import { uuid } from "../../util/Schema";
import JsEditor from "../../../components/JsEditor";

const REMOVE_OPS_TPL = {
	id: "",
	op: "REMOVE",
	field: ""
};
const RENAME_OPS_TPL = {
	id: "",
	op: "RENAME",
	field: "",
	operand: ""
};
const CONVERT_OPS_TPL = {
	id: "",
	op: "CONVERT",
	field: "",
	operand: "",
	originalDataType: ""
};
const CREATE_OPS_TPL = {
	op: "CREATE",
	field: "",
	tableName: "",
	javaType: "String",
	id: "",

	action: "",
	triggerFieldId: ""
};
const SCRIPT_TPL = {
	tableName: "",
	field: "",
	scriptType: "js",
	script: "",
	id: ""
};

export default {
	name: "SchemaEditor",
	components: { JsEditor },
	props: {
		width: {
			type: Number,
			default: 0
		},
		originalSchema: {
			required: true,
			value: [Object, Array, null, undefined]
		},
		schema: {
			required: true,
			value: [Object, Array, null, undefined]
		},
		nodeKey: {
			type: String,
			default: "id"
		},
		editable: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			scriptDialog: {
				open: false,
				script: "//Enter you code at here",
				fieldName: "",
				fn: function() {}
			},

			model: {
				operations: [],
				scripts: []
			},
			jsEditorWidth:'500'
		};
	},
	methods: {
		setOperations(operations) {
			this.model.operations = operations;
		},
		setScripts(scripts) {
			this.model.scripts = scripts;
		},
		isRemove(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === "REMOVE");
			return ops && ops.length > 0;
		},
		isRename(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === "RENAME");
			return ops && ops.length > 0;
		},
		isConvertDataType(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === "CONVERT");
			return ops && ops.length > 0;
		},
		isScript(id) {
			let scripts = this.model.scripts.filter(v => v.id === id);
			return scripts && scripts.length > 0;
		},
		isCreate(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === "CREATE");
			return ops && ops.length > 0;
		},

		getId(node) {
			return node[this.nodeKey];
		},

		getOutPortByField(node) {
			if (!node) return null;
			let id = this.getId(node);
			return $(this.$refs.entityDom).find(`.e-port-out[data-id=${id}]`)[0];
		},
		getInPortByField(node) {
			if (!node) return null;
			let id = this.getId(node);
			return $(this.$refs.entityDom).find(`.e-port-in[data-id=${id}]`)[0];
		},
		handlerNodeExpand(data, node, ev) {
			this.$emit("expand", data);
		},
		handlerNodeCollapse(data, node, ev) {
			this.$emit("collapse", data);
		},
		handleDragStart(node, ev) {},
		handleDragEnter(draggingNode, dropNode, ev) {},
		handleDragLeave(draggingNode, dropNode, ev) {},
		handleDragOver(draggingNode, dropNode, ev) {},
		handleDragEnd(draggingNode, dropNode, dropType, ev) {},
		handleDrop(draggingNode, dropNode, dropType, ev) {
			this.$emit("drop", draggingNode);
		},
		allowDrop(draggingNode, dropNode, type) {
			return type !== "inner";
		},
		allowDrag(draggingNode) {
			return draggingNode.data.children && draggingNode.data.children.length > 0;
		},
		getNativeData(fields, id) {
			let field = null;
			let fn = function(fields) {
				if (!fields) {
					return;
				}
				for (let i = 0; i < fields.length; i++) {
					let f = fields[i];
					if (f.id === id) {
						field = f;
						break;
					} else if (f.children) {
						fn(f.children);
					}
				}
			};
			fn(fields);
			return field;
		},
		handleDataType(node, data) {
			log("SchemaEditor.handleDataType", node, data);
			let createOps = this.model.operations.filter(v => v.id === data.id && v.op === "CREATE");
			if (createOps && createOps.length > 0) {
				let op = createOps[0];
				op.javaType = data.type;
			} else {
				let nativeData = this.getNativeData(this.originalSchema.fields, data.id);
				let ops = this.model.operations.filter(v => v.id === data.id && v.op === "CONVERT");
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(CONVERT_OPS_TPL), {
						id: data.id,
						field: nativeData.label,
						operand: data.type,
						originalDataType: nativeData.type
					});
					this.model.operations.push(op);
				} else {
					op = ops[0];
				}
				op.id = data.id;
				op.operand = data.type;
			}

			this.$emit("dataChanged", this.model);
		},
		handleRename(node, data) {
			log("SchemaEditor.handleRename", node, data);
			let createOps = this.model.operations.filter(v => v.id === data.id && v.op === "CREATE");
			if (createOps && createOps.length > 0) {
				let op = createOps[0];
				let level = op.level;
				let fieldNames = (op.field || op.field_name).split(".");
				fieldNames[level] = data.label;
				op.field = fieldNames.join(".");
			} else {
				let nativeData = this.getNativeData(this.originalSchema.fields, data.id);
				log(
					"Entity1.handlerRename(node,data,nativeData,operations)",
					node,
					data,
					nativeData,
					this.model.operations
				);
				let ops = this.model.operations.filter(v => v.id === nativeData.id && v.op === "RENAME");
				let op;
				if (data.label === nativeData.label) {
					return;
				}
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(RENAME_OPS_TPL), {
						id: data.id,
						field: nativeData.label,
						operand: data.label
					});
					this.model.operations.push(op);
				} else {
					Object.assign(ops[0], {
						// id: data.id,
						// field: nativeData.label,
						operand: data.label
					});
				}
			}
			this.$emit("dataChanged", this.model);
		},
		handleDelete(node, data) {
			log("SchemaEditor.handleDelete", node, data);
			let createOpsIndex = this.model.operations.findIndex(v => v.id === data.id && v.op === "CREATE");
			if (createOpsIndex >= 0) {
				let fieldName = this.model.operations[createOpsIndex].field_name + ".";
				this.model.operations.splice(createOpsIndex, 1);

				for (let i = 0; i < this.model.operations.length; i++) {
					let op = this.model.operations[i];
					let opFieldName = op.field || op.field_name;
					if (opFieldName.indexOf(fieldName) === 0 && opFieldName.length === fieldName.length) {
						this.model.operations.splice(i, 1);
						i--;
					}
				}
				this.$refs.tree.remove(node);
			} else {
				let originalField = this.getNativeData(this.originalSchema.fields, data.id);
				let self = this;

				let fn = function(field) {
					for (let i = 0; i < self.model.operations.length; i++) {
						// 删除所有的重命名的操作
						let ops = self.model.operations[i];
						if (ops.id === field.id && ops.op === "RENAME") {
							let originalNode = self.getNativeData(self.originalSchema.fields, field.id);
							originalNode.label = field.label;
							self.model.operations.splice(i, 1);
						}
					}
					for (let i = 0; i < self.model.operations.length; i++) {
						// 删除所有的类型改变的操作
						let ops = self.model.operations[i];
						if (ops.id === field.id && ops.op === "CONVERT") {
							let originalNode = self.getNativeData(self.originalSchema.fields, field.id); // 替换原始数据 主要是操作子节点
							originalNode.type = field.type;
							self.model.operations.splice(i, 1);
						}
					}

					let ops = self.model.operations.filter(v => v.op === "REMOVE" && v.id === field.id);

					let op;
					if (ops.length === 0) {
						op = Object.assign(_.cloneDeep(REMOVE_OPS_TPL), {
							id: field.id,
							field: field.label,
							operand: true
						});
						self.model.operations.push(op);
					}

					if (field.children) {
						field.children.forEach(fn);
					}
				};
				if (originalField) fn(originalField);
			}

			this.$emit("dataChanged", this.model);
		},
		handleReset(node, data) {
			log("SchemaEditor.handleReset", node, data);
			let parentId = node.parent.data.id;
			let indexId = this.model.operations.filter(v => v.op === "REMOVE" && v.id === parentId);
			if (parentId && indexId.length !== 0) {
				return;
			}
			let self = this;
			let fn = function(node, data) {
				for (let i = 0, length = node.childNodes.length; i < node.childNodes.length; i++) {
					let childNode = node.childNodes[i];
					fn(childNode, childNode.data);
					if (node.childNodes.length !== length) {
						i--;
					}
				}

				let nativeData = self.getNativeData(self.originalSchema.fields, data.id);
				for (let i = 0; i < self.model.operations.length; i++) {
					if (self.model.operations[i].id === data.id) {
						let ops = self.model.operations[i];
						if (ops.op === "REMOVE") {
							self.model.operations.splice(i, 1);
							i--;
							/* node.childNodes.forEach((childNode) => {
									fn(childNode, childNode.data);
								}); */
							// break;
						}
						if (ops.op === "CREATE") {
							self.model.operations.splice(i, 1);
							i--;
							/* node.childNodes.forEach((childNode) => {
									fn(childNode, childNode.data);
								}); */
							self.$refs.tree.remove(node);
							// break;
						}
						if (ops.op === "RENAME") {
							if (nativeData) node.data.label = nativeData.label;
							self.model.operations.splice(i, 1);
							i--;
							// break;
						}
						if (ops.op === "CONVERT") {
							if (nativeData) node.data.type = nativeData.type;
							self.model.operations.splice(i, 1);
							i--;
							// break;
						}
					}
				}
			};
			fn(node, data);
			this.$emit("dataChanged", this.model);
		},

		getParentFieldName(node) {
			let fieldName = node.data && node.data.label ? node.data.label : "";
			if (node.level > 1 && node.parent && node.parent.data) {
				let parentFieldName = this.getParentFieldName(node.parent);
				if (parentFieldName) fieldName = parentFieldName + "." + fieldName;
			}
			return fieldName;
		},

		/**
		 *
		 * @param action create_sibling | create_child
		 * @param node
		 * @param data
		 */
		handleCreate(action, node, data) {
			log("SchemaEditor.handleCreate", action, node, data);

			let parentFieldName = "";
			let level = node.level;
			if (action === "create_sibling") {
				parentFieldName = this.getParentFieldName(node.parent);
			} else if (action === "create_child") {
				parentFieldName = this.getParentFieldName(node);
				level++;
			}

			let fieldId = uuid();
			let newFieldOperation = Object.assign(_.cloneDeep(CREATE_OPS_TPL), {
				field: parentFieldName ? parentFieldName + ".newFieldName" : "newFieldName",
				tableName: data.table_name,
				javaType: "String",
				id: fieldId,

				action: action,
				triggerFieldId: node.data.id,
				level: level - 1
			});
			this.model.operations.push(newFieldOperation);
			this.$emit("dataChanged", this.model);

			let newNodeData = {
				id: fieldId,
				label: "newFieldName",
				type: "String",
				color: data.color,
				primary_key_position: 0,
				table_name: data.table_name
			};
			if (action === "create_sibling") {
				let parentNode = node.parent;
				let parentData = parentNode.data;

				this.$refs.tree.insertAfter(newNodeData, node);
				if (!["Array", "Map"].includes(parentData.type)) parentData.type = "Map";
			} else if (action === "create_child") {
				this.$refs.tree.append(newNodeData, node);
				if (!["Array", "Map"].includes(data.type)) data.type = "Map";
				this.handleDataType(node, data);
			}
		},

		/**
		 *
		 * @param node
		 * @param data
		 */
		handleScript(node, data) {
			let self = this;

			let fieldName = (self.scriptDialog.fieldName = self.getParentFieldName(node));
			let tableName = (self.scriptDialog.tableName = data.table_name);
			let id = data.id;

			let idx = self.model.scripts.findIndex(script => script.id === id);
			let script;
			if (idx !== -1) {
				script = self.model.scripts[idx];
			} else {
				script = _.cloneDeep(SCRIPT_TPL);
				Object.assign(script, {
					field: fieldName,
					tableName,
					id
				});
			}
			self.scriptDialog.script = script.script;
			self.scriptDialog.open = true;
			self.scriptDialog.fn = function() {
				script.script = self.scriptDialog.script;

				if (idx === -1) {
					self.model.scripts.push(script);
				}

				log("SchemaEditor.handleScript", node, data, script, self.model.scripts);

				self.scriptDialog.open = false;
				self.scriptDialog.fn = function() {};
				self.scriptDialog.script = "";
				self.$emit("dataChanged", self.model);
			};
		}
	}
};
</script>

<style lang="less" scoped>
@color: #71c179;

.e-schema-editor {
	width: 100%;
	border: 1px solid @color;
	display: inline-block;
	/*max-width: 600px;
		min-width: 400px;*/

	.el-header {
		line-height: 23px;
		background: @color;
		color: #ffffff;
		font-weight: bold;
	}

	.el-main {
		padding: 0;
		overflow: hidden;
	}

	.custom-tree-node {
		flex: 1;

		display: flex;
		justify-content: start;
		align-items: center;
		flex-direction: row;

		line-height: 25px;

		.e-port {
			width: 10px;
			height: 10px;
			/*background: #31d0c6;*/
			position: relative;
		}

		.e-port-in {
			left: -11px;
		}
		.e-label {
			flex: 1;

			input {
				color: #606266;
				outline: none;
				border: none;
				background: transparent;
				line-height: 20px;
				height: 25px;

				&:focus {
					background: #ffffaa;
				}
			}
		}

		.e-triangle {
			width: 0;
			height: 0;
			border-right: 5px solid transparent;
			border-left: 5px solid transparent;
			border-bottom: 5px solid transparent;

			-webkit-transform: rotate(-45deg);
			-moz-transform: rotate(-45deg);
			-ms-transform: rotate(-45deg);
			-o-transform: rotate(-45deg);
			transform: rotate(-45deg);

			position: relative;
			left: -3px;
			top: -11px;
		}

		.e-data-type {
			font-size: 0.8em;
		}

		.el-icon-more {
			-webkit-transform: rotate(90deg);
			-moz-transform: rotate(90deg);
			-ms-transform: rotate(90deg);
			-o-transform: rotate(90deg);
			transform: rotate(90deg);
		}
	}
}
</style>
<style lang="less">
@color: #71c179;
.e-schema-editor {
	font-size: 11px;
}

.header-row {
	display: flex;
	background-color: #71c179;
	color: #fff;
	line-height: 30px;

	.e-col {
		width: 100px;
		text-align: center;
	}
	.e-col:first-child {
		padding-left: 20px;
		flex: 1;
		text-align: left;
	}
}

.row-col-base {
	display: inline-block;
}

.col-name {
	min-width: 150px;
	max-width: 430px;
}

.col-type {
	min-width: 100px;
}

.col-op {
	min-width: 50px;
}

.e-schema-editor .el-main .el-tree .el-tree-node {
	border-bottom: 1px solid @color;

	&:last-child {
		border-bottom: none;
	}

	&:first-child {
		border-top: 1px solid @color;
	}

	.el-input__inner {
		border: none;
		background-color: transparent;
		font-size: 11px;
	}

	.activedatatype {
		.el-input__inner {
			color: @color;
		}
	}

	.activename {
		.el-input__inner {
			color: tomato;
		}
	}

	.e-select {
		width: 100px;
		border-left: 1px solid #71c179;
		border-right: 1px solid #71c179;
		font-size: 11px;
	}

	.e-field-action {
		cursor: pointer;
		text-align: center;
		width: 25px;
		font-size: 14px;
	}
}
.e-pk {
	font-size: 9px;
	font-weight: bold;
	color: #ffa000;
	position: relative;
	left: -14px;
	display: inline-block;
	width: 5px;
}

.e-schema-editor .el-main .el-tree .el-tree-node .icon-none {
	display: none;
}
.el-button + .el-button {
	margin-left: 0 !important;
}
</style>
