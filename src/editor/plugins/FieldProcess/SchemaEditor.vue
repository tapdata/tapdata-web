<template>
	<div>
		<el-row class="operation-area">
			<el-form :disabled="disabledMode">
				<el-form-item>
					<el-button type="text" @click="handleAllDelete">{{
						$t('editor.cell.processor.field.form.delete')
					}}</el-button>
					<el-button type="text" @click="handleAllReset">{{ $t('dataFlow.reset') }}</el-button>
					<el-button type="text" @click="handleAllToUpperCase()">{{
						$t('editor.cell.processor.field.form.toUpperCase')
					}}</el-button>
					<el-button type="text" @click="handleAllToLowerCase()">{{
						$t('editor.cell.processor.field.form.toLowerCase')
					}}</el-button>
				</el-form-item>
			</el-form>
		</el-row>
		<div class="e-schema-editor" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom">
			<el-container>
				<el-header height="20">
					<!--{{schema ? schema.name : ''}}-->
				</el-header>
				<div class="header-row">
					<div class="e-col">
						<el-checkbox v-model="checkAll" @change="handleCheckAllChange" style="color: #fff">{{
							$t('dataFlow.selectAll')
						}}</el-checkbox>
					</div>
					<div class="e-col">
						{{ $t('editor.cell.processor.field.form.fieldName') }}
					</div>
					<div class="e-col">
						{{ $t('editor.cell.processor.field.form.fieldType') }}
					</div>
					<div class="e-col" v-show="!disabledMode">{{ $t('message.operator') }}</div>
				</div>
				<el-main>
					<el-tree
						:data="schema ? schema.fields : []"
						:node-key="nodeKey"
						default-expand-all
						:expand-on-click-node="false"
						icon-class="icon-none"
						show-checkbox
						ref="tree"
						class="schemaEditor"
					>
						<span class="custom-tree-node" slot-scope="{ node, data }">
							<!--            <span-->
							<!--              class="e-triangle"-->
							<!--              :style="`border-bottom-color: ${data.color || '#ddd'};`"-->
							<!--            ></span>-->

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
								:disabled="isRemove(data.id) || disabledMode"
								@change="handleDataType(node, data)"
							>
								<el-option
									value="String"
									label="String"
									v-if="isCreate(data.id) || !['Map', 'Array'].includes(data.type)"
								></el-option>
								<el-option
									value="Date"
									label="Date"
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
								v-show="!disabledMode"
								v-if="isRemove(data.id)"
								class=" e-field-action el-icon-plus"
								disabled
							></el-button>
							<el-dropdown
								v-else
								v-show="!disabledMode"
								size="mini"
								:show-timeout="10"
								:hide-on-click="false"
								@command="command => handleCreate(command, node, data)"
							>
								<span
									class="e-field-action el-icon-plus"
									@click="handleCreate('create_sibling', node, data)"
									v-show="!disabledMode"
								></span>
								<el-dropdown-menu slot="dropdown">
									<el-dropdown-item
										command="create_sibling"
										icon="iconfont icon-create_sibling_node"
										>{{ $t('editor.cell.processor.field.form.addField') }}</el-dropdown-item
									>
									<el-dropdown-item
										command="create_child"
										icon="iconfont icon-create_child_node"
										v-if="['Map', 'Array'].includes(data.type)"
										>{{ $t('editor.cell.processor.field.form.addEmbedField') }}</el-dropdown-item
									>
								</el-dropdown-menu>
							</el-dropdown>

							<el-button
								v-show="!disabledMode"
								type="text"
								v-if="isRemove(data.id) || ['Array', 'Map'].includes(data.type)"
								class=" e-field-action iconfont icon-script"
								disabled
							></el-button>
							<span
								v-else
								class="e-field-action iconfont icon-script"
								:style="isScript(data.id) ? 'color: #f98004;' : ''"
								@click="handleScript(node, data)"
								v-show="!disabledMode"
							></span>

							<el-button
								type="text"
								v-show="!disabledMode"
								v-if="originalSchema.type === 'collection' && data.primary_key_position > 0"
								class=" e-field-action iconfont icon-l-del"
								disabled
							></el-button>
							<span
								v-else
								class="e-field-action iconfont icon-l-del"
								v-show="!disabledMode"
								@click="handleDelete(node, data)"
							></span>
							<span
								v-show="!disabledMode"
								class="e-field-action iconfont icon-return"
								@click="handleReset(node, data)"
							></span>

							<span v-show="!disabledMode" class="e-port e-port-out" :data-id="getId(data)"></span>
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
						<JsEditor
							v-if="scriptDialog.open"
							:code.sync="scriptDialog.script"
							:width.sync="jsEditorWidth"
						></JsEditor>
						<!--					<el-input type="textarea" v-model="scriptDialog.script" rows="10"></el-input>-->
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="scriptDialog.open = false" size="mini">{{ $t('message.cancel') }}</el-button>
					<el-button @click="scriptDialog.fn" type="primary" size="mini">{{
						$t('message.confirm')
					}}</el-button>
				</div>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import $ from 'jquery';
import log from '../../../log';
import _ from 'lodash';
import { uuid } from '../../util/Schema';
import JsEditor from '../../../components/JsEditor';

const REMOVE_OPS_TPL = {
	id: '',
	op: 'REMOVE',
	field: ''
};
const RENAME_OPS_TPL = {
	id: '',
	op: 'RENAME',
	field: '',
	operand: ''
};
const CONVERT_OPS_TPL = {
	id: '',
	op: 'CONVERT',
	field: '',
	operand: '',
	originalDataType: ''
};
const CREATE_OPS_TPL = {
	op: 'CREATE',
	field: '',
	tableName: '',
	javaType: 'String',
	id: '',

	action: '',
	triggerFieldId: ''
};
const SCRIPT_TPL = {
	tableName: '',
	field: '',
	scriptType: 'js',
	script: '',
	id: ''
};

/*
1、转换成大写：toUpperCase()
2、转换成小写：toLowerCase()
 */
export default {
	name: 'SchemaEditor',
	components: { JsEditor },
	props: {
		disabledMode: {
			type: Boolean
		},
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
			default: 'id'
		},
		editable: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			disabled: false,
			scriptDialog: {
				open: false,
				script: '//Enter you code at here',
				fieldName: '',
				fn: function() {}
			},

			model: {
				operations: [],
				scripts: []
			},
			jsEditorWidth: '500',
			checkAll: false
		};
	},
	methods: {
		setOperations(operations) {
			this.model.operations = operations;
		},
		setScripts(scripts) {
			this.model.scripts = scripts;
			this.checkAll = false;
		},
		isRemove(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === 'REMOVE');
			return ops && ops.length > 0;
		},
		isRename(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === 'RENAME');
			return ops && ops.length > 0;
		},
		isConvertDataType(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === 'CONVERT');
			return ops && ops.length > 0;
		},
		isScript(id) {
			let scripts = this.model.scripts.filter(v => v.id === id);
			return scripts && scripts.length > 0;
		},
		isCreate(id) {
			let ops = this.model.operations.filter(v => v.id === id && v.op === 'CREATE');
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
		// handlerNodeExpand(data, node, ev) {
		// 	this.$emit("expand", data);
		// },
		// handlerNodeCollapse(data, node, ev) {
		// 	this.$emit("collapse", data);
		// },
		// handleDragStart(node, ev) {},
		// handleDragEnter(draggingNode, dropNode, ev) {},
		// handleDragLeave(draggingNode, dropNode, ev) {},
		// handleDragOver(draggingNode, dropNode, ev) {},
		// handleDragEnd(draggingNode, dropNode, dropType, ev) {},
		// handleDrop(draggingNode, dropNode, dropType, ev) {
		// 	this.$emit("drop", draggingNode);
		// },
		// allowDrop(draggingNode, dropNode, type) {
		// 	return type !== "inner";
		// },
		// allowDrag(draggingNode) {
		// 	return draggingNode.data.children && draggingNode.data.children.length > 0;
		// },
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
			log('SchemaEditor.handleDataType', node, data);
			let createOps = this.model.operations.filter(v => v.id === data.id && v.op === 'CREATE');
			if (createOps && createOps.length > 0) {
				let op = createOps[0];
				op.javaType = data.type;
			} else {
				let nativeData = this.getNativeData(this.originalSchema.fields, data.id);
				let ops = this.model.operations.filter(v => v.id === data.id && v.op === 'CONVERT');
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(CONVERT_OPS_TPL), {
						id: data.id,
						field: nativeData.original_field_name,
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

			this.$emit('dataChanged', this.model);
		},
		handleRename(node, data) {
			log('SchemaEditor.handleRename', node, data);
			let nativeData = this.getNativeData(this.originalSchema.fields, data.id); //查找初始schema

			// 改名前查找同级中是否重名，若有则return且还原改动并提示
			if (node && node.parent && node.parent.childNodes) {
				let parentNode = node.parent.childNodes.filter(v => data.label === v.data.label);
				if (parentNode && parentNode.length === 2) {
					this.$message.error(data.label + this.$t('message.exists_name'));
					data.label = nativeData.label;
					return;
				}
			}
			let createOps = this.model.operations.filter(v => v.id === data.id && v.op === 'CREATE');
			if (createOps && createOps.length > 0) {
				let op = createOps[0];
				let level = op.level;
				let fieldNames = (op.field || op.field_name).split('.');
				fieldNames[level] = data.label;
				op.field = fieldNames.join('.');
			} else {
				log(
					'Entity1.handlerRename(node,data,nativeData,operations)',
					node,
					data,
					nativeData,
					this.model.operations
				);
				let ops = this.model.operations.filter(v => v.id === nativeData.id && v.op === 'RENAME');
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(RENAME_OPS_TPL), {
						id: data.id,
						field: nativeData.original_field_name,
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
				//删除 相同字段名称
				if (this.model.scripts && this.model.operations.length && this.model.operations.length > 0) {
					for (let i = 0; i < this.model.operations.length; i++) {
						let originalFieldName = this.model.operations[i].field;
						if (originalFieldName.indexOf('.') >= 0) {
							originalFieldName = originalFieldName.split('.');
							originalFieldName = originalFieldName[originalFieldName.length - 1];
						}
						if (
							originalFieldName === this.model.operations[i].operand &&
							this.model.operations[i].op === 'RENAME'
						) {
							this.model.operations.splice(i, 1);
							i--;
						}
					}
				}
			}
			this.$emit('dataChanged', this.model);
		},
		handleDelete(node, data) {
			log('SchemaEditor.handleDelete', node, data);
			let createOpsIndex = this.model.operations.findIndex(v => v.id === data.id && v.op === 'CREATE');
			if (createOpsIndex >= 0) {
				let fieldName = this.model.operations[createOpsIndex].field_name + '.';
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
						// 删除所有的rename的操作
						let ops = self.model.operations[i];
						if (ops.id === field.id && ops.op === 'RENAME') {
							// let originalNode = self.getNativeData(self.originalSchema.fields, field.id);
							// originalNode.label = field.label;
							self.model.operations.splice(i, 1);
						}
					}
					for (let i = 0; i < self.model.operations.length; i++) {
						// 删除所有的类型改变的操作
						let ops = self.model.operations[i];
						if (ops.id === field.id && ops.op === 'CONVERT') {
							// let originalNode = self.getNativeData(self.originalSchema.fields, field.id); // 替换原始数据 主要是操作子节点
							// originalNode.type = field.type;
							self.model.operations.splice(i, 1);
						}
					}

					let ops = self.model.operations.filter(v => v.op === 'REMOVE' && v.id === field.id);

					let op;
					if (ops.length === 0) {
						op = Object.assign(_.cloneDeep(REMOVE_OPS_TPL), {
							id: field.id,
							field: originalField.original_field_name,
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
			//删除 对应字段js脚本处理
			if (this.model.scripts && this.model.scripts.length && this.model.scripts.length > 0) {
				for (let i = 0; i < this.model.scripts.length; i++) {
					if (data.id === this.model.scripts[i].id) {
						this.model.scripts.splice(i, 1);
						i--;
					}
				}
			}
			this.$emit('dataChanged', this.model);
		},
		handleAllReset() {
			let ids = this.$refs.tree.getCheckedNodes();
			if (ids && ids.length > 0) {
				ids.map(id => {
					let node = this.$refs.tree.getNode(id);
					this.handleReset(node, node.data);
				});
			}
		},
		handleAllDelete() {
			let ids = this.$refs.tree.getCheckedNodes();
			if (ids && ids.length > 0) {
				ids.map(id => {
					let node = this.$refs.tree.getNode(id);
					if (this.originalSchema.type === 'collection' && node.data.primary_key_position > 0) {
						return;
					}
					this.handleDelete(node, node.data);
				});
			}
		},
		handleAllToUpperCase() {
			let ids = this.$refs.tree.getCheckedNodes();
			if (ids && ids.length > 0) {
				ids.map(id => {
					let node = this.$refs.tree.getNode(id);
					node.data.label = node.data.label.toUpperCase();
					this.handleRename(node, node.data);
				});
			}
		},
		handleAllToLowerCase() {
			let ids = this.$refs.tree.getCheckedNodes();
			if (ids && ids.length > 0) {
				ids.map(id => {
					let node = this.$refs.tree.getNode(id);
					node.data.label = node.data.label.toLowerCase();
					this.handleRename(node, node.data);
				});
			}
		},
		handleCheckAllChange(val) {
			if (val) {
				this.$refs.tree.setCheckedNodes(this.schema.fields);
			} else {
				this.$refs.tree.setCheckedKeys([]);
			}
		},
		handleReset(node, data) {
			log('SchemaEditor.handleReset', node, data);
			let parentId = node.parent.data.id;
			let indexId = this.model.operations.filter(v => v.op === 'REMOVE' && v.id === parentId);
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
						if (ops.op === 'REMOVE') {
							self.model.operations.splice(i, 1);
							i--;
							/* node.childNodes.forEach((childNode) => {
									fn(childNode, childNode.data);
								}); */
							// break;
						}
						if (ops.op === 'CREATE') {
							self.model.operations.splice(i, 1);
							i--;
							/* node.childNodes.forEach((childNode) => {
									fn(childNode, childNode.data);
								}); */
							self.$refs.tree.remove(node);
							// break;
						}
						if (ops.op === 'RENAME') {
							if (nativeData) node.data.label = nativeData.label;
							self.model.operations.splice(i, 1);
							i--;
							// break;
						}
						if (ops.op === 'CONVERT') {
							if (nativeData) node.data.type = nativeData.type;
							self.model.operations.splice(i, 1);
							i--;
							// break;
						}
					}
				}
			};
			fn(node, data);
			//删除 对应字段js脚本处理
			if (this.model.scripts && this.model.scripts.length && this.model.scripts.length > 0) {
				for (let i = 0; i < this.model.scripts.length; i++) {
					if (data.id === this.model.scripts[i].id) {
						this.model.scripts.splice(i, 1);
						i--;
					}
				}
			}
			this.$emit('dataChanged', this.model);
		},
		getParentFieldName(node) {
			let fieldName = node.data && node.data.label ? node.data.label : '';
			if (node.level > 1 && node.parent && node.parent.data) {
				let parentFieldName = this.getParentFieldName(node.parent);
				if (parentFieldName) fieldName = parentFieldName + '.' + fieldName;
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
			log('SchemaEditor.handleCreate', action, node, data);

			let parentFieldName = '';
			let level = node.level;
			if (action === 'create_sibling') {
				parentFieldName = this.getParentFieldName(node.parent);
			} else if (action === 'create_child') {
				parentFieldName = this.getParentFieldName(node);
				level++;
			}

			let fieldId = uuid();
			let newFieldOperation = Object.assign(_.cloneDeep(CREATE_OPS_TPL), {
				field: parentFieldName ? parentFieldName + '.newFieldName' : 'newFieldName',
				tableName: data.table_name,
				javaType: 'String',
				id: fieldId,

				action: action,
				triggerFieldId: node.data.id,
				level: level - 1
			});
			this.model.operations.push(newFieldOperation);
			this.$emit('dataChanged', this.model);

			let newNodeData = {
				id: fieldId,
				label: 'newFieldName',
				type: 'String',
				color: data.color,
				primary_key_position: 0,
				table_name: data.table_name
			};
			if (action === 'create_sibling') {
				let parentNode = node.parent;
				let parentData = parentNode.data;

				this.$refs.tree.insertAfter(newNodeData, node);
				if (!['Array', 'Map'].includes(parentData.type)) parentData.type = 'Map';
			} else if (action === 'create_child') {
				this.$refs.tree.append(newNodeData, node);
				if (!['Array', 'Map'].includes(data.type)) data.type = 'Map';
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
			self.$nextTick(() => {
				self.scriptDialog.open = true;
			});

			self.scriptDialog.fn = function() {
				script.script = self.scriptDialog.script;

				if (idx === -1) {
					self.model.scripts.push(script);
				}

				log('SchemaEditor.handleScript', node, data, script, self.model.scripts);

				self.scriptDialog.open = false;
				self.scriptDialog.fn = function() {};
				self.scriptDialog.script = '';
				self.$emit('dataChanged', self.model);
			};
		}
	}
};
</script>

<style lang="less" scoped>
@color: #71c179;
.operation-area {
	text-align: right;
	color: #48b6e2;
	cursor: pointer;
	font-size: 12px;
	span {
		margin-right: 10px;
	}
}
.e-schema-editor {
	width: 100%;
	border: 1px solid @color;
	display: inline-block;
	/*max-width: 600px;
		min-width: 400px;*/
	margin-bottom: 20px;
	box-sizing: border-box;
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
@color: #f98004; //更改颜色
@colorBorder: #71c179;
.e-schema-editor {
	font-size: 11px;
	.el-checkbox__input.is-checked + .el-checkbox__label {
		color: #fff;
	}
	.el-checkbox__label {
		font-size: 11px;
	}
}

.header-row {
	display: flex;
	background-color: @colorBorder;
	color: #fff;
	line-height: 30px;

	.e-col {
		width: 100px;
		text-align: center;
	}
	.e-col:first-child {
		padding-left: 10px;
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
	border-bottom: 1px solid @colorBorder;

	&:last-child {
		border-bottom: none;
	}

	&:first-child {
		border-top: 1px solid @colorBorder;
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
		border-left: 1px solid @colorBorder;
		border-right: 1px solid @colorBorder;
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
.operation-area .el-form-item {
	margin-bottom: 0;
}
</style>
<style lang="less">
.schemaEditor {
	.el-checkbox__inner {
		margin-left: 10px;
	}
}
</style>
