<template>
	<div>
		<div class="box-tree">
			<div class="box-head">
				<el-input class="search" v-model="filterText"><i slot="suffix" class="el-input__icon el-icon-search"></i></el-input>
				<i class="iconfont icon-xiangxiahebing2" @click="handleDefault_expanded"></i>
			</div>
			<el-tree
					node-key="id"
					:expand-on-click-node="false"
					lazy
					:load="loadNodes"
					:filter-node-method="filterNode"
					ref="tree"
			>
			<span class="custom-tree-node" slot-scope="{ node, data}">
				<span>
					<span v-if="data.meta_type ==='database'" class="iconfont icon-shujuku filter-icon"></span>
					<span v-if="data.meta_type ==='table'" class="iconfont icon-table2  filter-icon-table"></span>
					<span v-if="data.meta_type ==='collection'" class="iconfont icon-collection filter-icon-table"></span>
					<span class="table-label">{{ node.label }}</span>
				</span>
			</span>
			</el-tree>
		</div>
		<div class="box-ul">
			<ul class="classify-ul">
				<div class="select-nav-header">
					<span>东南区</span>
					<el-button size="mini" type="primary">批量分类</el-button>
				</div>
				<el-input placeholder="请输入内容" v-model="search" class="search-input">
					<i slot="prefix" class="el-input__icon el-icon-search"></i>
				</el-input>
				<div class="select-nav">
					<el-dropdown>
					<span class="el-dropdown-link">
					下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
					</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item>all</el-dropdown-item>
							<el-dropdown-item>database</el-dropdown-item>
							<el-dropdown-item>mongoDB</el-dropdown-item>
							<el-dropdown-item>table</el-dropdown-item>
							<el-dropdown-item>collection</el-dropdown-item>
							<el-dropdown-item>api</el-dropdown-item>
							<el-dropdown-item>flow</el-dropdown-item>
							<el-dropdown-item>file</el-dropdown-item>
							<el-dropdown-item>view</el-dropdown-item>
							<el-dropdown-item>mongo_view</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-dropdown>
					<span class="el-dropdown-link">
					下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
					</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item>all</el-dropdown-item>
							<el-dropdown-item>no tag</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-checkbox  v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
				</div>
				<el-checkbox-group v-model="checkData" @change="handleCheckedCitiesChange">
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
				defaultProps: {
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
			};
		},
		mounted() {
			this.handleList();
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
				} else {
					filter.where['parent_id'] = {
						regexp: `^${node.data.id}$`
					};
				}
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
			},
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleList() {
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
					log('listdata', self.listdata.length);
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
			}
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
		width: 190px;
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

	.classify-ul {
		border-radius: 4px;
		border: 1px solid #ebeef5;
		background-color: #fff;
		overflow: hidden;
		color: #303133;
		transition: .3s;
		list-style: none;
		font-size: 12px;
		width: 300px;
	}
	.classify-ul{
		height: calc(100vh - 20px);
		overflow: auto;
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
	}
	.search-input{
		width: 94%;
		margin-left: 10px;
		margin-right: 10px;
	}

	.icon-color {
		color: #599656;
		font-size: 14px;
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
