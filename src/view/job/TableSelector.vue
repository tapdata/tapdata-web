<template>
	<div class="filter-toolbar">
		<div>
			<el-input class="search"> <i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
		</div>
		<el-tree
				:data="data"
				node-key="id"
				:expand-on-click-node="false"
				lazy
				:load="loadTables"
				>
			<span class="custom-tree-node" slot-scope="{ node, data}">
				<span>
					<span v-if="data.meta_type ==='database'" class="iconfont icon-shujuku filter-icon"></span>
					<span v-if="data.meta_type ==='table'" class="iconfont icon-table2   filter-icon-table"></span>
					{{ node.label }}
					<span  @click="handleGraph(data)" class="iconfont icon-xiayibu1 filter-icon filter-Graph"></span>
				</span>

			</span>
		</el-tree>
	</div>
</template>

<script>
	import factory from '../../api/factory';
	import log from "../../log";
	import {FORM_DATA_KEY} from "../../editor/constants";

	const MetadataInstances = factory('MetadataInstances');

	export default {
		name: 'TableSelector',
		data() {
			return {
				count:0,
				data: [],
				defaultProps: {
					children: 'children',
					label: 'label',
					isLeaf: 'leaf'
				}
			};
		},
		mounted() {
			this.loadDataBase();
		},
		methods: {
			handleNodeClick(data) {
			},
			loadDataBase() {
				let self = this;
				let params  = {
					filter: JSON.stringify({
						where: {
							meta_type: 'database'
						}
					})
				};
				MetadataInstances.get(params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.data.splice(0, self.data.length);

							res.data.forEach((record) => {
								self.data.push({
									id: record.id,
									label: record.name || record.original_name,
									meta_type: record.meta_type
								});
							});
							log('data', self.data);
						}
					}
				}).catch(e => {
					this.$message.error('MetadataInstances error');
				});
			},
			loadTables(node, resolve){
				if (node.level === 0) {
					return resolve(this.data);
				}

				let params  = {
					filter: JSON.stringify({
						where: {
							meta_type: {
								in: ['collection', 'table', 'mongodb view', 'view']
							},
							databaseId: {
								regexp: `^${node.key}$`
							}
						}
					})
				};
				MetadataInstances.get(params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							let childNodes = [];
							res.data.forEach(record => {
								childNodes.push({
									id: record.id,
									label: record.name || record.original_name,
									leaf: true,
									meta_type: record.meta_type
								});
							});
							resolve(childNodes);
							log('childNodes', childNodes);
						}
					}
				}).catch(e => {
					//TODO: alert error
				});
			},
			handleGraph(data){
				let mapping = {
					collection: 'app.Collection',
					table: 'app.Table',
					database: 'app.Database',
				};
				let cell = this.editor.graph.createCell(mapping[data.meta_type]);
				cell.set(FORM_DATA_KEY, {});
				this.count = this.count+50;
				cell.position(0,this.count);
				this.editor.graph.addCell(cell);
			}
		}
	};
</script>

<style >
	.filter-toolbar{
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
	.editor-container .editor .e-body .e-vue-component-wrap{
		overflow: auto;
	}
	.el-checkbox-button .el-checkbox-button__inner{
		padding: 6px 12px;
	}
	.search{
		width: 170px;
	}
	.filter-icon{
		font-size: 12px;
		color: #48b6e2;
	}
	.filter-icon-table{
		font-size: 13px;
		color: #4AAF47;
	}
	.filter-Graph{
		display: inline-block;
	}
	.filter-Graph :hover{
		display: inline-block;
		float: right;
	}
</style>
