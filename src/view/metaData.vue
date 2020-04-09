<template>
	<div>
		<div class="box-tree">
			<div class="box-head">
				<el-input class="search" v-model="filterText"><i slot="suffix" class="el-input__icon el-icon-search"></i></el-input>
				<i class="iconfont icon-sync" @click="handleList"></i>
				<i class="iconfont icon-xiangxiahebing2" @click="handleDefault_expanded"></i>
			</div>
			<el-tree
					node-key="id"
					:props="props"
					:expand-on-click-node="false"
					lazy
					:load="loadNodes"
					:filter-node-method="filterNode"
					ref="tree"
			>
			<span class="custom-tree-node" slot-scope="{ node, data}">
				<span>
					<span  class="iconfont icon-Folder-closed filter-icon"></span>
					<span class="table-label" @click="handleChecked(data)">{{ node.label }}</span>
				</span>
			</span>
			</el-tree>
		</div>
		<div class="box-ul">
			<ul class="classify-ul">
				<div class="box-head">
					<div class="select-nav-header">
						<span>{{ checkedValue }}</span>
						<el-button size="mini" type="primary">批量分类</el-button>
					</div>
					<el-input placeholder="请输入内容" v-model="search" class="search-input" clearable @clear="clear" @change="handleSearch">
						<i slot="prefix" class="el-input__icon el-icon-search"></i>
					</el-input>
					<div class="select-nav">
						<el-select v-model="checkType" clearable placeholder="请选择" class="MetaDataSelect" @change="handleSearch">
							<el-option
									v-for="item in options"
									:key="item.value"
									:label="item.label"
									:value="item.value">
							</el-option>
						</el-select>
						<el-select v-model="checkClassify" clearable placeholder="请选择" class="MetaDataSelect" @change="handleSearch">
							<el-option
									v-for="item in optionsType"
									:key="item.value"
									:label="item.label"
									:value="item.value">
							</el-option>
						</el-select>
						<el-checkbox  v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
					</div>
				</div>
				<el-checkbox-group v-model="checkData" @change="handleCheckedCitiesChange" class="list-box">
					<li  v-for="item in listdata" :key="item.id">
						<el-checkbox :label="item.id">
							<span class="iconfont icon-table2 icon-color"></span>
							<span>{{item.original_name}}</span>
						</el-checkbox>
					</li>
				</el-checkbox-group>
			</ul>
		</div>
	</div>
</template>

<script>
	import factory from '../api/factory';
	import log from "../log";

	const MetadataDefinitions = factory('MetadataDefinitions');
	const MetadataInstances = factory('MetadataInstances');

	export default {
		name: 'TableSelector',
		data() {
			return {
				count: 0,
				filterText: '',
				data: [],
				search:'',
				default_expanded: false,
				props: {
					children: 'children',
					label: 'label',
					isLeaf: 'leaf'
				},
				mapping: {
					collection: 'app.Collection',
					table: 'app.Table',
					database: 'app.Database',
				},
				listdata: [],
				checkAll: [],
				checkData: [],
				checkedValue:'all',
				options: [{
					value: '',
					label: 'all'
				}, {
					value: 'database',
					label: 'database'
				}, {
					value: 'mongoDB',
					label: 'mongoDB'
				}, {
					value: 'table',
					label: 'table'
				}, {
					value: 'collection',
					label: 'collection'
				}, {
					value: 'api',
					label: 'api'
				}, {
					value: 'flow',
					label: 'flow'
				}, {
					value: 'file',
					label: 'file'
				}, {
					value: 'view',
					label: 'view'
				}, {
					value: 'mongo_view',
					label: 'mongo_view'
				}],
				optionsType: [{
					value: '',
					label: 'all'
				}, {
					value: 'no type',
					label: 'no type'
				}],
				checkClassify: '',
				checkType:"",
			};
		},
		mounted() {
			this.handleList();
			this.keyupEnter();
		},
		watch: {
			filterText(val) {
				this.$refs.tree.filter(val);
			}
		},
		methods: {
			loadNodes(node, resolve) {
				let self = this;
				let filter = {
					where: {}
				};

				if (node.level === 0) {
					filter.where['parent_id'] = {
						exists: false
					};
					MetadataDefinitions.get({filter: JSON.stringify(filter)}).then(res => {
						if (res.statusText === "OK" || res.status === 200) {
							if (res.data) {
								self.data.splice(0, self.data.length);
								let children = [];
								res.data.forEach((record) => {
									children.push({
										id: record.id,
										parent_id: record.parent_id,
										label: record.value,
										meta_type: record.item_type,
									});
								});
								resolve(children);
							}
						}
					}).catch(e => {
						this.$message.error('MetadataInstances error');
					});
				} else {
					filter.where['parent_id'] = {
						regexp: `^${node.data.id}$`
					};
					MetadataDefinitions.get({filter: JSON.stringify(filter)}).then(res => {
						if (res.statusText === "OK" || res.status === 200) {
							if (res.data) {
								self.data.splice(0, self.data.length);
								let children = [];
								res.data.forEach((record) => {
									children.push({
										id: record.id,
										parent_id: record.parent_id,
										label: record.value,
										meta_type: record.item_type,
										leaf: true,
									});
								});
								resolve(children);
							}
						}
					}).catch(e => {
						this.$message.error('MetadataInstances error');
					});
				}

			},
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleList() {
				this.checkedValue = 'all';
				let params = {
					filter: JSON.stringify({
						where: {
							is_deleted: false,
						},
						fields: {
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
							source: {
								_id: true
							},
							databaseId: true
						}
					})
				};
				MetadataInstances.get(params).then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.listdata = res.data;
						}
					}
					log('listdata', self.listdata);
				}).catch(e => {
					this.$message.error('MetadataInstances error');
				});
			},
			handleDefault_expanded() {
				let self = this;
				let treeList = this.data;
				for (let i = 0; i < treeList.length; i++) {
					self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
				}
			},
			handleCheckAllChange(val) {
				this.checkData = val ;
				log('checkData', val);
			},
			handleCheckedCitiesChange(value) {
				this.checkAll =value ;
				log('value', value);
			},
			handleChecked(val){
				let params = {};
				this.checkedValue = val.label;
				params[`filter[where][classifications.id][in][0]`] = val.id;
				MetadataInstances.get(params).then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.listdata = res.data;
						}
					}
					log('listdata', self.listdata);
				}).catch(e => {
					this.$message.error('MetadataInstances error');
				});
			},
			handleSearch(){
				let params = {};
				if(this.checkType){
					params[`filter[where][meta_type]`] = this.checkType;
				}
				if(this.search){
					params[`filter[where][or][1][original_name][like]`] = this.search;
				}
				//params[`filter[where][or][1][original_name][like]`] = this.checkClassify;

				MetadataInstances.get(params).then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.listdata = res.data;
						}
					}
					log('listdata', self.listdata);
				}).catch(e => {
					this.$message.error('MetadataInstances error');
				});
			},
			clear() {
				this.handleList();
			},
		}
	};
</script>

<style scoped lang="less">
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
		width: 170px;
		margin-bottom: 10px;
	}

	.filter-icon {
		font-size: 12px;
		color: #48b6e2;
	}

	.filter-icon-table {
		font-size: 13px;
		color: #4AAF47;
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
		position: fixed;
		z-index: 2;
	}

	.el-tree {
		padding-top: 40px;
	}

	.box-tree {
		float: left;
		width: 170px;
	}

	.box-ul {
		float: left;
		margin-left: 50px;
	}
	.list-box{
		margin-top: 114px
	}
	.classify-ul {
		border: 1px solid #ebeef5;
		background-color: #fff;
		overflow: hidden;
		color: #303133;
		transition: .3s;
		list-style: none;
		font-size: 12px;
		width: 300px;
		height: calc(100vh - 1px);
		overflow-y: auto;
	}

	.classify-ul li {
		width: 263px;
		height: 43px;
		line-height: 43px;
		margin-left: 8px;
		margin-bottom: 10px;
		padding-left: 10px;
		background: rgba(255, 255, 255, 1);
		border: 1px solid rgba(234, 234, 235, 1);
		border-radius: 3px;
		overflow: hidden;
		text-overflow: ellipsis;
		span{
			font-size: 12px;
		}
	}
	.box-head{
		position: fixed;
		background: #fff;
		width: 292px;
		z-index: 4;
	}
	.search-input{
		width: 94%;
		margin-left: 10px;
		margin-right: 10px;
	}
	.filter-icon{
		color: #EDC958;
	}
	.icon-color {
		color: #599656;
		font-size: 14px;
		background: #c6f8c382;
		padding: 3px;
	}
	.select-nav{
		padding: 10px;
		display: flex;
		justify-content: space-between;
	}
	.select-nav-header{
		display: flex;
		line-height: 30px;
		justify-content: space-between;
		padding-left: 10px;
		padding-right: 10px;
		padding-bottom: 5px;
		padding-top: 5px;
	}

</style>
<style lang="less">
	.MetaDataSelect {
		margin-top: -5px;
		.el-input__inner{
			border: none !important;
		}
	}
</style>
