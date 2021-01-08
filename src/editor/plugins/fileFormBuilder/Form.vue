<template>
	<div class="editor-file-form-builder">
		<div class="main">
			<header class="form-builder-header">
				<div class="img-box">
					<img :src="getImgByType(model.database_type)" />
				</div>
				<div class="content-box">
					<div class="content">
						{{ model.name }}
						<div class="addBtn" @click="dialogDatabaseTypeVisible = true">
							{{ $t('connection.change') }}
						</div>
					</div>
					<div class="tip">
						{{ $t('dataForm.form.guide') }}
						<a style="color: #48B6E2" href="https://docs.tapdata.net/data-source">{{
							$t('dataForm.form.guideDoc')
						}}</a>
					</div>
				</div>
			</header>
			<div class="form-builder">
				<span class="file-source-label">{{ $t('editor.fileFormBuilder.fileSource') }}</span>
				<FbSelect v-model="model.formData.connectionId" :config="fileConfig"></FbSelect>
				<form-builder ref="form" v-model="model.formData" :config="config"></form-builder>
				<div class="form-excel-wrap" v-if="model.database_type === 'excel'">
					<el-form label-width="80px" label-position="right">
						<!--字段获取方式 -->
						<el-form-item :label="$t('editor.fileFormBuilder.excel.header_mapping')" class="headerType">
							<div>
								<el-radio-group v-model="model.formData.gridfs_header_type">
									<el-radio label="specified_line">表头区域选取</el-radio>
									<el-radio label="custom">自定义字段</el-radio>
								</el-radio-group>
								<el-input
									v-model="model.formData.gridfs_header_config"
									size="mini"
									v-show="model.formData.gridfs_header_type === 'custom'"
								></el-input>
								<div v-show="model.formData.gridfs_header_type !== 'custom'" class="excel_header_start">
									<el-input v-model="model.formData.excel_header_start" size="mini"></el-input>
									<span class="separate"> ~ </span>
									<el-input v-model="model.formData.excel_header_end" size="mini"></el-input>
								</div>
								<span>{{ $t('editor.fileFormBuilder.excel.excel_cell_point') }}</span>
							</div>
						</el-form-item>
						<!--表头映射 -->
						<el-form-item
							:label="$t('editor.fileFormBuilder.excel.header_mapping')"
							class="excelHeaderType"
						>
							<el-radio-group v-model="model.formData.excel_header_type">
								<el-radio label="value">{{
									$t('editor.fileFormBuilder.excel.header_mapping_value')
								}}</el-radio>
								<el-radio label="index">{{
									$t('editor.fileFormBuilder.excel.header_mapping_index')
								}}</el-radio>
							</el-radio-group>
						</el-form-item>
						<!-- 内容 -->
						<el-form-item :label="$t('editor.fileFormBuilder.excel.excel_header_range')">
							<el-input v-model="model.formData.excel_value_start" size="mini"></el-input>
							<span class="separate"> ~ </span>
							<el-input v-model="model.formData.excel_value_end" size="mini"></el-input>
						</el-form-item>
						<!--工作页 -->
						<el-form-item :label="$t('editor.fileFormBuilder.excel.excel_header_range')">
							<el-input v-model="model.formData.sheet_start" size="mini"></el-input>
							<span class="separate"> ~ </span>
							<el-input v-model="model.formData.sheet_end" size="mini"></el-input>
						</el-form-item>
					</el-form>
				</div>
				<el-button size="mini" style="margin-top: 10px" type="primary" @click="loadSchema">加载模型</el-button>
			</div>
		</div>
	</div>
</template>
<script>
import _ from 'lodash';
import formConfigs from './config';
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema';
import ws from '../../../api/ws';
let editorMonitor = null;
export default {
	name: 'FileNode',
	data() {
		let self = this;
		return {
			disabled: false,
			model: {
				type: '',
				formData: {
					connectionId: ''
				},
				script: '',
				isFormValid: true
			},
			config: {
				form: {},
				items: []
			},
			fileConfig: {
				size: 'mini',
				placeholder: this.$t('editor.fileFormBuilder.fileSourcePlaceholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.handlerConnectionChange();
					}
				},
				options: []
			},
			dialogDatabaseTypeVisible: false
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
				this.loadDataModels(this.model.connectionId);
			}
		}
	},
	mounted() {
		this.loadFileSource();
		ws.ready(() => {
			ws.on('execute_load_schema_result', res => {
				if (res.status === 'SUCCESS' && res.result && res.result.length) {
					this.$message.success(this.$t('message.reloadSchemaSuccess'));
					//console.log(res.status);
				} else {
					this.$message.error(this.$t('message.reloadSchemaError'));
				}
				// self.$nextTick(() => {
				// 	if (schema) {
				// 		self.$emit('schemaChange', _.cloneDeep(schema));
				// 		self.defaultSchema = schema;
				// 		self.$message.success(this.$t('message.reloadSchemaSuccess'));
				// 	}
				// });
			});
		});
	},
	methods: {
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			editorMonitor = vueAdapter.editor;
			let schema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			let fields = schema.fields || [];
			if (fields.length) {
				fields = removeDeleted(fields);
			}
			let func = formConfigs[data.database_type];
			if (func) {
				let config = func(this);
				let items = config.items || [];
				let formData = this.model.formData;
				items.forEach(it => {
					let value = formData[it.field];
					if (!value && value !== 0) {
						value = '';
					}
					this.$set(this.model.formData, it.field, value);
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
			return _.cloneDeep(this.model);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
			this.formConfig.form.disabled = true;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
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
			}
		},
		handlerConnectionChange() {
			//console.log('111');
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
			let msg = {
				type: 'reloadSchema',
				data: {
					tables: [
						{
							connId: this.model.formData.connectionId,
							userId: this.$cookie.get('user_id'),
							fileProperty: Object.assign({}, this.model.formData, {
								file_type: this.model.database_type
							})
						}
					]
				}
			};
			ws.ready(() => {
				ws.send(msg);
			});
		}
	}
};
</script>
<style lang="less" scoped>
.editor-file-form-builder {
	padding: 20px;
	height: 100%;
	overflow: auto;
	box-sizing: border-box;
	.main {
		height: 100%;
		box-sizing: border-box;
		.form-builder-header {
			display: flex;
			justify-content: flex-start;
			margin-top: 20px;
			.img-box {
				display: flex;
				width: 48px;
				height: 48px;
				justify-content: center;
				align-items: center;
				background: #fff;
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
					font-size: 12px;
					color: #999;
					margin-top: 5px;
					line-height: 18px;
				}
			}
			.content {
				display: flex;
				align-items: center;
				font-size: 22px;
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
			.form-excel-wrap {
				font-size: 12px;
				padding-top: 10px;
				border: 1px solid rgba(222, 222, 228, 100);
				.separate {
					margin: 0 10px;
				}
			}
		}
	}
}
</style>
<style lang="less">
.editor-file-form-builder .form-excel-wrap {
	.el-form-item {
		margin-bottom: 5px;
	}
	.el-form-item__content {
		display: flex;
		font-size: 12px;
		margin-right: 20px;
	}
	.headerType .el-form-item__content {
		flex-direction: column;
		.excel_header_start {
			display: flex;
			font-size: 12px;
		}
	}
	.excelHeaderType .el-form-item__content {
		display: block;
		font-size: 12px;
	}
}
</style>
