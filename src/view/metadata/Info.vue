<template>
	<section class="metadata-info">
		<header class="header">
			{{ $t('metadata.details.dataDirectory') }} / {{ $t('metadata.details.dataDetails') }}
		</header>

		<el-container class="metadata-content">
			<el-header class="matadata-head">
				<div class="img-box">
					<img src="../../../static/editor/table.svg" />
				</div>
				<div class="table-info">
					<h3>{{ metadataDataObj.original_name }}</h3>
					<div class="description">
						<span v-if="metadataDataObj.comment">{{ metadataDataObj.comment }}</span>
						<template v-else>
							<span v-if="desFalg">{{ $t('metadata.details.clickAddDes') }}</span>
							<el-input size="mini" v-model="metadataDataObj.comment" v-else></el-input>
						</template>

						<el-button class="e-button" type="text" @click="desFalg = !desFalg">{{
							$t('metadata.details.edit')
						}}</el-button>
					</div>

					<!-- <ul>
						<li>来源表：2</li>
						<li>去向表：2</li>
						<li>任务引用：2</li>
						<li>API引用：2</li>
						<li>表分层：MDM</li>
						<li>业务域：2</li>
					</ul> -->
				</div>
			</el-header>
			<el-main class="matadata-main">
				<div class="aside" v-if="!asideFalg">
					<i @click="asideFalg = true" class="iconfont icon-indent"></i>
					<p>{{ $t('metadata.details.propertyDetails') }}</p>
				</div>
				<el-aside class="metadata-aside" v-show="asideFalg">
					<el-collapse v-model="activeNames">
						<el-collapse-item name="1">
							<template slot="title">
								<div class="iconBox">
									<i class="header-icon el-icon-arrow-right"></i>
									<span>{{ $t('metadata.details.basicAttributes') }}</span>
									<i @click="asideFalg = false" class="iconfont icon-outdent"></i>
								</div>
							</template>
							<ul>
								<li>
									<span class="label">{{ $t('metadata.details.name') }}：</span>
									<span>{{ metadataDataObj.name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.originalTableName') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.typesOf') }}：</span>
									<span>{{ metadataDataObj.meta_type }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.owningConnection') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.primaryKey') }}：</span>
									<span>{{ metadataDataObj.id }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.source') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.creationTime') }}：</span>
									<span>{{ metadataDataObj.createTime }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.founder') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.changeTime') }}：</span>
									<span>{{ metadataDataObj.last_updated }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.Modifier') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
							</ul>
						</el-collapse-item>
						<el-collapse-item name="2">
							<template slot="title">
								<div class="iconBox">
									<i class="header-icon el-icon-arrow-right"></i
									><span>{{ $t('metadata.details.businessAttributes') }}</span>
									<el-button type="text">+ {{ $t('metadata.details.creat') }}</el-button>
								</div>
							</template>
							<ul>
								<li>
									<span class="label">{{ $t('metadata.details.tableLayering') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.theme') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.taskReference') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.APIReference') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
							</ul>
						</el-collapse-item>
					</el-collapse>
				</el-aside>
				<div class="content" :class="{ boxWidth: !asideFalg }">
					<ul class="mune">
						<li
							v-for="item in muneList"
							:key="item.icon"
							:class="activePanel === item.key ? 'active' : ''"
							@click="changeName(item.key)"
						>
							<i :class="['iconfont', item.icon]"></i>
							<span slot="title">{{ item.name }}</span>
						</li>
					</ul>
					<div class="table-box">
						<TablePage
							ref="table"
							row-key="id"
							:remoteMethod="getData"
							@selection-change="handleSelectionChange"
							@sort-change="handleSortTable"
						>
							<ul class="search-bar" slot="search">
								<li class="item">
									<el-input
										:placeholder="$t('metadata.details.searchPlaceholder')"
										clearable
										prefix-icon="el-icon-search"
										v-model="searchParams.keyword"
										size="mini"
										style="width:160px"
										@input="table.fetch(1, 800)"
									></el-input>
								</li>
								<li class="item">
									<el-select
										v-model="searchParams.source"
										:placeholder="$t('metadata.details.selsectSource')"
										clearable
										size="mini"
										@input="table.fetch(1)"
									>
										<el-option
											v-for="item in databaseModelOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
										>
										</el-option>
									</el-select>
								</li>
								<li class="item">
									<el-button type="text" class="restBtn" size="mini" @click="rest()">
										{{ $t('dataFlow.reset') }}
									</el-button>
								</li>
							</ul>
							<div slot="operation" class="operation">
								<!-- <el-button
									v-readonlybtn="'datasource_category_application'"
									size="mini"
									class="btn"
									@click="$refs.table.showClassify(handleSelectTag())"
								>
									<i class="iconfont icon-piliang back-btn-icon"></i>
									<span> {{ $t('metadata.details.prohibitOverwriting') }}</span>
								</el-button>
								<el-button
									v-readonlybtn="'datasource_category_application'"
									size="mini"
									class="btn"
									@click="$refs.table.showClassify(handleSelectTag())"
								>
									<i class="iconfont icon-piliang back-btn-icon"></i>
									<span> {{ $t('metadata.details.batchCoverage') }}</span>
								</el-button>
								<el-button
									v-readonlybtn="'datasource_category_application'"
									size="mini"
									class="btn"
									@click="$refs.table.showClassify(handleSelectTag())"
								>
									<i class="iconfont icon-biaoqian back-btn-icon"></i>
									<span> {{ $t('metadata.details.refreshModel') }}</span>
								</el-button> -->
								<el-button class="btn btn-create" size="mini" @click="hanldCreateFiled">
									<i class="iconfont icon-jia add-btn-icon"></i>
									<span> {{ $t('metadata.details.createFiled') }}</span>
								</el-button>
							</div>
							<!-- <el-table-column type="selection" width="45" :reserve-selection="true"> </el-table-column> -->
							<el-table-column type="expand">
								<template slot-scope="scope">
									<ul class="attributes">
										<li class="more">
											<label class="label">{{ $t('metadata.details.moreAttributes') }}</label>
											<span
												>{{ $t('metadata.details.allowOverwrite') }} :
												{{ scope.row.is_auto_allowed }}</span
											>
											<span
												>{{ $t('metadata.details.fieldLength') }} :
												{{ scope.row.columnSize }}</span
											>
											<span
												>{{ $t('metadata.details.accuracy') }} : {{ scope.row.precision }}</span
											>
											<span
												>{{ $t('metadata.details.numberLength') }} : {{ scope.row.scale }}</span
											>
										</li>
										<li v-if="scope.row.dictionary && scope.row.dictionary.length">
											<label class="label">{{ $t('metadata.details.filedDictionary') }}</label>
											<span v-for="item in scope.row.dictionary" :key="item.table_name"
												>{{ item.key }} : {{ item.value }}</span
											>
										</li>
										<li v-if="scope.row.relation && scope.row.relation.length">
											<label class="label">{{
												$t('metadata.details.foreignKeyAssociation')
											}}</label>
											<span v-for="item in scope.row.relation" :key="item.key"
												>{{ item.table_name }}, {{ item.field_name }},
												{{ $t('metadata.details.' + item.rel) }}</span
											>
										</li>
									</ul>
								</template>
							</el-table-column>
							<el-table-column
								prop="field_name"
								:label="$t('metadata.details.filedAliasName')"
								sortable="name"
								width="150"
							>
							</el-table-column>
							<el-table-column prop="username" :label="$t('metadata.details.alias')" width="80">
								<template slot-scope="scope">
									<div class="database-text" style="margin-left:0;">
										<div>{{ scope.row.username }}</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column
								prop="create_source"
								:label="$t('metadata.details.source')"
								width="120"
								sortable="create_source"
							></el-table-column>
							<el-table-column
								prop="java_type"
								:label="$t('metadata.details.fieldType')"
								width="100"
								sortable="java_type"
							>
								<template slot-scope="scope">
									<div>{{ $t('metadata.details.' + scope.row.java_type) }}</div>
								</template>
							</el-table-column>
							<el-table-column
								prop="columnSize"
								:label="$t('metadata.details.fieldLength')"
								width="100"
								sortable="columnSize"
							></el-table-column>
							<el-table-column
								prop="comment"
								:label="$t('metadata.details.description')"
							></el-table-column>
							<el-table-column width="120" :label="$t('metadata.details.opera')">
								<template slot-scope="scope">
									<el-button
										v-readonlybtn="'data_catalog_edition'"
										size="mini"
										type="text"
										@click="edit(scope.row)"
									>
										{{ $t('metadata.details.edit') }}
									</el-button>
									<el-button
										v-readonlybtn="'meta_data_deleting'"
										size="mini"
										type="text"
										@click="remove(scope.row, scope.$index, 0)"
										>{{ $t('button.delete') }}</el-button
									>
								</template>
							</el-table-column>
						</TablePage>
					</div>
				</div>
			</el-main>
		</el-container>
		<FormPage
			:dialogVisible="dialogFormVisible"
			@dialogVisible="handleDialogVisible"
			:data="fieldObj"
			:metadata="metadataDataObj"
			v-if="dialogFormVisible"
		></FormPage>
	</section>
</template>
<script>
import TablePage from '@/components/TablePage';
import FormPage from './Form';
export default {
	components: {
		TablePage,
		FormPage
	},
	data() {
		return {
			asideFalg: true,
			activeNames: ['1'],
			activePanel: 'model',
			muneList: [{ name: this.$t('metadata.details.model'), key: 'model' }],
			description: '',
			searchParams: {},
			multipleSelection: [],
			tableData: [],
			desFalg: true,
			dialogFormVisible: false,
			databaseModelOptions: [],
			fieldObj: {},
			metadataDataObj: {
				original_name: '',
				comment: ''
			}
		};
	},
	created() {},
	methods: {
		// 获取数据
		async handleGetDataApi() {
			let params = {
				where: {
					databaseId: {
						regexp: `^${this.$router.databaseId}$`
					},
					meta_type: this.metadataDataObj.meta_type,
					id: {
						neq: this.metadataDataObj.id
					},
					'relation.table_name': {
						neq: this.metadataDataObj.original_name
					}
				},
				fields: {
					histories: false,
					original_name: true,
					id: true
				}
			};

			let resultData = await this.$api('MetadataInstances').get({ filter: JSON.stringify(params) });

			if (resultData.data) {
				this.getTableData = resultData.data;
			}
		},
		//新建字段
		hanldCreateFiled() {
			this.fieldObj = {};
			this.dialogFormVisible = true;
		},
		// 编辑字段
		edit(item) {
			this.fieldObj = item;
			this.dialogFormVisible = true;
		},
		// getData({ page, tags }) {
		getData() {
			// let { current, size } = page;
			let { keyword, source } = this.searchParams;
			let where = {};
			//精准搜索 iModel
			if (keyword && keyword.trim()) {
				let filterObj = { like: keyword, options: 'i' };
				where.or = [{ field_name: filterObj }, { alias_name: filterObj }, { comment: filterObj }];
			}
			where.create_source = source;
			// if (tags && tags.length) {
			// 	where['listtags.id'] = {
			// 		in: tags
			// 	};
			// }
			// status && (where.status = status);
			// let filter = {
			// 	order: this.order,
			// 	limit: size,
			// 	skip: (current - 1) * size,
			// 	where
			// };
			return Promise.all([
				this.$api('MetadataInstances').get([this.$route.query.id])
				// this.$api('MetadataInstances').get({
				// 	filter: JSON.stringify(filter)
				// })
			]).then(res => {
				this.metadataDataObj = res[0].data;
				return {
					total: res[0].data.fields.length,
					data: res[0].data.fields
				};
			});
		},
		//筛选条件
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		// 删除字段
		remove(item, index) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('message.deleteOrNot') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.field_name)
			]);
			this.$confirm(message, this.$t('message.prompt'), {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.metadataDataObj.fields.splice(index, 1);
						let groupRelation = {};
						let fields = this.metadataDataObj.fields;

						if (fields && fields.length) {
							fields.forEach(field => {
								field.relation &&
									field.relation.length &&
									field.relation.forEach(item => {
										let key = item.table_name + item.rel;
										if (groupRelation[key]) {
											groupRelation[key].fields.push({
												local: item.field_name,
												foreign: field.field_name
											});
										} else {
											groupRelation[key] = {
												table_name: item.table_name,
												rel: item.rel,
												fields: [
													{
														local: item.field_name,
														foreign: field.field_name
													}
												]
											};
										}
									});
							});
						}
						let relation = Object.values(groupRelation);
						let params = this.metadataDataObj;
						params.fields = fields;
						// params.comment = this.form.comment;
						params.relation = relation;
						this.$api('MetadataInstances')
							.patch(this.metadataDataObj.id, params)
							.then(() => {
								this.$message.success(this.$t('message.deleteOK'));
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
		},
		// 关闭弹窗
		handleDialogVisible() {
			this.dialogFormVisible = false;
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		}
	}
};
</script>
<style lang="less" scoped>
.metadata-info {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background-color: rgba(239, 241, 244, 100);
	.header {
		height: 50px;
		line-height: 50px;
		padding-left: 20px;
		background-color: rgba(250, 250, 250, 100);
		color: rgba(51, 51, 51, 100);
		font-size: 18px;
		text-align: left;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(222, 222, 228, 100);
		border-left: none;
		position: relative;
	}
	.metadata-content {
		padding: 10px;
		box-sizing: border-box;
		overflow: hidden;
		.matadata-head {
			display: flex;
			height: auto !important;
			flex-direction: row;
			padding: 20px;
			background-color: #fff;
			box-sizing: content-box;
			border-radius: 3px;
			overflow: hidden;
			box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
			.img-box {
				width: 32px;
				height: 32px;
			}
			.table-info {
				padding-left: 20px;
				h3 {
					font-size: 18px;
					color: #333;
				}
				.description {
					padding: 0 0 5px;
					font-size: 12px;
					span {
						color: #aaa;
					}
					.e-button {
						padding: 5px 12px;
					}
				}
				ul {
					box-sizing: content-box;
					overflow: hidden;
					li {
						float: left;
						margin-right: 12px;
						padding: 3px 10px;
						font-size: 12px;
						color: #666;
						border-radius: 3px;
						background-color: #eff1f4;
					}
				}
			}
		}
		.matadata-main {
			display: flex;
			flex-direction: row;
			padding: 10px 0 0;
			.metadata-aside {
				width: 360px;
				height: 100%;
				border-radius: 3px;
				background-color: #fff;
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
				ul {
					padding: 10px 10px 10px 20px;
					font-size: 12px;
					li {
						padding-bottom: 5px;
						span {
							color: #666;
						}
						.label {
							display: inline-block;
							width: 100px;
							color: #aaa;
						}
					}
				}
			}
			.aside {
				width: 28px;
				height: 100%;
				padding: 5px 0;
				text-align: center;
				color: #666;
				font-size: 12px;
				background-color: #fff;
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
				.iconfont {
					cursor: pointer;
				}
				p {
					padding: 12px 5px;
				}
			}
			.content {
				width: calc(100% - 311px);
				margin-left: 10px;
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
				.mune {
					height: 28px;
					line-height: 25px;
					border-radius: 3px;
					font-size: 12px;
					box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
					li {
						float: left;
						width: 100px;
						color: #666;
						text-align: center;
					}
					li.active {
						background-color: #fff;
					}
				}
				.table-box {
					height: calc(100% - 28px);
					.operation {
						.iconfont {
							font-size: 12px;
						}
						.btn {
							padding: 7px;
							background: #f5f5f5;
							i.iconfont {
								font-size: 12px;
							}
							&.btn-create {
								margin-left: 5px;
							}
						}
					}
					.attributes {
						li {
							margin: 5px 0;
							font-size: 12px;
							span {
								display: inline-block;
								padding: 3px 10px;
								margin: 0 5px;
								color: #666;
								border-radius: 10px;
								background-color: #f7edee;
							}
							.label {
								color: #aaa;
								border-radius: 0;
								background-color: none;
							}
						}
						li.more {
							span {
								background-color: #e2f1f9;
							}
						}
					}
				}
				.search-bar {
					display: flex;
					flex-wrap: wrap;
					li {
						margin-right: 10px;
						&:last-child {
							margin-right: 0;
						}
					}
				}
			}
			.boxWidth {
				width: calc(100% - 30px);
			}
		}
	}
}
</style>
<style lang="less">
.metadata-info {
	.el-collapse-item {
		font-size: 12px;
		.el-collapse-item__header {
			height: 28px;
			line-height: 28px;
			color: #333;
			background-color: #eff1f4;
		}
		.iconBox {
			width: 100%;
			.header-icon {
				// padding-right: 12px;
				// vertical-align: middle;
				transition: -webkit-transform 0.3s;
				-webkit-transition: -webkit-transform 0.3s;
				transition: transform 0.3s;
				transition: transform 0.3s, -webkit-transform 0.3s;
				transition: transform 0.3s, -webkit-transform 0.3s;
				font-weight: 300;
			}
			span {
				padding-left: 12px;
			}
			.iconfont {
				display: inline-block;
				float: right;
				padding-top: 3px;
				cursor: pointer;
			}
			.el-button {
				float: right;
				padding: 3px 0 0;
			}
		}
		.el-collapse-item__header {
			padding: 0 5px;
		}
		.el-collapse-item__header.is-active {
			.header-icon {
				margin-top: 12px;
				transform: rotate(90deg);
			}
		}
		.el-collapse-item__content {
			padding-bottom: 5px;
		}
		.el-collapse-item__arrow {
			display: none;
		}

		.el-collapse-item__wrap {
			border: 0;
		}
		.el-table__expanded-cell {
			padding: 10px 50px;
		}
	}
}
</style>
