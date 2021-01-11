<template>
	<section class="metadata-list-wrap">
		<TablePage
			ref="table"
			row-key="id"
			class="metadata-list"
			:title="$t('app.menu.' + $route.name)"
			:classify="{ authority: 'data_catalog_category_management', types: metaType }"
			:remoteMethod="getData"
			@selection-change="handleSelectionChange"
			@classify-submit="handleOperationClassify"
			@sort-change="handleSortTable"
		>
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-input
							clearable
							class="input-with-select"
							size="mini"
							v-model="searchParams.keyword"
							placeholder="请输入表名/数据库名"
							@input="table.fetch(1, 800)"
						>
							<el-select
								style="width: 120px;"
								slot="prepend"
								v-model="searchParams.isFuzzy"
								@input="table.fetch(1)"
							>
								<el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
								<el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
							</el-select>
						</el-input>
					</li>
					<li>
						<el-select
							clearable
							size="mini"
							v-model="searchParams.metaType"
							placeholder="请选择类型"
							@input="metaTypeChange"
						>
							<el-option
								v-for="opt in metaTypeOptions"
								:key="opt.value"
								:label="opt.label"
								:value="opt.value"
							></el-option>
						</el-select>
					</li>
					<li v-if="whiteList.includes(searchParams.metaType)">
						<el-select
							clearable
							filterable
							size="mini"
							v-model="searchParams.dbId"
							placeholder="请选择所属库"
							@input="table.fetch(1)"
						>
							<el-option
								v-for="opt in dbOptions"
								:key="opt.id"
								:label="opt.name"
								:value="opt.source.id"
							></el-option>
						</el-select>
					</li>
					<li>
						<el-button size="mini" type="text" @click="reset()">重置</el-button>
					</li>
				</ul>
			</div>
			<div slot="operation">
				<el-button
					v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
					v-readonlybtn="'data_catalog_category_application'"
					size="mini"
					class="btn"
					v-show="multipleSelection.length > 0"
					@click="$refs.table.showClassify(handleSelectTag())"
				>
					<i class="iconfont icon-biaoqian back-btn-icon"></i>
					<span> {{ $t('dataFlow.taskBulkTag') }}</span>
				</el-button>
				<el-button class="btn btn-create" size="mini" @click="openCreateDialog">
					<i class="iconfont icon-jia add-btn-icon"></i>
					<span>创建模型</span>
				</el-button>
			</div>
			<el-table-column
				v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
				type="selection"
				width="45"
				:reserve-selection="true"
			>
			</el-table-column>
			<el-table-column label="表名/所属库" prop="name" sortable="custom">
				<template slot-scope="scope">
					<div class="metadata-name">
						<div class="name ellipsis">
							<a @click="toDetails(scope.row)">
								{{ scope.row.name || scope.row.original_name }}
							</a>
							<el-tag
								v-if="scope.row.classifications && scope.row.classifications.length"
								class="tag"
								type="info"
								effect="dark"
								size="mini"
							>
								{{ scope.row.classifications[0].value }}
							</el-tag>
						</div>
						<div class="parent ellipsis" v-if="scope.row.database">
							{{ scope.row.database.name }}
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="类型" prop="meta_type" sortable="custom">
				<template slot-scope="scope">
					{{ $t('metadata.metaType.' + scope.row.meta_type) }}
				</template>
			</el-table-column>
			<el-table-column label="更新用户" prop="last_user_name" sortable="custom"></el-table-column>
			<el-table-column label="更新时间" prop="last_updated" sortable="custom">
				<template slot-scope="scope">
					{{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button size="mini" type="text" @click="toDetails(scope.row)">详情</el-button>
					<el-button size="mini" type="text" @click="changeName(scope.row)">改名</el-button>
					<el-button size="mini" type="text" @click="remove(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</TablePage>
		<el-dialog width="400px" :title="$t('metadata.createNewModel')" :visible.sync="createDialogVisible">
			<FormBuilder ref="form" v-model="createForm" :config="createFormConfig"></FormBuilder>
			<span slot="footer" class="dialog-footer">
				<el-button @click="createDialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="createNewModel()" size="mini">{{ $t('message.confirm') }}</el-button>
			</span>
		</el-dialog>
	</section>
</template>

<script>
import TablePage from '@/components/TablePage';
import { toRegExp } from '../../util/util';

export default {
	components: {
		TablePage
	},
	data() {
		return {
			title: '',
			whiteList: ['table', 'collection', 'mongo_view', 'view'],
			searchParams: {
				keyword: '',
				isFuzzy: true,
				metaType: '',
				dbId: ''
			},
			order: 'last_updated DESC',
			dbOptions: [],
			metaTypeOptions: 'database|job|dataflow|api|table|view|collection|mongo_view|directory|ftp|apiendpoint'
				.split('|')
				.map(v => {
					return {
						label: this.$t('metadata.metaType.' + v),
						value: v
					};
				}),
			list: null,
			multipleSelection: [],
			createDialogVisible: false,
			createForm: {
				model_type: 'collection',
				database: '',
				tableName: ''
			},
			createFormConfig: {
				form: {
					labelPosition: 'right',
					labelWidth: '80px'
				},
				items: [
					{
						type: 'select',
						label: '类型',
						field: 'model_type',
						options: ['collection', 'mongo_view'].map(t => ({
							label: this.$t('metadata.metaType.' + t),
							value: t
						})),
						required: true
					},
					{
						type: 'select',
						label: '数据库',
						field: 'database',
						options: [],
						required: true
					},
					{
						type: 'input',
						label: '表名称',
						field: 'tableName',
						rules: [
							{
								required: true,
								validator: (rule, v, callback) => {
									if (!v || !v.trim()) {
										return callback(new Error('表名称不能为空'));
									}
									const flag = /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/.test(v); // eslint-disable-line
									if (v.split('.')[0] == 'system' || !flag) {
										return callback(new Error(this.$t('dialog.placeholderTable')));
									}
									return callback();
								}
							}
						]
					}
				]
			}
		};
	},
	created() {
		this.getDbOptions();
	},
	computed: {
		table() {
			return this.$refs.table;
		},
		metaType() {
			let metaType = this.searchParams.metaType;
			return metaType ? [metaType] : [];
		}
	},
	methods: {
		reset() {
			this.searchParams = {
				keyword: '',
				isFuzzy: true,
				metaType: '',
				dbId: ''
			};
			this.table.fetch(1);
		},
		getData({ page, tags }) {
			let { current, size } = page;
			let { isFuzzy, keyword, metaType, dbId } = this.searchParams;
			let where = {
				is_deleted: false
			};
			let fields = {
				name: true,
				original_name: true,
				owner: true,
				meta_type: true,
				description: true,
				qualified_name: true,
				db: true,
				stats: true,
				classifications: true,
				last_user_name: true,
				last_updated: true,
				create_time: true,
				collection: true,
				id: true,
				source: true,
				'source._id': true,
				'source.user_id': true,
				databaseId: true
			};
			if (keyword && keyword.trim()) {
				let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
				where.or = [{ name: filterObj }, { original_name: filterObj }];
			}

			if (tags && tags.length) {
				where['classifications.id'] = {
					in: tags
				};
			}
			metaType && (where.meta_type = metaType);
			status && (where.status = status);
			dbId && (where['source.id'] = dbId);
			let filter = {
				order: this.order,
				limit: size,
				fields: fields,
				skip: (current - 1) * size,
				where
			};
			return Promise.all([
				this.$api('MetadataInstances').count({ where: where }),
				this.$api('MetadataInstances').get({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				return {
					total: countRes.data.count,
					data: res.data
				};
			});
		},
		getDbOptions() {
			let filter = {
				fields: {
					name: true,
					original_name: true,
					meta_type: true,
					id: true,
					source: true,
					qualified_name: true,
					classifications: true,
					'source._id': true,
					'source.user_id': true,
					'source.connection_type': true,
					'source.database_type': true
				},
				where: {
					is_deleted: false,
					meta_type: 'database'
				}
			};
			this.$api('MetadataInstances')
				.get({
					filter: JSON.stringify(filter)
				})
				.then(res => {
					let dbOptions = res.data;
					this.dbOptions = dbOptions;
					let options = [];
					dbOptions.forEach(db => {
						if (
							db.source.database_type === 'mongodb' &&
							['target', 'source_and_target'].includes(db.source.connection_type)
						) {
							options.push({
								label: db.name || db.original_name,
								value: db.id
							});
						}
					});
					this.createFormConfig.items[1].options = options;
				});
		},
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		handleSelectTag() {
			let tagList = {};
			this.multipleSelection.forEach(row => {
				if (row.classifications && row.classifications.length > 0) {
					tagList[row.classifications[0].id] = {
						value: row.classifications[0].value
					};
				}
			});
			return tagList;
		},
		handleOperationClassify(classifications) {
			this.$api('MetadataInstances')
				.classification({
					metadatas: this.multipleSelection.map(it => {
						return {
							id: it.id,
							classifications: classifications
						};
					})
				})
				.then(() => {
					this.table.fetch();
				});
		},
		metaTypeChange(val) {
			if (!this.whiteList.includes(val)) {
				this.searchParams.dbId = '';
			}
			this.table.fetch(1);
		},
		openCreateDialog() {
			this.createDialogVisible = true;
			this.$refs.form.clearValidate();
			this.createForm = {
				model_type: 'collection',
				database: '',
				tableName: ''
			};
		},
		createNewModel() {
			this.$refs.form.validate(valid => {
				if (valid) {
					let { model_type, database, tableName } = this.createForm;
					let db = this.dbOptions.find(it => it.id === database);
					let params = {
						connectionId: db.qualified_name,
						original_name: tableName,
						is_deleted: false,
						meta_type: model_type,
						create_source: 'manual',
						databaseId: db.id,
						classifications: db.classifications,
						alias_name: '',
						comment: ''
					};
					this.$api('MetadataInstances')
						.post(params)
						.then(res => {
							this.toDetails(res.data);
						});
				}
			});
		},
		toDetails(item) {
			this.$router.push({ name: 'metadataInstances', params: { id: item.id, name: item.original_name } });
		},
		changeName(item) {
			this.$prompt('', this.$t('connection.rename'), {
				inputPattern: /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/, // eslint-disable-line
				inputErrorMessage: this.$t('dialog.placeholderTable'),
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('MetadataInstances')
							.updateById(item.id, {
								name: instance.inputValue
							})
							.then(() => {
								this.$message.success(this.$t('message.saveOK'));
								this.table.fetch();
								done();
							})
							.catch(() => {
								this.$message.info(this.$t('message.保存失败'));
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
		remove(item) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('message.deleteOrNot') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.original_name)
			]);
			this.$confirm(message, this.$t('message.prompt'), {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('MetadataInstances')
							.delete(item.id)
							.then(() => {
								this.$message.success(this.$t('message.deleteOK'));
								this.table.fetch();
								done();
							})
							.catch(() => {
								this.$message.info(this.$t('message.deleteFail'));
							})
							.finally(() => {
								instance.confirmButtonLoading = false;
							});
					} else {
						done();
					}
				}
			});
		}
	}
};
</script>
<style lang="less" scoped>
.metadata-list-wrap {
	height: 100%;
	.metadata-list {
		.search-bar {
			display: flex;
			li + li {
				margin-left: 10px;
			}
		}
		.btn + .btn {
			margin-left: 5px;
		}
		.btn {
			padding: 7px;
			background: #f5f5f5;
			i.iconfont {
				font-size: 12px;
			}
			&.btn-dropdowm {
				margin-left: 5px;
			}
			&.btn-create {
				margin-left: 5px;
			}
		}
		.metadata-name {
			.name {
				color: #48b6e2;
				a {
					color: inherit;
					cursor: pointer;
				}
			}
			.tag {
				margin-left: 5px;
				color: #999999;
				background: #f5f5f5;
				border: 1px solid #dedee4;
			}
			.parent {
				color: #cccccc;
			}
		}
	}
}
</style>
