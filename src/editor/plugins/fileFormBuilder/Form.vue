<template>
	<div class="editor-file-form-builder">
		<div class="main">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>
			<header class="form-builder-header">
				<div class="img-box">
					<img :src="getImgByType(model.database_type)" />
				</div>
				<div class="content-box">
					<div class="content">
						{{ model.database_type ? model.database_type.toUpperCase() : model.database_type }}
					</div>
					<div class="tip">
						{{ $t('editor.fileFormBuilder.guideDocPrefix') }}
						{{ model.database_type }}
						{{ $t('editor.fileFormBuilder.guideDoc') }}
						<a style="color: #48B6E2" href="https://docs.tapdata.net/data-source/about-dbs/files">{{
							$t('dataForm.form.guideDoc')
						}}</a>
					</div>
				</div>
			</header>
			<div class="form-builder">
				<label class="file-source-label">{{ $t('editor.fileFormBuilder.fileSource') }}</label>
				<FbSelect v-model="model.connectionId" :config="fileConfig" style="margin-bottom: 10px"></FbSelect>
				<label class="file-source-label">{{ $t('editor.fileFormBuilder.tableName') }}</label>
				<el-input
					v-model="model.tableName"
					size="mini"
					:disabled="disabled"
					:placeholder="$t('formBuilder.input.placeholderPrefix') + $t('editor.fileFormBuilder.tableName')"
				></el-input>
				<form-builder ref="form" v-model="model.fileProperty" :config="config"></form-builder>
				<label class="file-source-label" v-if="model.database_type === 'excel'">{{
					$t('editor.fileFormBuilder.excelValue')
				}}</label>
				<div class="form-excel-wrap" v-if="model.database_type === 'excel'">
					<el-form
						label-width="145px"
						label-position="right"
						:rules="rules"
						:disabled="disabled"
						:model="model.fileProperty"
						ref="excelForm"
					>
						<!--工作页 -->
						<el-form-item :label="$t('editor.fileFormBuilder.sheet_range')" prop="sheet_start">
							<el-input
								v-model.number="model.fileProperty.sheet_start"
								maxlength="3"
								show-word-limit
								size="mini"
								onkeyup="model.fileProperty.sheet_start = model.fileProperty.sheet_start.replace(/[^\d.]/g,'');"
								:placeholder="$t('editor.fileFormBuilder.sheet_start')"
							></el-input>
							<span class="separate"> ~ </span>
							<el-input
								v-model="model.fileProperty.sheet_end"
								maxlength="3"
								show-word-limit
								size="mini"
								onkeyup="model.fileProperty.sheet_end = model.fileProperty.sheet_end.replace(/[^\d.]/g,'');"
								:placeholder="$t('editor.fileFormBuilder.sheet_end')"
							></el-input>
						</el-form-item>
						<!--字段范围 -->
						<el-form-item
							:label="$t('editor.fileFormBuilder.excel_header_type')"
							class="headerType"
							prop="excel_header_start"
						>
							<div>
								<el-radio-group
									v-model="model.fileProperty.gridfs_header_type"
									@change="changeHeaderType"
								>
									<el-radio label="specified_line">{{
										$t('editor.fileFormBuilder.excel_header_coordinate')
									}}</el-radio>
									<el-radio label="custom">{{
										$t('editor.fileFormBuilder.excel_header_range')
									}}</el-radio>
								</el-radio-group>
								<el-input
									v-model="model.fileProperty.gridfs_header_config"
									size="mini"
									:placeholder="$t('editor.fileFormBuilder.header_type_custom_label')"
									v-show="model.fileProperty.gridfs_header_type === 'custom'"
								></el-input>
								<div
									v-show="model.fileProperty.gridfs_header_type !== 'custom'"
									class="excel_header_start"
								>
									<el-input
										v-model="model.fileProperty.excel_header_start"
										size="mini"
										:placeholder="$t('editor.fileFormBuilder.excel_header_start')"
									></el-input>
									<span class="separate"> ~ </span>
									<el-input
										v-model="model.fileProperty.excel_header_end"
										size="mini"
										:placeholder="$t('editor.fileFormBuilder.excel_header_end')"
									></el-input>
								</div>
							</div>
						</el-form-item>
						<el-form-item v-show="model.fileProperty.gridfs_header_type !== 'custom'"
							><div style="color: #999">
								{{ $t('editor.fileFormBuilder.excel_cell_point') }}
							</div></el-form-item
						>
						<!--字段获取方式 -->
						<el-form-item :label="$t('editor.fileFormBuilder.header_mapping')" class="excelHeaderType">
							<el-radio-group v-model="model.fileProperty.excel_header_type">
								<el-radio label="value">{{
									$t('editor.fileFormBuilder.header_mapping_value')
								}}</el-radio>
								<el-radio label="index">{{
									$t('editor.fileFormBuilder.header_mapping_index')
								}}</el-radio>
							</el-radio-group>
						</el-form-item>
						<!-- 内容 -->
						<el-form-item
							:label="$t('editor.fileFormBuilder.excel_value_type')"
							prop="excel_value_start"
							class="excel_value_start"
						>
							<el-input
								v-model.number="model.fileProperty.excel_value_start"
								maxlength="10"
								show-word-limit
								size="mini"
								onkeyup="model.fileProperty.excel_value_start = model.fileProperty.excel_value_start.replace(/[^\d.]/g,'');"
								:placeholder="$t('editor.fileFormBuilder.excel_value_start')"
							></el-input>
							<span class="separate"> ~ </span>
							<el-input
								v-model.number="model.fileProperty.excel_value_end"
								maxlength="10"
								show-word-limit
								size="mini"
								onkeyup="model.fileProperty.excel_value_end = model.fileProperty.excel_value_end.replace(/[^\d.]/g,'');"
								:placeholder="$t('editor.fileFormBuilder.excel_value_end')"
							></el-input>
						</el-form-item>
						<el-form-item
							><div style="margin-top: -10px;color: #999">
								{{ $t('editor.fileFormBuilder.excel_value_range') }}
							</div></el-form-item
						>
					</el-form>
				</div>
				<el-button
					size="mini"
					style="margin-top: 10px;background:#4aaf47;color: #fff"
					@click="loadSchema"
					:disabled="disabled"
					:loading="reloadingSchema"
					>{{ $t('editor.fileFormBuilder.loadSchema') }}</el-button
				>
				<div class="schema-tip">{{ $t('editor.fileFormBuilder.loadSchemaTip') }}</div>
				<div class="e-entity-wrap">
					<entity
						:schema="convertSchemaToTreeData(schema)"
						:editable="false"
						style="margin: 0;margin-top: 20px"
					></entity>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import _ from 'lodash';
import formConfigs from './config';
import Entity from '../link/Entity';
import { mergeJoinTablesToTargetSchema, convertSchemaToTreeData, removeDeleted } from '../../util/Schema';
import ws from '../../../api/ws';
let editorMonitor = null;
let fieldsNamesMap = {};
export default {
	name: 'FileNode',
	components: { Entity },
	data() {
		let validateExcelHeader = (rule, value, callback) => {
			let start = this.model.fileProperty.excel_header_start;
			let end = this.model.fileProperty.excel_header_end;
			let config = this.model.fileProperty.gridfs_header_config;
			if (start === '') {
				callback(
					new Error(this.$t('editor.fileFormBuilder.excel_header_start') + this.$t('formBuilder.noneText'))
				);
			} else if (end === '') {
				callback(
					new Error(this.$t('editor.fileFormBuilder.excel_header_end') + this.$t('formBuilder.noneText'))
				);
			} else if (config === '' && this.model.fileProperty.gridfs_header_type === 'custom') {
				callback(new Error(this.$t('editor.fileFormBuilder.header_type_required')));
			} else if ((!/^[A-Z]+[1-9]+$/.test(start) && start !== '') || (!/^[A-Z]+[1-9]+$/.test(end) && end !== '')) {
				callback(new Error(this.$t('editor.fileFormBuilder.excel_cell_tip')));
			}
		};
		let validateSheet = (rule, value, callback) => {
			let start = this.model.fileProperty.sheet_start;
			let end = this.model.fileProperty.sheet_end;
			if (start === '') {
				callback(new Error(this.$t('editor.fileFormBuilder.sheet_start') + this.$t('formBuilder.noneText')));
			} else if (end === '') {
				callback(new Error(this.$t('editor.fileFormBuilder.sheet_end') + this.$t('formBuilder.noneText')));
			} else if (start > end) {
				callback(new Error(this.$t('editor.fileFormBuilder.excel_value_end_gt_start')));
			}
		};
		return {
			disabled: false,
			model: {
				type: '',
				database_type: '',
				tableName: '',
				name: '',
				connectionId: '',
				fileProperty: {
					fileFilter: 'include',
					include_filename: '',
					exclude_filename: '',
					file_schema: '',
					excel_password: '',
					excel_plain_password: '',
					json_type: 'ArrayBegin',
					data_content_xpath: '',
					seperate: ',',
					gridfs_header_config: '',
					gridfs_header_type: 'specified_line',
					excel_header_start: 'A1',
					excel_header_end: 'Z1',
					excel_header_type: 'value',
					excel_value_start: 2,
					excel_value_end: '',
					sheet_start: 1,
					sheet_end: 1,
					file_type: '',
					disabled: false
				},
				isFormValid: true
			},
			config: {
				form: {},
				items: []
			},
			fileConfig: {
				size: 'mini',
				disabled: false,
				placeholder: this.$t('editor.fileFormBuilder.fileSourcePlaceholder'),
				loading: false,
				filterable: true,
				options: []
			},
			fileNames: '',
			schema: '',
			rules: {
				gridfs_header_config: [
					{
						required: true,
						message: this.$t('editor.fileFormBuilder.gridfs_header_config'),
						trigger: 'blur'
					}
				],
				excel_header_start: [
					{
						validator: validateExcelHeader,
						trigger: 'blur'
					}
				],
				sheet_start: [
					{
						validator: validateSheet,
						trigger: 'blur'
					}
				]
			},
			dialogDatabaseTypeVisible: false,
			reloadingSchema: false
		};
	},
	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		},
		'model.connectionId': {
			immediate: true,
			handler() {
				if (this.model.connectionId) {
					this.fileNames = fieldsNamesMap[this.model.connectionId];
				}
			}
		}
	},
	mounted() {
		this.loadFileSource();
		let self = this,
			schema = null,
			templeSchema = [];
		ws.ready(() => {
			ws.on('execute_load_schema_result', res => {
				this.reloadingSchema = false;
				if (res.status === 'SUCCESS' && res.result) {
					this.$message.success(this.$t('message.reloadSchemaSuccess'));
					templeSchema = res.result;
					if (templeSchema && templeSchema.length) {
						templeSchema.forEach(item => {
							if (item.connId === this.model.connectionId) {
								schema = item.schema;
								if (!this.model.tableName || this.model.tableName === '') {
									this.model.tableName = item.tableName;
								}
							}
						});
					}
				} else {
					schema = null;
					this.$message.error(res.error);
				}
				self.$nextTick(() => {
					self.$emit('schemaChange', _.cloneDeep(schema));
					self.schema = schema;
				});
			});
		});
	},
	methods: {
		convertSchemaToTreeData,
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			this.model.fileProperty['file_type'] = this.model.database_type;
			editorMonitor = vueAdapter.editor;
			this.schema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			let fields = this.schema.fields || [];
			if (fields.length) {
				fields = removeDeleted(fields);
			}
			cell.on('change:outputSchema', () => {
				this.schema = cell.getOutputSchema();
			});
			let func = formConfigs[data.database_type];
			if (func) {
				let config = func(this);
				let items = config.items || [];
				let fileProperty = this.model.fileProperty;
				items.forEach(it => {
					let value = fileProperty[it.field];
					if (!value && value !== 0) {
						value = '';
					}
					this.$set(this.model.fileProperty, it.field, value);
					if (it.type === 'field') {
						let options = [];
						fields.forEach(f => {
							if (f.field_name) {
								options.push({
									label: f.field_name,
									value: f.field_name
								});
							}
						});
						it.options = options;
					}
				});
				this.config = Object.assign({}, this.config, config);
			}
		},
		getData() {
			let result = _.cloneDeep(this.model);
			result.name = result.tableName || result.name;
			return result;
		},
		//change headerType 清空表单校验
		changeHeaderType() {
			this.$refs.excelForm.resetFields();
			this.model.fileProperty.excel_header_start = 'A1';
			this.model.fileProperty.excel_header_end = 'Z1';
			this.model.fileProperty.gridfs_header_config = '';
		},
		getImgByType(type) {
			if (!type) {
				return;
			}
			return require(`../../../../static/image/formBuilder/${type.toLowerCase()}.png`);
		},
		async loadFileSource() {
			this.fileConfig.loading = true;
			let result = await this.$api('connections').get({
				filter: JSON.stringify({
					where: {
						database_type: 'file'
					},
					fields: {
						name: 1,
						id: 1,
						database_type: 1,
						connection_type: 1,
						status: 1,
						schema: 1
					}
				})
			});
			this.fileConfig.loading = false;
			if (result.data) {
				this.fileConfig.options = result.data.map(item => {
					return {
						id: item.id,
						name: item.name,
						database_type: item.database_type,
						label: `${item.name} (${item.status})`,
						value: item.id
					};
				});
				result.data.map(s => (fieldsNamesMap[s.id] = s.schema));
			}
		},
		loadDataModels(connectionId) {
			if (!connectionId) {
				return;
			}
			this.$api('connections')
				.get([connectionId])
				.then(result => {
					if (result.data && result.data.schema) {
						//console.log(result.data);
					}
				});
		},
		loadSchema() {
			if (this.model.fileProperty.fileFilter === 'include') {
				this.model.fileProperty.exclude_filename = '';
			} else {
				this.model.fileProperty.include_filename = '';
			}
			let msg = {
				type: 'reloadSchema',
				data: {
					tables: [
						{
							connId: this.model.connectionId,
							userId: this.$cookie.get('user_id'),
							tableName: this.model.tableName,
							fileProperty: Object.assign({}, this.model.fileProperty, {
								file_type: this.model.database_type
							})
						}
					]
				}
			};
			this.reloadingSchema = true;
			ws.ready(() => {
				ws.send(msg);
			});
		},
		setDisabled(disabled) {
			this.disabled = disabled;
			this.config.form.disabled = disabled;
			this.fileConfig.disabled = disabled;
		},
		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>
<style lang="less" scoped>
.editor-file-form-builder {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	height: 100%;
	box-sizing: border-box;
	.main {
		padding: 20px;
		box-sizing: border-box;
		.form-builder-header {
			display: flex;
			justify-content: flex-start;
			.img-box {
				display: flex;
				width: 84px;
				height: 48px;
				justify-content: center;
				align-items: center;
				border-radius: 3px;
				margin-right: 20px;
				img {
					width: 100%;
				}
			}
			.content-box {
				.addBtn {
					color: #48b6e2;
					cursor: pointer;
					font-size: 12px;
					margin-top: 5px;
					margin-left: 10px;
				}
				.tip {
					width: 97%;
					font-size: 12px;
					color: #999;
					margin-top: 5px;
					line-height: 18px;
				}
			}
			.content {
				display: flex;
				align-items: center;
				font-size: 18px;
				white-space: nowrap;
				word-break: break-word;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		}
		.form-builder {
			margin-top: 10px;
			overflow-y: auto;
			.file-source-label {
				vertical-align: middle;
				font-size: 12px;
				color: #606266;
				-webkit-box-sizing: border-box;
				box-sizing: border-box;
				padding-bottom: 0px;
				float: none;
				display: inline-block;
				text-align: left;
				line-height: 28px;
			}
			.file-source-label:before {
				content: '*';
				color: #f56c6c;
				margin-right: 4px;
			}
			.form-excel-wrap {
				font-size: 12px;
				padding: 15px 0;
				border: 1px solid rgba(222, 222, 228, 100);
				.separate {
					margin: 0 10px;
				}
			}
			.schema-tip {
				color: #999;
				margin-top: 5px;
				font-size: 12px;
			}
		}
	}
}
</style>
<style lang="less">
.editor-file-form-builder .form-excel-wrap {
	.el-form-item {
		margin-bottom: 0;
	}
	.el-form-item__content {
		display: flex;
		font-size: 12px;
		margin-right: 20px;
	}
	.el-form-item__error {
		padding-top: 0;
	}
	.el-form-item__label:before {
		content: '*';
		color: #f56c6c;
		margin-right: 4px;
	}
	.excel_value_start {
		.el-form-item__label:before {
			content: '';
		}
	}
	.el-form-item__label {
		font-size: 12px;
	}
	.el-radio__label {
		font-size: 12px;
	}
	.headerType .el-form-item__content {
		flex-direction: column;
		.excel_header_start {
			display: flex;
			font-size: 12px;
		}
	}
	.excel_header_start {
	}
	.excelHeaderType {
		.el-form-item__content {
			display: block;
			font-size: 12px;
		}
	}
}
</style>
