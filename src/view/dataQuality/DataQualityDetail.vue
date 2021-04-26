<template>
	<section class="data-quality-detail-wrap" v-loading="!showTable">
		<TablePage
			v-if="showTable"
			ref="table"
			:hideClassify="true"
			:title="$t('dataQuality.title')"
			:desc="$t('dataQuality.desc')"
			:remoteMethod="getDataFromApi"
		>
			<!-- 面包屑 -->
			<div slot="header">
				<a class="page-header-title link" @click="$router.push({ name: 'dataQuality' })">
					{{ $t('dataQuality.title') }}
				</a>
				/
				<span class="page-header-title">{{ $route.query.source_name }}</span>
				<div class="page-header-desc">{{ $t('dataQuality.desc') }}</div>
			</div>

			<!-- 过滤项 -->
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-select
							@change="ruleChange"
							v-model="searchParams.rule"
							:placeholder="$t('dataQuality.verifyRuleTip')"
							clearable
							size="mini"
						>
							<el-option
								v-for="(opt, idx) in rulesList"
								:key="idx"
								:label="opt.displayName"
								:value="opt.rule"
							></el-option>
						</el-select>
					</li>
				</ul>
			</div>

			<!-- 页面操作 -->
			<div slot="operation">
				<div v-if="headers.length">
					<el-button class="action-btn" size="mini" @click="filterOpen">
						<i class="iconfont icon-guolv back-btn-icon" />
						<span>{{ $t('dataQuality.btnFilter') }}</span>
					</el-button>

					<el-button v-readonlybtn="'new_model_creation'" class="action-btn" size="mini" @click="batchOpen">
						<i class="iconfont icon-daoru back-btn-icon" />
						<span>{{ $t('dataQuality.btnBatch') }}</span>
					</el-button>
				</div>
			</div>

			<!-- 列表项 -->
			<el-table-column
				v-for="(item, index) in headers.filter(v => v.visible)"
				:key="index"
				min-width="120"
				:label="item.text"
			>
				<template slot-scope="scope">
					<div v-if="scope.row.wrongFields[item.text]">
						<div v-if="scope.row.editing && editCol === item.text">
							<el-input
								@keyup.enter.native="editOk(scope.row, item.text)"
								ref="editInput"
								v-model="editValue"
								class="edit-input"
								type="text"
								size="mini"
							/>
							<div>
								<el-button
									@click="editOk(scope.row, item.text)"
									:loading="editLoading"
									class="btn-text"
									type="text"
									size="small"
								>
									{{ $t('dataQuality.save') }}
								</el-button>
								<el-button @click="editCancel" class="btn-text" type="text" size="small">
									{{ $t('dataQuality.cancel') }}
								</el-button>
							</div>
						</div>
						<div
							v-else
							:title="scope.row.wrongFields[item.text]"
							@dblclick="editItem(scope.row, item.text)"
							style="color: #f15e5e;border: 1px solid #f15e5e;padding-left: 5px;min-height: 32px;"
						>
							{{
								item.format === 'date-time'
									? scope.row[item.text]
										? $moment(scope.row[item.text]).format('YYYY-MM-DD HH:mm:ss')
										: ''
									: scope.row[item.text] || scope.row[item.text] === 0
									? scope.row[item.text]
									: ''
							}}
						</div>
					</div>
					<div v-else>
						{{
							item.format === 'date-time'
								? scope.row[item.text]
									? $moment(scope.row[item.text]).format('YYYY-MM-DD HH:mm:ss')
									: ''
								: scope.row[item.text] || scope.row[item.text] === 0
								? scope.row[item.text]
								: ''
						}}
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.actions')" min-width="120" fixed="right">
				<template slot-scope="scope">
					<el-button class="btn-text" type="text" size="small" @click="detailOpen(scope.row)">
						{{ $t('dataQuality.viewDetail') }}
					</el-button>

					<el-button class="btn-text" type="text" size="small" @click="remove(scope.row)">
						{{ $t('dataQuality.del') }}
					</el-button>
				</template>
			</el-table-column>
		</TablePage>

		<!-- 批量修改弹框 -->
		<el-dialog
			width="500px"
			:title="$t('dataQuality.btnBatch')"
			:close-on-click-modal="false"
			:visible.sync="batchVisible"
		>
			<FormBuilder ref="batchForm" v-model="batchForm" :config="batchFormConfig" />

			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="batchCancel">
					{{ $t('message.cancel') }}
				</el-button>

				<el-button size="mini" type="primary" :loading="batchLoading" @click="batchOk">
					{{ $t('message.confirm') }}
				</el-button>
			</span>
		</el-dialog>

		<!-- 列过滤弹框 -->
		<el-dialog
			width="520px"
			custom-class="data-quality-detail-filter-dialog"
			:title="$t('dataQuality.fieldFilter')"
			:close-on-click-modal="false"
			:visible.sync="filterVisible"
		>
			<div class="text-rf">
				<el-switch :active-text="$t('dataQuality.allCheck')" v-model="all"> </el-switch>
			</div>

			<el-table :data="filterArr" height="350" class="filter-table">
				<el-table-column prop="date" :label="$t('dataQuality.fieldName')" width="330">
					<template slot-scope="scope">
						<div :style="{ color: errorObj[scope.row.text] ? 'red' : undefined }">
							{{ scope.row.text }}
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="name" :label="$t('dataQuality.actions')">
					<template slot-scope="scope">
						<el-switch
							v-model="scope.row.visible"
							:active-text="scope.row.visible ? $t('dataQuality.show') : $t('dataQuality.hide')"
						>
						</el-switch>
					</template>
				</el-table-column>
			</el-table>

			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="filterVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button size="small" type="primary" @click="filterOk">{{ $t('message.save') }}</el-button>
			</div>
		</el-dialog>

		<!-- 详情弹框 -->
		<el-dialog
			custom-class="data-quality-detail-json-dialog"
			width="600px"
			:title="$t('dataQuality.json')"
			:visible.sync="detailVisible"
		>
			<div class="json-box">
				<Jsonviewer :value="jsonData" :preview-mode="true" />
			</div>
		</el-dialog>
	</section>
</template>

<script>
import TablePage from '@/components/TablePage';
import Jsonviewer from 'vue-json-viewer';
import APIClient from '../../api/ApiClient';
import Ajv from 'ajv';

export default {
	name: 'DataQuality',

	components: {
		TablePage,
		Jsonviewer
	},

	data() {
		return {
			showTable: false, // 是否渲染表单
			searchParams: {
				// 搜索参数
				rule: '' // 所选规则
			},
			detailVisible: false, // 是否显示详情弹框
			jsonData: {}, // 行的详情
			modapiId: 0, // 获取的当前字段集合的标识id
			rulesList: [], // 违反的规则列表
			fieldsDef: [], // 字段配置详情
			apiClient: null, // api服务实例
			headers: [], // 当前显示的表头
			batchVisible: false, // 是否显示批量修改弹框
			batchLoading: false, // 确认loading
			batchForm: {
				rule: '', // 规则
				value: '' // 修改的内容
			},
			filterArr: [], // 字段过滤确认前表头数据
			filterVisible: false, // 是否显示字段过滤弹框
			collection: '', // 当前集合名称
			sortBy: '_id', // 默认排序字段
			descending: true, // 是否降序
			editValue: '', // 要单独编辑的字段的值
			editCol: '', // 当前编辑的字段名
			editLoading: false, // 编辑字段确认的loading
			ajv: new Ajv() // ajv校验实例
		};
	},

	computed: {
		// table组件dom实体
		table() {
			return this.$refs.table;
		},
		// 是否全选字段
		all: {
			get() {
				return this.filterArr.filter(v => v.visible).length === this.filterArr.length;
			},
			set(val) {
				this.filterArr = this.filterArr.map(v => ({
					...v,
					visible: val
				}));
			}
		},
		// 记录当前页所有数据那些字段有错误
		errorObj() {
			if (this.table && this.table.list && this.table.list.length) {
				let obj = {};
				this.table.list.forEach(v => {
					if (v.wrongFields) {
						for (let i in v.wrongFields) {
							obj[i] = v.wrongFields[i];
						}
					}
				});
				return obj;
			} else {
				return {};
			}
		},
		// 批量操作配置
		batchFormConfig() {
			return {
				items: [
					{
						type: 'select',
						label: this.$t('dataQuality.verifyRuleTip'),
						field: 'rule',
						options: this.rulesList.map(v => ({
							label: v.displayName,
							value: v.displayName
						})),
						rules: [{ required: true, message: this.$t('dataQuality.verifyRuleTip') }]
					},
					{
						type: 'input',
						label: this.$t('dataQuality.verifyContentTip'),
						field: 'value',
						required: true,
						rules: [
							{ required: true, message: this.$t('dataQuality.verifyContentTip') },
							{ max: 100, message: this.$t('dataQuality.verifyContentLength') }
						]
					}
				]
			};
		}
	},

	mounted() {
		this.getCollection();
	},

	methods: {
		// 获取字段信息
		getCollection() {
			const { collection_name, connection_id } = this.$route.query;

			this.$api('modules')
				.getByCollectionName({
					connection_id,
					collection_name
				})
				.then(({ data }) => {
					if (data.id) {
						this.modapiId = data.id;
						this.fieldsDef = data.fields || [];

						this.$api('DataRules')
							.get([`getRules?model_id=${this.modapiId}`])
							.then(({ data }) => {
								let list = data || [];
								if (list.length) {
									this.rulesList = list.map(it => {
										it.rule = it.rule_def.rules.replace(/\\\\/g, '\\');
										it.displayName = it.field_name + '-->' + it.rule;
										return it;
									});
								}
							});

						this.apiServer();
					} else {
						this.showTableFn();
						this.$message.info(this.$t('dataQuality.msgPostApi'));
					}
				});
		},
		// api服务
		async apiServer() {
			this.collection = this.$route.query['name'] || null;
			this.apiClient = new APIClient(this.collection || '');

			let apiServers = await this.$api('ApiServer').get({
				'filter[where][clientName]': 'Default APIServer'
			});
			if (apiServers.data.length > 0) {
				this.apiClient.setApiServer(apiServers.data[0]);
				let result = await this.apiClient.loadOpenAPI();
				if (result.success) {
					let collection = {
						collection: this.collection + '_v1',
						text: this.collection + '_v1',
						value: this.apiClient.uri + '/api/v1/' + this.collection,
						operationName: 'findPage'
					};

					Object.keys(result.data).forEach(apiName => {
						if (result.data[apiName].apiId === this.modapiId) {
							collection = {
								collection: apiName,
								text: apiName,
								value: result.data[apiName].api['findPage_post'].url,
								operationName: 'findPage_post'
							};
						}
					});
					this.apiClient.setCollection(collection);
				}
				let arrapi = {};
				for (let key in this.apiClient.collections) {
					if (this.apiClient.collections[key].apiId == this.modapiId)
						arrapi = this.apiClient.collections[key].properties;
				}

				for (let i in arrapi) {
					if (i != '__tapd8') {
						this.headers.push({ text: i, visible: true, format: arrapi[i].format });
					}
				}

				this.showTableFn();
			} else {
				this.$message.info(this.$t('dataQuality.msgNoValidApi'));
			}
		},
		// 获取列表数据
		getDataFromApi({ page }) {
			let { current, size } = page;
			let where = {
				// 查询条件
				'__tapd8.result': 'invalid'
			};

			// 搜索表单
			let { rule } = this.searchParams;
			if (rule) {
				where['__tapd8.hitRules'] = {
					elemMatch: {
						rules: rule
					}
				};
			}

			// 接口查询语句
			let filter = {
				order: `${this.sortBy} ${this.descending ? 'desc' : 'asc'}`,
				limit: size,
				skip: (current - 1) * size,
				where
			};

			if (!this.apiClient) return new Promise(resolve => resolve({ total: 0, data: [] }));

			return this.apiClient
				.find(filter)
				.then(result => {
					if (result.status === 200) {
						let resdata = result.data.data || [];
						resdata.map(record => {
							// 根据实际数据补充表格头部字段
							for (let i in record) {
								if (i !== '__tapd8' && !this.headers.filter(v => v.text === i).length) {
									this.headers.push({ text: i, visible: true, format: '' });
								}
							}

							let obj = {};
							if (record.__tapd8 && record.__tapd8.hitRules && record.__tapd8.hitRules.length) {
								record.__tapd8.hitRules.forEach(v => {
									obj[v.fieldName] = v.rules;
								});
							}
							record.wrongFields = obj;
							return record;
						});
						this.table.setCache({ rule });
						return {
							total: result.data.total.count,
							data: resdata
						};
					} else {
						this.$message.info(result.msg || result.data);
						return {
							total: 0,
							data: []
						};
					}
				})
				.catch(err => {
					// const msg = {
					//   '504': '连接API服务器超时,请检查API服务器是否已启动。',
					//   '500': `在API服务器上没有找到 ${this.$route.query['id']} 的API，请检查是否已发布。`,
					//   '401': '您无权访问API。'
					// }
					if (err.response && err.response.status === 404) {
						this.$message.info(this.$t('dataQuality.msgNotStartApi'));
					} else {
						this.$message.info(err.message);
					}
				});
		},
		// 删除行
		remove(item) {
			this.$confirm(this.$t('dataQuality.ifDel'), this.$t('message.prompt'), {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.apiClient
							.deleteById(item._id)
							.then(() => {
								this.$message.success(this.$t('message.deleteOK'));
								this.table.fetch();
								done();
							})
							.finally(() => {
								instance.confirmButtonLoading = false;
							});
					} else {
						done();
					}
				}
			});
		},
		// 打开批量修改弹框
		batchOpen() {
			this.batchVisible = true;
		},
		// 确认提交批量修改表单
		batchOk() {
			this.$refs.batchForm.validate(async valid => {
				if (!valid) {
					return;
				}
				let fieldName = this.batchForm.rule.split('-->')[0],
					rule = this.batchForm.rule.split('-->')[1],
					value = this.batchForm.value;

				let vschema = this.buildAjvSchema(fieldName, eval('(' + rule + ')')),
					setter = {};
				setter[fieldName] = this.setType(fieldName, value);

				// 校验数据
				if (!this.ajv.validate(vschema, setter)) {
					this.$message.warning(this.$t('dataQuality.unlikeAjv'));
					return;
				}

				let where = {
					'__tapd8.hitRules.fieldName': fieldName,
					'__tapd8.hitRules.rules': rule,
					'__tapd8.result': 'invalid'
				};
				let params = { $pull: { '__tapd8.hitRules': { rules: rule, fieldName: fieldName } }, $set: setter };
				this.batchLoading = true;
				// 发起修改请求
				let result = await this.apiClient.updateAll({ where: JSON.stringify(where) }, params);
				if (result.success) {
					// 修改没有违反规则的行的状态
					await this.apiClient.updateAll(
						{ where: JSON.stringify({ '__tapd8.hitRules': { size: 0 } }) },
						{ $unset: { '__tapd8.result': 1, '__tapd8.hitRules': 1 } }
					);
					this.$message.success(
						this.$t('dataQuality.allUpdateSuccessTip1') +
							this.table.page.total +
							this.$t('dataQuality.allUpdateSuccessTip2')
					);
					this.batchCancel();
					// 刷新列表
					this.table.fetch();
					// 提交日志
					await this.$api('UserLogs').post({
						biz_module: 'dataQuality',
						desc: {
							_id: '',
							biz_module: 'dataQuality',
							last_updated: new Date().toTimeString(),
							desc: 'allUpdate or create dataQuality',
							modelName: 'dataQuality',
							requestMethod: 'POST',
							before: rule, //字段规则
							after: value, //修改内容
							name: fieldName,
							apititle: this.$route.params.id
						}
					});
				} else {
					this.$message.error(this.$t('dataQuality.updateFail'));
					this.batchLoading = false;
				}
			});
		},
		// 批量修改取消
		batchCancel() {
			this.$refs.batchForm.resetFields();
			this.batchVisible = false;
			this.batchLoading = false;
		},
		// 双击编辑字段
		editItem(item, key) {
			this.editCol = key;
			this.editValue = item[key];
			this.table.list = this.table.list.map(v => {
				v.editing = v === item;
				return v;
			});
			this.$nextTick(() => {
				if (this.$refs.editInput && this.$refs.editInput.length) {
					this.$refs.editInput.forEach(v => {
						v.focus();
					});
				} else {
					this.$refs.editInput && this.$refs.editInput.focus();
				}
			});
		},
		// 取消编辑字段
		editCancel() {
			this.table.list = this.table.list.map(v => {
				if (v.editing) v.editing = false;
				return v;
			});
		},
		// 确认编辑字段
		async editOk(item, key) {
			// 检验字段类型规则
			let hitRules = [];
			let saveItem = JSON.parse(JSON.stringify(item)); // 临时存储即将修改的表单项的值
			hitRules = saveItem.__tapd8.hitRules.filter(it => it.fieldName == key);
			saveItem[key] = this.setType(key, this.editValue);
			if (saveItem[key] !== saveItem[key]) {
				this.$message.warning(
					this.$t('dataQuality.dataTypeError') +
						this.fieldsDef[this.fieldsDef.findIndex(it => it.field_name == key)].java_type
				);
				return;
			}
			hitRules.forEach(it => {
				// 若修改的值符合之前违反的规则，就去除当前字段错误标记
				let vschema = this.buildAjvSchema(key, eval('(' + it.rules + ')'));
				if (this.ajv.validate(vschema, saveItem)) {
					saveItem.__tapd8.hitRules.splice(saveItem.__tapd8.hitRules.indexOf(it), 1);
					saveItem.wrongFields[key] = undefined;
				}
			});
			if (saveItem.__tapd8.hitRules.length == 0) {
				// 检查当前行若没有错误标记，就去除当前行错误标记
				saveItem.__tapd8.result = '';
			}

			// 发送请求
			this.editLoading = true;
			// 处理手动添加的属性
			let attrs = {
				editing: saveItem.editing,
				wrongFields: saveItem.wrongFields
			};
			delete saveItem.editing;
			delete saveItem.wrongFields;
			let result = await this.apiClient.updateById(item._id, saveItem);
			if (result.success) {
				if (saveItem.__tapd8.result) {
					this.table.list = this.table.list.map(v => {
						if (v === item) {
							return { ...saveItem, ...attrs, editing: false };
						} else {
							return v;
						}
					});
				} else {
					this.table.list = this.table.list.filter(v => v !== item);
				}
				this.$message.success(this.$t('message.saveOK'));
			}
			this.editLoading = false;

			// 提交日志
			await this.$api('UserLogs').post({
				_id: item['_id'],
				biz_module: 'dataQuality',
				last_updated: new Date().toTimeString(),
				desc: 'Update or create dataQuality',
				modelName: 'dataQuality',
				requestMethod: 'POST',
				before: item[key],
				after: this.editValue,
				name: key,
				apititle: this.$route.params.id
			});
		},
		// 打开批量过滤弹框
		filterOpen() {
			this.filterArr = JSON.parse(JSON.stringify(this.headers));
			this.filterVisible = true;
		},
		// 确认提交批量过滤表单
		filterOk() {
			if (this.filterArr.filter(v => v.visible).length) {
				this.headers = JSON.parse(JSON.stringify(this.filterArr));
				this.filterVisible = false;
			} else {
				this.$message.warning(this.$t('dataQuality.columnTip'));
			}
		},
		// 浏览当前行数据
		detailOpen(item) {
			let obj = { ...item };
			// 删除自定义的属性
			delete obj.wrongFields;
			delete obj.editing;
			this.jsonData = obj;
			this.detailVisible = true;
		},
		// 改变规则更新列表
		ruleChange() {
			this.table.fetch(1);
		},
		// 显示表格
		showTableFn() {
			this.showTable = true;
			// 初始化缓存搜索参数
			this.$nextTick(() => {
				this.searchParams = Object.assign(this.searchParams, this.$refs.table.getCache());
			});
		},
		// 按类型给字段赋值
		setType(fieldName, value) {
			let fieldDef = this.fieldsDef[this.fieldsDef.findIndex(it => it.field_name == fieldName)];
			if (['Short', 'Integer', 'Long'].includes(fieldDef.java_type)) return parseInt(value);
			else if (['Float', 'BigDecimal', 'Double'].includes(fieldDef.java_type)) return parseFloat(value);
			else if (fieldDef.java_type == 'Boolean') return value.toLowerCase().startsWith('t');
			else return value;
		},
		// 创建ajv校验模式
		buildAjvSchema(fieldName, ruleObj) {
			let res = { properties: {} };
			Object.keys(ruleObj).forEach(key => {
				if (key == 'nullable') res.required = [fieldName];
				let keyField = (res.properties[fieldName] = {});
				if (key == 'range') {
					if (ruleObj[key].gte) {
						keyField.minimum = Number(ruleObj[key].gte);
					}
					if (ruleObj[key].gt) {
						keyField.exclusiveMinimum = Number(ruleObj[key].gt);
					}
					if (ruleObj[key].lte) {
						keyField.maximum = Number(ruleObj[key].lte);
					}
					if (ruleObj[key].lt) {
						keyField.exclusiveMaximum = Number(ruleObj[key].lt);
					}
				}
				if (key == 'type') {
					if (['int', 'long'].includes(ruleObj.type)) keyField.type = 'integer';
					else if (ruleObj[key] == 'double') keyField.type = 'number';
					else if (ruleObj[key] == 'bool') keyField.type = 'boolean';
					else if (ruleObj[key] == 'array') keyField.type = 'array';
					else if (ruleObj[key] == 'Object') keyField.type = 'object';
					else keyField.type = 'string';
				}
				if (key == 'regex') keyField.pattern = ruleObj[key];
				if (key == 'enum') keyField.enum = ruleObj[key];
			});
			return res;
		}
	}
};
</script>

<style lang="less">
.data-quality-detail-filter-dialog {
	.el-dialog__body {
		padding: 20px;
		.filter-table {
			max-height: 330px;
			overflow: auto;
			margin-top: 10px;
			thead tr th {
				background-color: #efefef;
			}
			.el-switch__label {
				font-size: 12px;
			}
		}
	}
}
.data-quality-detail-json-dialog {
	.json-box {
		margin-top: -20px;
		max-height: 520px;
		overflow: auto;
		.jv-light {
			background-color: #f8f8f8;
		}
	}
}
.data-quality-detail-wrap {
	.edit-input {
		> input {
			padding: 0 5px;
		}
	}
}
</style>

<style lang="less" scoped>
.data-quality-detail-wrap {
	height: 100%;
	.search-bar {
		display: flex;
		li + li {
			margin-left: 10px;
		}
	}
	.gray {
		color: #bbb;
	}
	.link {
		cursor: pointer;
		color: #f56c6c;
	}
	.iconfont {
		font-size: 12px;
	}
	.action-btn {
		padding: 7px;
		background-color: #f5f5f5;
	}
}
</style>
