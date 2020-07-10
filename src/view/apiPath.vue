<template>
	<div class="metadata">
		<div class="box-ul">
			<div class="box-head">
				<!-- <div class="select-nav-header" style="dispaly: none!important;">
					<span style="font-size: 12px">{{ checkedValue.label }}</span>
					<el-button size="mini" type="primary" @click="handleClassify">批量分类</el-button>
				</div> -->
				<el-input
					placeholder="请输入内容"
					v-model="search"
					class="search-input"
					clearable
					size="mini"
					@clear="clear"
					@change="handleSearch"
				>
					<i slot="prefix" class="el-input__icon el-icon-search"></i>
				</el-input>
				<!-- <div class="select-nav">
					<el-select
						v-model="checkType"
						clearable
						placeholder="请选择"
						class="MetaDataSelect"
						@change="handleSearch"
					>
						<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
					<el-select
						v-model="checkClassify"
						clearable
						placeholder="请选择"
						class="MetaDataSelect"
						@change="handleSearch"
					>
						<el-option
							v-for="item in optionsType"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
					<el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox> -->
				<!-- </div> -->
			</div>
			<ul class="classify-ul">
				<!-- <el-checkbox-group v-model="checkData" @change="handleCheckedCitiesChange" class="list-box"> -->
				<li v-for="item in listdata" :key="item.id" @click="handClickApiData(item)">
					<!-- <el-checkbox :label="item.id"> -->
					<span class="iconfont icon-table2 icon-color"></span>
					<span>{{ item.tablename }}_{{ item.apiVersion }}</span>
					<!-- </el-checkbox> -->
				</li>
				<!-- </el-checkbox-group> -->
			</ul>
			<div cl></div>
			<SelectClassify
				ref="SelectClassify"
				:checkData="checkData"
				:dialogVisible="dialogVisible"
				:listdata="listdata"
			></SelectClassify>
		</div>
	</div>
</template>

<script>
import factory from '../api/factory';
import log from '../log';
import SelectClassify from './../components/SelectClassify';

const MetadataDefinitions = factory('MetadataDefinitions');
const MetadataInstances = factory('MetadataInstances');
const modules = factory('modules');

export default {
	name: 'metaData',
	components: {
		SelectClassify
	},
	props: {
		selectNodeId: {
			type: String
		}
	},
	data() {
		return {
			count: 0,
			filterText: '',
			data: [],
			search: '',
			default_expanded: false,
			props: {
				children: 'children',
				label: 'label',
				isLeaf: 'leaf'
			},
			mapping: {
				collection: 'app.Collection',
				table: 'app.Table',
				database: 'app.Database'
			},
			listdata: [],
			checkAll: [],
			checkData: [],
			checkedValue: {
				label: 'all datas'
			},
			options: [
				{
					value: '',
					label: 'all types'
				},
				{
					value: 'database',
					label: 'database'
				},
				{
					value: 'mongoDB',
					label: 'mongoDB'
				},
				{
					value: 'table',
					label: 'table'
				},
				{
					value: 'collection',
					label: 'collection'
				},
				{
					value: 'api',
					label: 'api'
				},
				{
					value: 'flow',
					label: 'flow'
				},
				{
					value: 'file',
					label: 'file'
				},
				{
					value: 'view',
					label: 'view'
				},
				{
					value: 'mongo_view',
					label: 'mongo_view'
				}
			],
			optionsType: [
				{
					value: '',
					label: 'all'
				},
				{
					value: 'no type',
					label: 'no type'
				}
			],
			checkClassify: '',
			checkType: '',
			isActive: true,
			dialogVisible: false
		};
	},
	async mounted() {
		this.handleList();
		this.$refs.SelectClassify.$on('dialogVisible', operations => {
			this.handleChecked(this.checkedValue);
			this.dialogVisible = operations;
		});
		this.$refs.SelectClassify.$on('clearCheckData', operations => {
			this.checkData = operations;
		});
	},
	watch: {
		filterText(val) {
			this.$refs.tree.filter(val);
		},
		selectNodeId() {
			this.handleList();
		}
	},
	methods: {
		// 点击api的数据
		handClickApiData(data) {
			this.$emit('backApiData', data);
		},
		loadNodes(node, resolve) {
			let self = this;
			let filter = {
				where: {}
			};

			if (node.level === 0) {
				filter.where['parent_id'] = {
					exists: false
				};
				MetadataDefinitions.get({
					filter: JSON.stringify(filter)
				}).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							self.data.splice(0, self.data.length);
							let children = [];
							res.data.forEach(record => {
								children.push({
									id: record.id,
									parent_id: record.parent_id,
									label: record.value,
									meta_type: record.item_type
								});
							});
							resolve(children);
						}
					}
				});
				// .catch(e => {
				// 	this.$message.error('MetadataInstances error');
				// });
			} else {
				filter.where['parent_id'] = {
					regexp: `^${node.data.id}$`
				};
				MetadataDefinitions.get({
					filter: JSON.stringify(filter)
				}).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							self.data.splice(0, self.data.length);
							let children = [];
							res.data.forEach(record => {
								children.push({
									id: record.id,
									parent_id: record.parent_id,
									label: record.value,
									meta_type: record.item_type,
									leaf: true
								});
							});
							resolve(children);
						}
					}
				});
				// .catch(e => {
				// 	this.$message.error('MetadataInstances error');
				// });
			}
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},

		// 获取当前数据
		handleList() {
			this.checkedValue = 'all datas';
			let params = {
				filter: JSON.stringify({
					where: {
						'listtags.id': {
							regexp: `^${this.selectNodeId}$`
						}
					},
					fields: {
						apiVersion: true,
						basePath: true,
						connection: true,
						datasource: true,
						description: true,
						id: true,
						stats: true,
						tablename: true,
						user_id: true,
						last_updated: true,
						listtags: true
					}
				})
			};
			let searchObj = null;
			if (this.search) {
				searchObj = {
					filter: JSON.stringify({
						where: {
							tablename: {
								like: this.search,
								options: 'i'
							}
						}
					})
				};
			}
			params = Object.assign(params, searchObj);
			// let where = {};
			// if (!parseInt(this.$cookie.get('isAdmin'))) {
			// 	params['filter[where][user_id][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			// 	where['where[user_id][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			// }
			modules.get(params).then(res => {
				let self = this;
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						self.listdata = res.data;
					}
				}
			});
			// .catch(e => {
			// 	this.$message.error('MetadataInstances error');
			// });
		},
		handleDefault_expanded() {
			let self = this;
			let treeList = this.data;
			for (let i = 0; i < treeList.length; i++) {
				self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
			}
		},
		handleCheckAllChange(val) {
			if (val) {
				if (this.listdata) {
					this.listdata.forEach(item => {
						this.checkData.push(item.id);
					});
				}
			} else {
				this.checkData = [];
			}
			log('checkData', this.checkData);
		},
		handleCheckedCitiesChange(value) {
			this.checkData = value;
		},
		handleChecked(val) {
			let params = {};
			this.checkedValue = val;
			params[`filter[where][classifications.id][in][0]`] = val.id;
			MetadataInstances.get(params).then(res => {
				let self = this;
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						self.listdata = res.data;
					}
				}
				log('listdata', self.listdata);
			});
			// .catch(e => {
			// 	this.$message.error('MetadataInstances error');
			// });
		},
		handleSearch() {
			this.handleList();
		},
		clear() {
			this.handleList();
		},
		displaySearch(val) {
			this.isActive = val;
			log(this.isActive);
		},
		handleClassify() {
			if (this.checkData.length === 0) {
				this.$message.info('please select classify');
				return;
			}
			this.dialogVisible = true;
		}
	}
};
</script>

<style scoped lang="less">
.metadata {
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;
}
.box {
	width: 254px;
}

.custom-tree-node {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 11px;
	padding-right: 8px;
}

.editor-container .editor .e-body .e-vue-component-wrap {
	overflow: auto;
}

.el-checkbox-button .el-checkbox-button__inner {
	padding: 6px 12px;
}

.search {
	width: 197px;
	margin-bottom: 10px;
	margin-left: 8px;
}

.filter-icon {
	font-size: 12px;
	color: #48b6e2;
}

.filter-icon-table {
	font-size: 13px;
	color: #4aaf47;
}

.filter-Graph {
	display: inline-block;
	margin-right: 12px;
}

.table-label {
	display: inline-block;
	width: 140px;
}

.box-head {
	// position: fixed;
	z-index: 2;
}

.box-ul {
	float: left;
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	border-right: 1px solid #dedee4;
	overflow: hidden;
}

.classify-ul {
	background-color: #fff;
	overflow: hidden;
	color: #303133;
	transition: 0.3s;
	list-style: none;
	font-size: 12px;
	width: 100%;
	height: calc(100% - 41px);
	overflow-y: auto;
}

.classify-ul li {
	width: 100%;
	height: 34px;
	line-height: 43px;
	margin-left: 8px;
	padding-left: 10px;
	cursor: pointer;
	background: #ffffff;
	border-radius: 3px;
	overflow: hidden;
	text-overflow: ellipsis;
	span {
		font-size: 12px;
	}
}
.box-head {
	// position: fixed;
	width: 100%;
	height: 32px;
	line-height: 32px;
	z-index: 4;
	background: #f5f5f5;
	border-bottom: 1px solid #dedee4;
}
.search-input {
	width: auto;
	margin-left: 10px;
	margin-right: 10px;
}
.filter-icon {
	color: #edc958;
}
.icon-color {
	color: #4aaf47;
	font-size: 16px !important;
	margin-top: 1px;
}
.select-nav {
	display: flex;
	justify-content: space-between;
	padding-top: 5px;
	padding-right: 10px;
	font-size: 12px;
}
.select-nav-header {
	display: flex;
	line-height: 30px;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: 5px;
	padding-top: 5px;
}
/*头部样式*/
.metadata-header {
	width: 232px;
	height: 31px;
	background: #f5f5f5;
	border-bottom: 1px solid #dedee4;
	font-size: 12px;
	line-height: 31px;
	padding-left: 8px;
	display: flex;
}
.metadata-header-right {
	margin-left: 124px;
}
</style>
<style lang="less">
.MetaDataSelect {
	margin-top: -5px;
	.el-input__inner {
		border: none !important;
		background: #f5f5f5;
	}
}
.metadata-header {
	.el-input .el-input__inner {
		height: 24px;
		line-height: 24px;
	}
}
.metaData-tree {
	.el-tree-node__content {
		height: 33px;
	}
}
.select-nav-header {
	.el-button--mini,
	.el-button--mini.is-round {
		padding: 4px 12px;
	}
}
</style>
