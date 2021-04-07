<template>
	<div class="fieldProcess">
		<div v-show="showErrorOperationTip" class="error-operation-tip">
			{{ $t('editor.cell.processor.field.form.errorOperationTipBefore')
			}}<span style="color: #48b6e2;;cursor: pointer" @click="openErrorList">{{
				$t('editor.cell.processor.field.form.errorOperationTipAfter')
			}}</span>
		</div>
		<div v-show="showUndefined" class="error-operation-tip">
			{{ $t('editor.cell.processor.field.form.errorUndefined') }}
		</div>
		<div class="clear"></div>
		<div class="header-row">
			<div class="field">
				<el-checkbox v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
			</div>
			<div class="field field-text">{{ $t('editor.cell.processor.field.form.fieldName') }}</div>
			<div class="btnBox">
				<el-button size="mini" type="text" class="btn" @click="handleAllToUpperCase()" :disabled="disabledMode">
					<img src="../../../../static/image/upper.png" alt="" />
				</el-button>
				<el-button size="mini" type="text" class="btn" @click="handleAllToLowerCase()" :disabled="disabledMode">
					<img src="../../../../static/image/lower.png" alt="" />
				</el-button>
				<el-button size="mini" type="text" class="btn" @click="handleAllDelete" :disabled="disabledMode">
					<img src="../../../../static/image/del.png" alt="" />
				</el-button>
				<el-button type="text" class="btn" size="mini" @click="handleAllReset" :disabled="disabledMode">
					<img src="../../../../static/image/return.png" alt="" />
				</el-button>
				<el-button
					type="text"
					class="iconfont icon-lishi2 btn"
					size="mini"
					@click="openErrorList"
					:disabled="errorOperation.length === 0 || disabledMode"
				></el-button>
			</div>
		</div>
		<div class="clear"></div>
		<div class="e-schema-editor" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom" v-if="schema">
			<el-container v-loading="loadingSchema">
				<el-main>
					<el-tree
						:data="schema.fields || []"
						:node-key="nodeKey"
						default-expand-all
						:expand-on-click-node="false"
						icon-class="icon-none"
						show-checkbox
						ref="tree"
						class="schemaEditor"
					>
						<span class="custom-tree-node" slot-scope="{ node, data }">
							<span class="e-port e-port-in" :data-id="getId(data)"></span>
							<el-tooltip class="item" effect="dark" placement="left-start">
								<span slot="content"
									>{{ $t('editor.cell.processor.field.form.originalName') + data.original_field_name
									}}<br />
									<span v-if="data.original_javaType">{{
										$t('editor.cell.processor.field.form.originalType') + data.original_type
									}}</span>
									<span v-else
										>{{ $t('editor.cell.processor.field.form.originalType')
										}}{{ handleOriginalType(data.type, data.id) }}</span
									>
								</span>
								<span
									class="e-label"
									:class="{
										'active-name': isRename(data.id) || isCreate(data.id, data.label)
									}"
								>
									<el-input
										v-model="data.label"
										@blur="handleRename(node, data)"
										@change="handleRename(node, data)"
										:disabled="isRemove(data.id) || disabledMode"
									></el-input>
								</span>
							</el-tooltip>
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
								type="text"
								v-if="isRemove(data.id) || ['Array', 'Map'].includes(data.type)"
								:class="[{ operWidth: disabledMode }, 'e-field-action', 'iconfont', 'icon-script']"
								disabled
							></el-button>
							<span
								v-else
								:class="[{ operWidth: disabledMode }, 'e-field-action', 'iconfont', 'icon-script']"
								:style="isScript(data.id) ? 'color: #f98004;' : ''"
								@click="handleScript(node, data)"
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
								@click="handleDelete(node, data)"
								v-show="!disabledMode"
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
				custom-class="scriptDialog"
				:close-on-click-modal="false"
			>
				<el-form>
					<el-form-item>
						<el-input
							:placeholder="$t('editor.cell.processor.field.form.expression')"
							v-model="scriptDialog.script"
							size="mini"
							:disabled="disabledMode"
						>
							<template slot="prepend">var result = </template>
						</el-input>
					</el-form-item>
				</el-form>
				<div class="example">
					<div>{{ $t('editor.cell.processor.field.form.example') }}:</div>
					<div>{{ $t('editor.cell.processor.field.form.exampleRow1') }}</div>
					<div>{{ $t('editor.cell.processor.field.form.exampleRow2') }}</div>
					<div>{{ $t('editor.cell.processor.field.form.exampleRow3') }}</div>
					<div>{{ $t('editor.cell.processor.field.form.exampleRow4') }}</div>
				</div>
				<div slot="footer" class="dialog-footer">
					<el-button @click="scriptDialog.open = false" size="mini">{{ $t('message.cancel') }}</el-button>
					<el-button @click="scriptDialog.fn" type="primary" size="mini">{{
						$t('message.confirm')
					}}</el-button>
				</div>
			</el-dialog>
			<el-dialog
				title="Field Modification Conflict Process"
				:visible.sync="disabledChangeField"
				append-to-body
				custom-class="scriptDialog"
				width="60%"
			>
				<div v-if="errorOperation.length > 0">
					<div class="tip">{{ $t('editor.cell.processor.field.form.errorOperationDrop') }}</div>
					<div class="tip">{{ $t('editor.cell.processor.field.form.errorOperationDesc') }}</div>
					<div style="float: right;margin-bottom: 10px;margin-top: 10px">
						<el-button size="mini" @click="delErrorOperation">{{
							$t('editor.cell.processor.field.form.errorOperationDelBtn')
						}}</el-button>
						<el-button size="mini" @click="keepErrorOperation">{{
							$t('editor.cell.processor.field.form.errorOperationKeepBtn')
						}}</el-button>
					</div>
					<div style="clear: both"></div>
					<ul class="changeList">
						<li>
							<span class="index">#</span>
							<span class="item">{{ $t('editor.cell.processor.field.form.originalField') }}</span>
							<span class="op">{{ $t('editor.cell.processor.field.form.process') }}</span>
							<span class="item">{{ $t('editor.cell.processor.field.form.result') }}</span>
							<span class="op">{{ $t('editor.cell.processor.field.form.operation') }}</span>
						</li>
						<li v-for="(item, index) in errorOperation" :key="item.id">
							<span class="index">{{ index + 1 }}</span>
							<span v-if="item.op === 'RENAME'">
								<span class="item">{{ item.field }} {{ item.type ? `(${item.type})` : '' }}</span>
								<span class="op">{{ item.op }}</span>
								<span class="item"
									><span class="active">{{ item.operand }}</span>
									<span>{{ item.type ? `(${item.type})` : '' }}</span></span
								>
								<span>
									<el-radio-group v-model="item.keep">
										<el-radio :label="false">{{
											$t('editor.cell.processor.field.form.delete')
										}}</el-radio>
										<el-radio :label="true" v-if="![1, 4].includes(item.isType)">{{
											$t('editor.cell.processor.field.form.keep')
										}}</el-radio>
									</el-radio-group>
								</span>
							</span>
							<span v-if="item.op === 'REMOVE'">
								<span class="item">{{ item.field }} {{ item.type ? `(${item.type})` : '' }}</span>
								<span class="op">{{ item.op }}</span>
								<span class="item"></span>
								<span>
									<el-radio-group v-model="item.keep">
										<el-radio :label="false">{{
											$t('editor.cell.processor.field.form.delete')
										}}</el-radio>
										<el-radio :label="true" v-if="![1, 4].includes(item.isType)">{{
											$t('editor.cell.processor.field.form.keep')
										}}</el-radio>
									</el-radio-group>
								</span>
							</span>
							<span v-if="item.op === 'CREATE'">
								<span class="item"></span>
								<span class="op">{{ item.op }}</span>
								<span class="item active">{{ `${item.field} (${item.javaType})` }}</span>
								<span>
									<el-radio-group v-model="item.keep">
										<el-radio :label="false">{{
											$t('editor.cell.processor.field.form.delete')
										}}</el-radio>
										<el-radio :label="true" v-if="![1, 4].includes(item.isType)">{{
											$t('editor.cell.processor.field.form.keep')
										}}</el-radio>
									</el-radio-group>
								</span>
							</span>
							<span v-if="item.op === 'CONVERT'">
								<span class="item">{{ `${item.field} (${item.originalDataType})` }}</span>
								<span class="op">{{ item.op }}</span>
								<span class="item"
									>{{ item.field }} <span class="active">{{ `(${item.operand})` }}</span></span
								>
								<span>
									<el-radio-group v-model="item.keep">
										<el-radio :label="false">{{
											$t('editor.cell.processor.field.form.delete')
										}}</el-radio>
										<el-radio :label="true" v-if="![1, 4].includes(item.isType)">{{
											$t('editor.cell.processor.field.form.keep')
										}}</el-radio>
									</el-radio-group>
								</span>
							</span>
							<span v-if="item.scriptType === 'js'">
								<span class="item">{{ item.field }} {{ item.type ? `(${item.type})` : '' }}</span>
								<span class="op">{{ item.scriptType }}</span>
								<span class="item"
									><span class="js">{{ item.script }}</span></span
								>
								<span>
									<el-radio-group v-model="item.keep">
										<el-radio :label="false">{{
											$t('editor.cell.processor.field.form.delete')
										}}</el-radio>
										<el-radio :label="true" v-if="![1, 4].includes(item.isType)">{{
											$t('editor.cell.processor.field.form.keep')
										}}</el-radio>
									</el-radio-group>
								</span>
							</span>
						</li>
					</ul>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="saveErrorOperation" size="mini">{{
						$t('editor.cell.processor.field.form.save')
					}}</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import $ from 'jquery';
import log from '../../../log';
import _ from 'lodash';
import { uuid } from '../../util/Schema';
import { isValidate, isScript, fieldsNamesMap, delScript, originalType } from './util';

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
	// components: { JsEditor },
	props: {
		disabledMode: {
			type: Boolean
		},
		showUndefined: {
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
		originalSchemaFiled: {
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
			errorOperation: [],
			disabledChangeField: false,
			showErrorOperationTip: false,
			jsEditorWidth: '500',
			checkAll: false,
			fieldOriginalNames: [],
			fieldIsDeleted: [],
			fieldNameMap: {},
			fieldOriginalIds: [],
			originalOperations: [],
			interval: null,
			loadingSchema: false,
			step: 0
		};
	},
	watch: {
		schema(schema) {
			if (schema) {
				//只有第一次懒加载
				if (this.step === 0) this.lazyData(schema);
				this.step = 1;
			}
		}
	},
	mounted() {
		setTimeout(() => {
			this.getErrorOperation();
		}, 100);
	},
	methods: {
		//lazyData
		lazyData(schema) {
			let fields = schema.fields || [];
			if (fields.length === 0) return;
			let total = fields.length;
			this.loadingSchema = true;
			let size = total < 5 ? total : 10;
			let index = 0;
			let interval = this.interval;
			if (interval) {
				clearInterval(interval);
				this.interval = null;
			}
			this.$nextTick(() => {
				let load = () => {
					this.schema.fields.push(...fields.slice((index + 0) * size, (index + 1) * size));
					index++;
					this.loadingSchema = false;
				};
				this.interval = setInterval(() => {
					if (index * size < total) {
						load();
					} else {
						clearInterval(this.interval);
						this.interval = null;
					}
				}, 100);
			});
		},
		//originalType 旧数据兼容
		handleOriginalType(type, id) {
			let javaType = originalType(this.model.operations, id);
			let currentType = type;
			if (javaType !== '') {
				currentType = javaType;
			}
			return currentType;
		},
		setOperations(operations) {
			this.model.operations = operations;
		},
		setScripts(scripts) {
			this.model.scripts = scripts;
			this.checkAll = false;
		},
		setOriginalOperations(operations) {
			this.originalOperations = operations;
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
		getErrorOperation() {
			if (!this.originalSchemaFiled || !this.originalSchemaFiled.fields) {
				return;
			}
			if (this.showUndefined) {
				this.disabledMode = true;
			}
			this.errorOperation = isValidate(this.originalOperations, this.originalSchemaFiled).errorList || [];
			let script = isScript(this.model.scripts, this.originalSchemaFiled).errorList || [];
			this.fieldNameMap = fieldsNamesMap(this.originalSchemaFiled.fields);
			this.errorOperation = [...this.errorOperation, ...script];
			if (this.errorOperation.length > 0 && !this.disabledMode) {
				this.showErrorOperationTip = true;
			} else {
				this.showErrorOperationTip = false;
			}
		},
		keepErrorOperation() {
			if (this.errorOperation.length === 0) return;
			this.errorOperation.forEach(item => {
				if (![1, 4].includes(item.isType)) {
					item.keep = true;
				} else {
					item.keep = false;
				}
			});
		},
		delErrorOperation() {
			if (this.errorOperation.length === 0) return;
			this.errorOperation.forEach(item => {
				item.keep = false;
			});
		},
		saveErrorOperation() {
			for (let i = 0; i < this.errorOperation.length; i++) {
				let targetId = this.model.operations.findIndex(n => n.id === this.errorOperation[i].id);
				if ([1, 4].includes(this.errorOperation[i].isType) && targetId > -1) {
					this.model.operations.splice(targetId, 1);
				} else if (this.errorOperation[i].isType === 2 && targetId > -1 && this.errorOperation[i].keep) {
					let id = this.fieldNameMap[this.errorOperation[i].field];
					if (id) {
						this.model.operations[targetId]['keep'] = true; //将operations 标记为true
						this.model.operations[targetId].id = id; //将id与最新模型id 保持一致
					}
				} else if (this.errorOperation[i].isType === 3 && targetId > -1 && this.errorOperation[i].keep) {
					this.model.operations[targetId]['keep'] = true;
				} else if (this.errorOperation[i].isType === 5 && targetId > -1 && this.errorOperation[i].keep) {
					let id = this.fieldNameMap[this.errorOperation[i].field];
					if (id) {
						this.model.scripts[targetId]['keep'] = true; //将operations 标记为true
						this.model.scripts[targetId].id = id; //将id与最新模型id 保持一致
					}
				}
			}
			this.$emit('dataChanged', this.model);
			this.originalOperations = this.model.operations;
			this.disabledChangeField = false;
			this.getErrorOperation();
		},
		openErrorList() {
			this.getErrorOperation();
			this.disabledChangeField = true;
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
						originalDataType: nativeData.type,
						table_name: data.table_name,
						type: data.type,
						primary_key_position: data.primary_key_position,
						color: data.color,
						label: data.label
					});
					this.model.operations.push(op);
				} else {
					op = ops[0];
					op.type = data.type;
					op.operand = data.type;
					op.originalDataType = nativeData.type;
				}
			}
			this.$emit('dataChanged', this.model);
		},
		handleRename(node, data) {
			log('SchemaEditor.handleRename', node, data);
			let nativeData = this.getNativeData(this.originalSchema.fields, data.id); //查找初始schema
			//该字段若是已被删除 不可再重命名
			if (!data || data.label === '') {
				data.label = nativeData.label;
				this.$message.error(this.$t('message.exists_name'));
				return;
			}
			let removes = this.model.operations.filter(v => v.id === data.id && v.op === 'REMOVE');
			if (removes.length > 0) {
				data.label = nativeData.label;
				return;
			}
			let existsName = this.handleExistsName(node, data);
			if (existsName) {
				data.label = nativeData.label;
				return;
			}
			let createOps = this.model.operations.filter(v => v.id === data.id && v.op === 'CREATE');
			if (createOps && createOps.length > 0) {
				let op = createOps[0];
				let level = op.level;
				let fieldNames = (op.field || op.field_name).split('.');
				fieldNames[level] = data.label;
				op.field = fieldNames.join('.');
				//同步对js 改名操作
				if (this.model.scripts && this.model.scripts.length && this.model.scripts.length > 0) {
					for (let i = 0; i < this.model.scripts.length; i++) {
						if (op.id === this.model.scripts[i].id) {
							this.model.scripts[i].field = op.field;
							this.model.scripts[i].label = op.field;
						}
					}
				}
			} else {
				log(
					'Entity1.handlerRename(node,data,nativeData,operations)',
					node,
					data,
					nativeData,
					this.model.operations
				);
				let ops = this.model.operations.filter(v => v.id === data.id && v.op === 'RENAME');
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(RENAME_OPS_TPL), {
						id: data.id,
						field: nativeData.original_field_name,
						operand: data.label,
						table_name: data.table_name,
						type: data.type,
						primary_key_position: data.primary_key_position,
						color: data.color,
						label: data.label
					});
					this.model.operations.push(op);
				} else {
					op = ops[0];
					op.operand = data.label;
					op.label = data.label;
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
							data.label = originalField.label;
							self.model.operations.splice(i, 1);
						}
					}
					for (let i = 0; i < self.model.operations.length; i++) {
						// 删除所有的类型改变的操作
						let ops = self.model.operations[i];
						if (ops.id === field.id && ops.op === 'CONVERT') {
							data.type = originalField.type;
							self.model.operations.splice(i, 1);
						}
					}
					let ops = self.model.operations.filter(v => v.op === 'REMOVE' && v.id === field.id);
					let op;
					if (ops.length === 0) {
						op = Object.assign(_.cloneDeep(REMOVE_OPS_TPL), {
							id: field.id,
							field: field.original_field_name,
							operand: true,
							table_name: field.table_name,
							type: field.type,
							primary_key_position: field.primary_key_position,
							color: field.color,
							label: field.label
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
			this.model.scripts = delScript(this.model.operations, this.model.scripts, data.id);
			this.$emit('dataChanged', this.model);
		},
		handleAllReset() {
			let ids = this.$refs.tree.getCheckedNodes(false, true);
			this.checkAll = false;
			if (ids && ids.length > 0) {
				ids.map(id => {
					let node = this.$refs.tree.getNode(id);
					if (node) {
						this.handleReset(node, node.data);
					}
				});
			}
		},
		handleExistsName(node, data) {
			// 改名前查找同级中是否重名，若有则return且还原改动并提示
			let exist = false;
			if (node && node.parent && node.parent.childNodes) {
				let parentNode = node.parent.childNodes.filter(v => data.label === v.data.label);
				if (parentNode && parentNode.length === 2) {
					this.$message.error(data.label + this.$t('message.exists_name'));
					exist = true;
				}
			}
			return exist;
		},
		handleAllDelete() {
			let ids = this.$refs.tree.getCheckedNodes();
			this.checkAll = false;
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
			this.checkAll = false;
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
			this.checkAll = false;
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
			let dataLabel = _.cloneDeep(data.label);
			let indexId = this.model.operations.filter(v => v.op === 'REMOVE' && v.id === parentId);
			if (parentId && indexId.length !== 0) {
				return;
			}
			let self = this;
			let fn = function(node, data) {
				let nativeData = self.getNativeData(self.originalSchema.fields, data.id);
				for (let i = 0; i < node.childNodes.length; i++) {
					let childNode = node.childNodes[i];
					fn(childNode, childNode.data);
				}
				for (let i = 0; i < self.model.operations.length; i++) {
					if (self.model.operations[i].id === data.id) {
						let ops = self.model.operations[i];
						if (ops.op === 'REMOVE') {
							self.model.operations.splice(i, 1);
							i--;
							continue;
						}
						if (ops.op === 'CREATE') {
							self.model.operations.splice(i, 1);
							i--;
							self.$refs.tree.remove(node);
							continue;
						}
						if (ops.op === 'RENAME') {
							let existsName = self.handleExistsName(node, data);
							if (existsName) {
								return;
							}
							if (nativeData) node.data.label = nativeData.label;
							self.model.operations.splice(i, 1);
							i--;
							continue;
						}
						if (ops.op === 'CONVERT') {
							if (nativeData) node.data.type = nativeData.type;
							self.model.operations.splice(i, 1);
							i--;
							continue;
						}
					}
				}
			};
			fn(node, data);
			let existsName = this.handleExistsName(node, data);
			if (existsName) {
				data.label = dataLabel;
			}
			//删除 对应字段js脚本处理

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
				let parentNode = node.parent.childNodes.filter(v => v.data.label === 'newFieldName');
				if (parentNode && parentNode.length > 0) {
					this.$message.error('newFieldName ' + this.$t('message.exists_name'));
					return;
				}
			} else if (action === 'create_child') {
				parentFieldName = this.getParentFieldName(node);
				level++;
				let parentNode = node.childNodes.filter(v => v.data.label === 'newFieldName');
				if (parentNode && parentNode.length > 0) {
					this.$message.error('newFieldName ' + this.$t('message.exists_name'));
					return;
				}
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
					type: data.type,
					primary_key_position: data.primary_key_position,
					color: data.color,
					label: data.label,
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
.error-operation-tip {
	color: #ee5353;
	font-size: 12px;
	margin-bottom: 10px;
}
.operWidth {
	width: 80px !important;
}
.header-row {
	height: 30px;
	line-height: 30px;
	font-size: 12px;
	background: #0ab300;
	border-radius: 4px;
	margin-bottom: 10px;
	.btnBox {
		color: #fff;
		float: right;
		margin-right: 10px;
	}
	.field {
		color: #fff;
		float: left;
		margin-left: 10px;
	}
	.field-text {
		margin-left: 25px;
	}
	.btn {
		width: 24px;
		padding: 5px;
		color: #fff;
		font-weight: bold;
		& {
			background: #0ab300;
		}
	}
}
.clear {
	clear: both;
}
.e-schema-editor {
	border: 1px solid @color;
	display: inline-block;
	margin-bottom: 20px;
	box-sizing: border-box;
	width: 100%;
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
.tip {
	font-size: 12px;
	color: #999;
}
.changeList {
	max-height: 400px;
	overflow: auto;
	li {
		border-bottom: 1px solid #dedee4;
		height: 30px;
		line-height: 30px;
		font-size: 12px;
	}
	li:first-child {
		background: #f1f1f1;
	}
	.index {
		display: inline-block;
		width: 40px;
		padding-left: 10px;
	}
	.item {
		display: inline-block;
		width: 32%;
		font-size: 12px;
	}
	.op {
		display: inline-block;
		width: 100px;
	}
	.active {
		color: #48b6e2;
	}
	.js {
		display: inline-block;
		overflow: hidden;
		word-break: initial;
		text-overflow: ellipsis;
		height: 20px;
		width: 100%;
	}
}
.changeBtn {
	float: right;
	font-size: 12px;
	cursor: pointer;
	margin-bottom: 10px;
	&：hover {
		color: #48b6e2;
	}
}
</style>
<style lang="less">
@color: #48b6e2; //更改颜色
@colorBorder: #71c179;
.fieldProcess {
	.e-schema-editor {
		font-size: 11px;
		.el-checkbox__input.is-checked + .el-checkbox__label {
			color: #fff;
		}
		.el-checkbox__label {
			font-size: 11px;
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
			padding: 0 5px;
		}

		.activedatatype {
			.el-input__inner {
				color: @color;
			}
		}

		.active-name {
			.el-input__inner {
				color: @color;
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
	.el-tree-node__content > label.el-checkbox {
		margin-left: 9px;
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
	.example {
		padding-left: 90px;
		font-size: 12px;
		color: #6999;
	}
	.fieldProcess {
		.schemaEditor {
			.el-checkbox__inner {
				margin-left: 10px;
			}
		}

		.el-input__inner {
			font-size: 12px !important;
		}
	}
	.scriptDialog {
		.el-form-item {
			margin-bottom: 10px;
		}
		.el-input-group__append,
		.el-input-group__prepend {
			padding: 0 12px !important;
		}
	}
}
</style>
