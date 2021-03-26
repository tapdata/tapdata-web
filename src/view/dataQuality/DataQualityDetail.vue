<template>
	<section class="data-quality-detail-wrap">
		<TablePage
			v-if="showTable"
			ref="table"
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
							:placeholder="'选择违反的质量规则'"
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
				<el-button class="action-btn" size="mini" @click="filterOpen">
					<i class="iconfont icon-daoru back-btn-icon" />
					<span>列过滤</span>
				</el-button>

				<el-button v-readonlybtn="'new_model_creation'" class="action-btn" size="mini" @click="batchOpen">
					<i class="iconfont icon-daoru back-btn-icon" />
					<span>批量修改</span>
				</el-button>
			</div>

			<!-- 列表项 -->
			<el-table-column v-for="(item, index) in headers.filter(v => v.visible)" :key="index" :label="item.text">
				<template slot-scope="scope">
					<div v-if="scope.row.wrongFields[item.text]">
						<div v-if="scope.row.edit">
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
									保存
								</el-button>
								<el-button @click="editCancel" class="btn-text" type="text" size="small">
									取消
								</el-button>
							</div>
						</div>
						<div
							v-else
							@dblclick="editItem(scope.row, item.text)"
							:title="scope.row.wrongFields[item.text]"
							style="color: red;"
						>
							{{
								item.format === 'date-time'
									? $moment(scope.row[item.text]).format('YYYY-MM-DD HH:mm:ss')
									: scope.row[item.text] || ''
							}}
						</div>
					</div>
					<div v-else>
						{{
							item.format === 'date-time'
								? $moment(scope.row[item.text]).format('YYYY-MM-DD HH:mm:ss')
								: scope.row[item.text] || ''
						}}
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.actions')" fixed="right" width="120">
				<template slot-scope="scope">
					<el-button class="btn-text" type="text" size="small" @click="detailOpen(scope.row)">
						浏览详情
					</el-button>

					<el-button class="btn-text" type="text" size="small" @click="remove(scope.row)">
						删除
					</el-button>
				</template>
			</el-table-column>
		</TablePage>

		<!-- 批量修改弹框 -->
		<el-dialog width="500px" :title="'批量修改'" :close-on-click-modal="false" :visible.sync="batchVisible">
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
			:title="'字段过滤'"
			:close-on-click-modal="false"
			:visible.sync="filterVisible"
		>
			<div class="text-rf">
				<el-switch active-text="全选" v-model="all"> </el-switch>
			</div>

			<el-table :data="filterArr" height="350" class="filter-table">
				<el-table-column prop="date" label="字段名" width="330">
					<template slot-scope="scope">
						<div :style="{ color: errorObj[scope.row.text] ? 'red' : undefined }">
							{{ scope.row.text }}
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="操作">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.visible" :active-text="scope.row.visible ? '显示' : '不显示'">
						</el-switch>
					</template>
				</el-table-column>
			</el-table>

			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="filterVisible = false">取 消</el-button>
				<el-button size="small" type="primary" @click="filterOk">保 存</el-button>
			</div>
		</el-dialog>

		<!-- 详情弹框 -->
		<el-dialog
			custom-class="data-quality-detail-json-dialog"
			width="600px"
			title="业务数据"
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
			showTable: false, // 是否渲染表单
			tableData: [], // 列表数据
			editValue: '', // 要单独编辑的字段的值
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
			if (this.tableData.length) {
				let obj = {};
				this.tableData.forEach(v => {
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
						label: '选择违反的质量规则',
						field: 'rule',
						options: this.rulesList.map(v => ({
							label: v.displayName,
							value: v.displayName
						})),
						rules: [{ required: true, message: '请选择违反的质量规则' }]
					},
					{
						type: 'input',
						label: '输入要修改的内容',
						field: 'value',
						required: true,
						rules: [
							{ required: true, message: '请输入修改内容' },
							{ max: 100, message: '长度不能超过100' }
						]
					}
				]
			};
		}
	},

	created() {
		this.getCollection();
	},

	methods: {
		// 获取字段
		getCollection() {
			const { collection_name, connection_id } = this.$route.query;

			this.$api('modules')
				.getByCollectionName({
					connection_id,
					collection_name
				})
				.then(({ data }) => {
					if (data) {
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
					} else {
						this.$message.info('请先基于这张表发布一个api');
					}
				});

			this.apiServer();
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

				this.showTable = true;
			} else {
				this.$message.info('没有可用API服务器');
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

			if (!this.apiClient) return;
			return this.apiClient
				.find(filter)
				.then(result => {
					if (result.status === 200) {
						let resdata = result.data.data || [];
						resdata.map(record => {
							let obj = {};
							record.__tapd8.hitRules.forEach(v => {
								obj[v.fieldName] = v.rules;
							});
							record.wrongFields = obj;
							return record;
						});
						this.table.setCache({ rule });
						this.tableData = resdata;
						return {
							total: result.data.total.count,
							data: resdata
						};
					} else {
						this.$message.info(
							`this.i18n.map[result.msg.split(' ').join('_')]` || result.msg || result.data
						);
					}
				})
				.catch(err => {
					// const msg = {
					//   '504': '连接API服务器超时,请检查API服务器是否已启动。',
					//   '500': `在API服务器上没有找到 ${this.$route.query['id']} 的API，请检查是否已发布。`,
					//   '401': '您无权访问API。'
					// }
					if (err.response && err.response.status === 404) {
						this.$message.info('api server not start?');
					} else {
						this.$message.info(err.message);
					}
				});
		},

		// 删除行
		remove(item) {
			this.$confirm('是否删除当前行？', this.$t('message.prompt'), {
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
			this.$refs.batchForm.validate(valid => {
				if (valid) {
					let fieldName = this.batchForm.rule.split('-->')[0],
						rule = this.batchForm.rule.split('-->')[1],
						value = this.batchForm.value;

					let vschema = this.buildAjvSchema(fieldName, eval('(' + rule + ')')),
						item = {};
					item[fieldName] = this.setType(fieldName, value);
					if (!this.ajv.validate(vschema, item)) this.$message.info('输入的内容不符合选择的数据规则');
					else this.editAllAction();
				}
			});
		},
		// 批量修改请求
		async editAllAction() {
			let fieldName = this.batchForm.rule.split('-->')[0],
				rule = this.batchForm.rule.split('-->')[1],
				value = this.batchForm.value;
			let where = {
				'__tapd8.hitRules.fieldName': fieldName,
				'__tapd8.hitRules.rules': rule,
				'__tapd8.result': 'invalid'
			};

			let setter = {};
			setter[fieldName] = this.setType(fieldName, value);
			let paramas = { $pull: { '__tapd8.hitRules': { rules: rule, fieldName: fieldName } }, $set: setter };
			this.batchLoading = true;
			let result = await this.apiClient.updateAll({ where: JSON.stringify(where) }, paramas);
			if (result.success) {
				await this.apiClient.updateAll(
					{ where: JSON.stringify({ '__tapd8.hitRules': { size: 0 } }) },
					{ $unset: { '__tapd8.result': 1, '__tapd8.hitRules': 1 } }
				);
				this.table.fetch();
				let edidobj = { biz_module: 'dataQuality' };
				edidobj.desc = {
					_id: '',
					biz_module: 'dataQuality',
					last_updated: new Date().toTimeString(),
					desc: 'allUpdate or create dataQuality',
					modelName: 'dataQuality',
					requestMethod: 'POST',
					befroe: rule, //字段规则
					after: value, //修改内容
					name: fieldName,
					apititle: this.$route.query['connection_id']
				};
				let resultedidobj = await this.$api('UserLogs').post(edidobj);
				if (resultedidobj.response.status != 200) {
					this.$message.error('添加用户操作日志失败');
				}
				this.$message.success('操作成功，一共修改' + this.table.page.total + '条数据');
				this.batchCancel();
			} else {
				this.$message.error('更新失败');
				this.batchLoading = false;
			}
		},
		// 批量修改取消
		batchCancel() {
			this.$refs.batchForm.resetFields();
			this.batchVisible = false;
			this.batchLoading = false;
		},
		// 双击编辑字段
		editItem(item, key) {
			this.editValue = item[key];
			this.table.list = this.table.list.map(v => {
				v.edit = v === item;
				return v;
			});
			this.$nextTick(() => {
				if (this.$refs.editInput.length) {
					this.$refs.editInput.forEach(v => {
						v.focus();
					});
				} else {
					this.$refs.editInput.focus();
				}
			});
		},
		// 取消编辑字段
		editCancel() {
			this.table.list = this.table.list.map(v => {
				if (v.edit) {
					v.edit = false;
				}
				return v;
			});
		},
		// 确认编辑字段
		async editOk(item, key) {
			// 检验字段类型规则
			let hitRules = [];
			hitRules = item.__tapd8.hitRules.filter(it => it.fieldName == key);
			item[key] = this.setType(key, this.editValue);
			if (isNaN(item[key])) {
				this.$message.warning(
					'数据类型转换失败，期望==>' +
						this.fieldsDef[this.fieldsDef.findIndex(it => it.field_name == key)].java_type
				);
				return;
			}
			hitRules.forEach(it => {
				let vschema = this.buildAjvSchema(key, eval('(' + it.rules + ')'));
				if (this.ajv.validate(vschema, item)) {
					item.__tapd8.hitRules.splice(item.__tapd8.hitRules.indexOf(it), 1);
					item.wrongFields.splice(item.wrongFields.indexOf(key), 1);
				}
			});
			if (item.__tapd8.hitRules.length == 0) {
				item.__tapd8.hitRules = [];
				item.__tapd8.result = '';
			}

			// 发送请求
			this.editLoading = true;
			let saveItem = JSON.parse(JSON.stringify(item));
			saveItem[key] = this.editValue;
			delete saveItem.edit;
			delete saveItem.wrongFields;
			let result = await this.apiClient.updateById(item._id, saveItem);
			if (result.success) {
				this.table.list = this.table.list.map(v => {
					if (v === item) {
						v.edit = false;
						v[key] = this.editValue;
					}
					return v;
				});
				this.$message.success('保存成功');
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
				befroe: item[key],
				after: this.editValue,
				name: key,
				apititle: this.$route.query['connection_id']
			});
		},
		// 打开批量过滤弹框
		filterOpen() {
			this.filterArr = JSON.parse(JSON.stringify(this.headers));
			this.filterVisible = true;
		},
		// 确认提交批量过滤表单
		filterOk() {
			this.headers = JSON.parse(JSON.stringify(this.filterArr));
			this.filterVisible = false;
		},
		// 浏览当前行数据
		detailOpen(item) {
			let obj = { ...item };
			// 删除自定义的属性
			delete obj.wrongFields;
			delete obj.edit;
			this.jsonData = obj;
			this.detailVisible = true;
		},
		// 改变规则更新列表
		ruleChange() {
			this.table.fetch(1);
		},
		// 重置表单
		reset(name) {
			if (name === 'reset') {
				this.searchParams = {
					keyword: '',
					isFuzzy: true
				};
			}

			this.table.fetch(1);
		},
		// 按类型给字段赋值
		setType(fieldName, value) {
			let fieldDef = this.fieldsDef[this.fieldsDef.findIndex(it => it.field_name == fieldName)];
			if (['Short', 'Integer', 'Long'].includes(fieldDef.java_type)) return parseInt(value);
			else if (['Float', 'BigDecimal', 'Double'].includes(fieldDef.java_type)) return parseFloat(value);
			else if (fieldDef.java_type == 'Boolean') return value.toLowerCase().startsWith('t');
			else return value;
		},
		buildAjvSchema(fieldName, ruleObj) {
			let res = { properties: {} };
			Object.keys(ruleObj).forEach(key => {
				if (key == 'nullable') res.required = [fieldName];
				let keyField = (res.properties[fieldName] = {});
				if (key == 'range') {
					if (!ruleObj[key].none)
						keyField.range = [
							ruleObj[key].gte ? ruleObj[key].gte : ruleObj[key].gt,
							ruleObj[key].lte ? ruleObj[key].lte : ruleObj[key].lt
						];
					else if (ruleObj[key].gte || ruleObj[key].gt) {
						keyField.minimum = Number(ruleObj[key].gte ? ruleObj[key].gte : ruleObj[key].gt);
						if (ruleObj[key].gte) keyField.exclusiveMinimum = keyField.minimum;
					} else if (ruleObj[key].lte || ruleObj[key].lt) {
						keyField.maximum = Number(ruleObj[key].lte ? ruleObj[key].lte : ruleObj[key].lt);
						if (ruleObj[key].gte) keyField.exclusiveMaximum = keyField.maximum;
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
