<template>
	<div class="metadata">
		<div class="box-tree">
			<div class="metadata-header" v-show="isActive">
				<span>数据分类</span>
				<div class="metadata-header-right">
					<i class="iconfont icon-icon_tianjia" @click="addNode()"></i>
					<i class="iconfont icon-fangdajing" @click="displaySearch(false)"></i>
					<i class="iconfont icon-sync" @click="handleList"></i>
					<i class="iconfont icon-xiangxiahebing2" @click="handleDefault_expanded"></i>
				</div>
			</div>
			<div class="metadata-header" v-show="!isActive">
				<i class="iconfont icon-right-circle" @click="displaySearch(true)"></i>
				<el-input class="search" v-model="filterText"
					><i slot="suffix" class="el-input__icon el-icon-search"></i
				></el-input>
			</div>
			<el-tree
				node-key="id"
				:props="props"
				:expand-on-click-node="false"
				:data="data"
				:filter-node-method="filterNode"
				ref="tree"
				default-expand-all
				class="metaData-tree"
			>
				<span class="custom-tree-node" slot-scope="{ node, data }">
					<span>
						<span class="iconfont icon-Folder-closed filter-icon"></span>
						<span class="table-label" @click="handleChecked(data)">{{ data.value }}</span>
						<span>
							<el-dropdown @command="handleRowCommand" class="item">
								<el-button type="text"
									><i class="iconfont icon-gengduo3  task-list-icon"></i
								></el-button>
								<el-dropdown-menu slot="dropdown">
									<el-dropdown-item :command="'children' + node.key">
										{{ $t("metaData.addChildernNode") }}</el-dropdown-item
									>
									<el-dropdown-item :command="'add' + node.key">
										{{ $t("metaData.addNode") }}</el-dropdown-item
									>
									<el-dropdown-item :command="'edit' + node.key">
										{{ $t("metaData.editNode") }}</el-dropdown-item
									>
									<el-dropdown-item :command="'delete' + node.key">
										{{ $t("metaData.deleteNode") }}</el-dropdown-item
									>
								</el-dropdown-menu>
							</el-dropdown>
						</span>
					</span>
				</span>
			</el-tree>
			<el-dialog :title="title" :visible.sync="dialogVisibleNodeName" width="30%" :before-close="handleClose">
				<span><el-input v-model="nodeName"></el-input></span>
				<span slot="footer" class="dialog-footer">
					<el-button @click="dialogVisibleNodeName = false">取 消</el-button>
					<el-button type="primary" @click="handleAddNode()">确 定</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import factory from "../api/factory";
import log from "../log";

const MetadataDefinitions = factory("MetadataDefinitions");
const MetadataInstances = factory("MetadataInstances");

export default {
	name: "metaData",
	data() {
		return {
			count: 0,
			filterText: "",
			data: [],
			search: "",
			default_expanded: false,
			props: {
				children: "children",
				label: "label",
				isLeaf: "leaf"
			},
			mapping: {
				collection: "app.Collection",
				table: "app.Table",
				database: "app.Database"
			},
			listdata: [],
			checkAll: [],
			checkData: [],
			checkedValue: {
				label: "all datas"
			},
			options: [
				{
					value: "",
					label: "all types"
				},
				{
					value: "database",
					label: "database"
				},
				{
					value: "mongoDB",
					label: "mongoDB"
				},
				{
					value: "table",
					label: "table"
				},
				{
					value: "collection",
					label: "collection"
				},
				{
					value: "api",
					label: "api"
				},
				{
					value: "flow",
					label: "flow"
				},
				{
					value: "file",
					label: "file"
				},
				{
					value: "view",
					label: "view"
				},
				{
					value: "mongo_view",
					label: "mongo_view"
				}
			],
			optionsType: [
				{
					value: "",
					label: "all"
				},
				{
					value: "no type",
					label: "no type"
				}
			],
			checkClassify: "",
			checkType: "",
			isActive: true,
			dialogVisible: false,
			type: "dataflow",
			dialogVisibleNodeName: false,
			typeNode: "",
			nodeName: "",
			parent_id: "",
			title: ""
		};
	},
	async mounted() {
		this.handleList();
		this.getData();
	},
	watch: {
		filterText(val) {
			this.$refs.tree.filter(val);
		}
	},
	methods: {
		getData() {
			let params = {
				filter: {
					where: {
						or: [{ item_type: this.type }]
					}
				}
			};
			MetadataDefinitions.get(params).then(res => {
				if (res.statusText === "OK" || res.status === 200) {
					if (res.data) {
						let items = res.data;
						let rootNode = {
							children: []
						};
						this.find_children(rootNode, items);
						this.data = rootNode.children;
					}
				}
			});
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},
		handleList() {
			this.checkedValue = "all datas";
			let params = {
				filter: JSON.stringify({
					where: {
						is_deleted: false,
						meta_type: this.type
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
			MetadataInstances.get(params)
				.then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.listdata = res.data;
						}
					}
				})
				.catch(e => {
					this.$message.error("MetadataInstances error");
				});
		},
		handleDefault_expanded() {
			let self = this;
			let treeList = this.data;
			for (let i = 0; i < treeList.length; i++) {
				self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
			}
		},
		handleSearch() {
			let params = {};
			if (this.checkType) {
				params[`filter[where][meta_type]`] = this.checkType;
			}
			if (this.search) {
				params[`filter[where][or][1][original_name][like]`] = this.search;
			}
			MetadataInstances.get(params)
				.then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.listdata = res.data;
						}
					}
					log("listdata", self.listdata);
				})
				.catch(e => {
					this.$message.error("MetadataInstances error");
				});
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
				this.$message.info("please select classify");
				return;
			}
			this.dialogVisible = true;
		},
		handleRowCommand(command) {
			if (command.indexOf("add") !== -1) {
				let node = command.replace("add", "");
				this.addNode(node);
			} else if (command.indexOf("children") !== -1) {
				let node = command.replace("children", "");
				this.addChildNode(node);
			} else if (command.indexOf("edit") !== -1) {
				let node = command.replace("edit", "");
				this.editNode(node);
			} else if (command.indexOf("delete") !== -1) {
				let node = command.replace("delete", "");
				this.deleteNode(node);
			}
		},
		addNode() {
			//通过node-key 获取node data
			this.nodeName = "";
			this.typeNode = "addNode";
			this.title = this.$t("metaData.addNode");
			this.dialogVisibleNodeName = true;
		},
		addChildNode(id) {
			this.parent_id = id;
			this.nodeName = "";
			this.typeNode = "addChildNode";
			this.title = this.$t("metaData.addChildernNode");
			this.dialogVisibleNodeName = true;
		},
		editNode(id) {
			let node = this.$refs.tree.getNode(id);
			this.parent_id = id;
			this.nodeName = node.data.value;
			this.typeNode = "editNode";
			this.title = this.$t("metaData.editNode");
			this.dialogVisibleNodeName = true;
		},
		deleteNode(id) {
			this.$confirm(this.$t("metaData.deteleMessage"), {
				confirmButtonText: this.$t("message.delete"),
				cancelButtonText: this.$t("message.cancel"),
				type: "warning"
			}).then(() => {
				MetadataDefinitions.delete(id).then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.data = res.data;
							self.getData();
							self.dialogVisibleNodeName = false;
						}
					} else {
						this.$message.info(this.$t("message.deleteFail"));
					}
				});
			});
		},
		handleAddNode() {
			let data = {
				item_type: [this.type],
				value: this.nodeName
			};
			if (this.typeNode === "addChildNode") {
				data.parent_id = this.parent_id;
			}
			if (this.typeNode === "editNode") {
				data.id = this.parent_id;
			}
			this.handlePostNode(data);
		},
		handleClose() {
			this.dialogVisibleNodeName = false;
		},
		handlePostNode(data) {
			MetadataDefinitions[this.typeNode === "editNode" ? "patch" : "post"](data)
				.then(res => {
					let self = this;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							self.data = res.data;
							self.getData();
							self.dialogVisibleNodeName = false;
						}
					}
				})
				.catch(e => {
					this.$message.error("MetadataInstances error");
				});
		},
		find_children(parent, items) {
			if (!items || !items.length) return;
			parent.children = [] || parent.children;
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				if (item.parent_id === parent.id || (!parent.id && !item.parent_id)) {
					parent.children.forEach(v => (v.islabe = false));
					parent.children.push(item);
					items.splice(i, 1);
					i--;
				}
			}
			if (parent && parent.children && parent.children.length) {
				for (let j = 0; j < parent.children.length; j++) {
					this.find_children(parent.children[j], items);
				}
			}
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
	position: fixed;
	z-index: 2;
}

.box-tree {
	float: left;
	width: 240px;
	border: 1px solid #dedee4;
	height: calc(100vh - 1px);
}
.box-ul {
	float: left;
}
.list-box {
	margin-top: 114px;
}
.classify-ul {
	background-color: #fff;
	overflow: hidden;
	color: #303133;
	transition: 0.3s;
	list-style: none;
	font-size: 12px;
	width: 300px;
	height: calc(100vh - 1px);
	overflow-y: auto;
	border-right: 1px solid #dedee4;
}

.classify-ul li {
	width: 263px;
	height: 34px;
	line-height: 43px;
	margin-left: 8px;
	padding-left: 10px;
	background: #ffffff;
	border-radius: 3px;
	overflow: hidden;
	text-overflow: ellipsis;
	span {
		font-size: 12px;
	}
}
.box-head {
	position: fixed;
	width: 292px;
	z-index: 4;
	background: #f5f5f5;
	border-bottom: 1px solid #dedee4;
}
.search-input {
	width: 94%;
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
	margin-left: 104px;
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
