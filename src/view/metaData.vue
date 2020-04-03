<template>
	<div class="box">
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
</template>

<script>
	import factory from '../api/factory';
	import log from "../log";

	const MetadataDefinitions = factory('MetadataDefinitions');
	// const MetadataInstances = factory('MetadataInstances');

	export default {
		name: 'TableSelector',
		data() {
			return {
				count: 0,
				filterText:'',
				data: [],
				default_expanded:false,
				defaultProps: {
					children: 'children',
					label: 'label',
					isLeaf: 'leaf'
				},
				mapping:{
					collection: 'app.Collection',
					table: 'app.Table',
					database: 'app.Database',
				}
			};
		},
		mounted() {
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

				if ( node.level === 0) {
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
							let children =[];
							res.data.forEach((record) => {
								children.push({
									id: record.id,
									parent_id:record.parent_id,
									label: record.value,
									meta_type: record.item_type,
								});
							});
							resolve(children);
							log('data', children);
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
			handleGraph(data) {

			},
		}
	};
</script>

<style>
	.box {
		width: 234px;
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
		margin-right:12px;
	}
	.table-label{
		display: inline-block;
		width: 140px;
	}
	.box-head{
		position: fixed;
		z-index: 2;
	}
	.el-tree{
		padding-top: 40px;
	}
</style>
