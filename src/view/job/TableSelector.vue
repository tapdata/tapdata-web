<template>
	<div class="box">
		<div class="box-head">
			<el-input class="search" v-model="filterText" clearable><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
			<i class="iconfont icon-xiangshanghebing2" @click="handleDefault_expanded"></i>
		</div>
		<el-tree
				:data="data"
				:props="props"
				node-key="id"
				:expand-on-click-node="false"
				lazy
				:load="loadTables"
				:filter-node-method="filterNode"
				ref="tree"
		>
			<span class="custom-tree-node" slot-scope="{ node, data}">
				<span @dblclick="handleGraph(data)">
					<span v-if="data.meta_type ==='database'" class="iconfont icon-shujuku filter-icon"></span>
					<span v-if="data.meta_type ==='table'" class="iconfont icon-table2  filter-icon-table"></span>
					<span v-if="data.meta_type ==='collection'" class="iconfont icon-collection filter-icon-table"></span>
					<span class="table-label">{{ node.label }}</span>
				</span>
				<span @click="handleGraph(data)" class="iconfont icon-xiayibu1 filter-icon filter-Graph"></span>

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
				count: 0,
				filterText:'',
				data: [],
				default_expanded:false,
				props: {
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
			this.loadDataBase();
		},
		watch: {
			filterText(val) {
				this.$refs.tree.filter(val);
			}
		},
		methods: {
			loadDataBase() {
				let self = this;
				let params = {
					filter: JSON.stringify({
						where: {
							meta_type: 'database',
							is_deleted:false
						},

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
									meta_type: record.meta_type,
									source:record.source||''
								});
							});
							log('data', self.data);
						}
					}
				}).catch(e => {
					this.$message.error('MetadataInstances error');
				});
			},
			loadTables(node, resolve) {
				if (node.level === 0) {
					return resolve(this.data);
				}
				if (node.level >1) {
					return resolve([]);
				}

				let params = {
					filter: JSON.stringify({
						where: {
							meta_type: {
								in: ['collection', 'table', 'mongo_view', 'view']
							},
							databaseId: {
								regexp: `^${node.key}$`
							},
							is_deleted:false
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
									_id:record.source._id,
									label: record.name || record.original_name,
									expanded: true,
									leaf: true,
									meta_type: record.meta_type,
									database_type:record.source.database_type||'',
									original_name:record.original_name ||'',
									fields:record.fields,
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
			handleDefault_expanded(){
				let self = this;
				let treeList = this.data;
				for (let i = 0; i < treeList.length; i++) {
					self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
				}
			},
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleGraph(data) {
				log('tableSelect handleGraph',data);
				let mapping = {
					collection: 'app.Collection',
					table: 'app.Table',
					database: 'app.Database',
					mongo_view: 'app.Collection',
					view: 'app.Table',
				};

				let formData = {};
				let schema = {};
				if(data.meta_type ==='database'){
					formData ={
						connectionId:data.source._id,
						name: data.source.name || data.label,
					};
				}else if(data.meta_type ==='table' || data.meta_type ==='view'|| data.meta_type ==='collection'|| data.meta_type ==='mongo_view'){
					let primaryKeys ='';
					if(data.fields){
						primaryKeys = data.fields.filter(item => item.primary_key_position > 0)
							.map(item => item.field_name).join(',');

						// TODO: MetadataInstances 中的 field，没有 original_field_name ，找 Sam 确认
						data.fields.forEach(item => item.original_field_name = item.original_field_name || item.field_name)
					}
					log('primaryKeys',primaryKeys);
					formData ={
						connectionId: data._id,
						databaseType: data.database_type,
						tableName: data.original_name ,
						sql: "",
						dropTable: false,
						type: data.meta_type,
						primaryKeys: primaryKeys,
						name: data.label || data.original_name,
					};
					schema ={
						table_name: data.name || data.original_name,
						cdc_enabled: true,
						meta_type: "table",
						fields:data.fields,
					};
				}

				this.count = this.count + 50;
				let cell = this.editor.graph.createCell(mapping[data.meta_type], formData,schema);
				let coordinates = this.editor.graph.getClientOffset();
				log('coordinates',coordinates);
				log('coordinates',coordinates.x+40,coordinates.y+this.count+160);
				cell.position(coordinates.x+400, coordinates.y+this.count+160);
				this.editor.graph.addCell(cell);
			},
		}
	};
</script>

<style scoped>
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
		width: 77% !important;
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
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.box-head{
		position: fixed;
		z-index: 2;
		background: #fff;
		overflow: hidden;
		width: 217px;
	}
	.el-tree{
		padding-top: 40px;
	}
</style>
<style scoped>
	/*头部样式*/
	.metadata-header{
		width: 232px;
		height: 31px;
		background: #f1f1f1;
		border-bottom: 1px solid #dedee4;
		font-size: 12px;
		line-height: 31px;
		padding-left: 8px;
		display: flex;
	}
</style>
<style lang="less">
	.search{
		.el-input  .el-input__inner {
			height: 24px;
			line-height: 24px;
		}
	}
</style>
