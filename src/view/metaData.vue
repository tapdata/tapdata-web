<template>
	<div class="metadata">
		<div class="metadata-header" v-show="isActive">
			<span>{{ $t('metaData.title') }}</span>
			<div class="metadata-header-btns">
				<i class="iconfont icon-icon_tianjia" @click="showDialog()"></i>
				<i class="iconfont icon-fangdajing" @click="isActive = false"></i>
				<i class="iconfont icon-sync" @click="getData"></i>
				<i class="iconfont icon-xiangxiahebing2" @click="handleDefault_expanded"></i>
			</div>
		</div>
		<div class="metadata-header metadata-header-btns" v-show="!isActive">
			<i class="iconfont icon-right-circle" @click="isActive = true"></i>
			<el-input class="search" v-model="filterText">
				<i slot="suffix" class="el-icon-search"></i>
			</el-input>
		</div>
		<div class="tree-block">
			<el-tree
				node-key="id"
				highlight-current
				:props="props"
				:expand-on-click-node="false"
				:data="treeData"
				:filter-node-method="filterNode"
				ref="tree"
				:render-after-expand="false"
				class="metaData-tree"
			>
				<span class="custom-tree-node" slot-scope="{ node, data }">
					<span class="iconfont icon-Folder-closed icon-folder"></span>
					<span class="table-label" @click="handleChecked(data)">{{ data.value }}</span>
					<el-dropdown class="btn-menu" size="mini" @command="handleRowCommand($event, node)">
						<el-button type="text"><i class="iconfont icon-gengduo3  task-list-icon"></i></el-button>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="add">{{ $t('metaData.addChildernNode') }}</el-dropdown-item>
							<el-dropdown-item command="edit">{{ $t('metaData.editNode') }}</el-dropdown-item>
							<el-dropdown-item command="delete">{{ $t('metaData.deleteNode') }}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</span>
			</el-tree>
		</div>
		<el-dialog size="mini" :visible.sync="dialogConfig.visible" width="30%">
			<span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
			<el-input
				size="mini"
				v-model="dialogConfig.label"
				:placeholder="$t('metaData.nodeName')"
				maxlength="50"
				show-word-limit
			></el-input>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="hideDialog()">{{ $t('message.cancel') }}</el-button>
				<el-button size="mini" type="primary" @click="dialogSubmit()">
					{{ $t('message.confirm') }}
				</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import factory from '../api/factory';

const MetadataDefinitions = factory('MetadataDefinitions');

export default {
	name: 'metaData',
	props: {
		type: {
			type: String,
			default: 'dataflow'
		}
	},
	data() {
		return {
			filterText: '',
			treeData: [],
			default_expanded: false,
			props: {
				key: 'id',
				label: 'value'
			},
			isActive: true,

			dialogConfig: {
				type: 'add',
				id: '',
				label: '',
				title: '',
				visible: false
			},

			nodeName: '',
			parent_id: '',
			title: ''
		};
	},
	mounted() {
		this.getData();
	},
	watch: {
		filterText(val) {
			this.$refs.tree.filter(val);
		}
	},
	methods: {
		getData(cb) {
			let params = {
				filter: {
					where: {
						or: [{ item_type: this.type }]
					}
				}
			};
			MetadataDefinitions.get(params).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.treeData = this.formatData(res.data);
						cb && cb(res.data);
					}
				}
			});
		},
		//格式化分类数据
		formatData(items) {
			if (items && items.length) {
				let map = {};
				let nodes = [];
				//遍历第一次， 先把所有子类按照id分成若干数组
				items.forEach(it => {
					if (it.parent_id) {
						let children = map[it.parent_id] || [];
						children.push(it);
						map[it.parent_id] = children;
					} else {
						nodes.push(it);
					}
				});
				//接着从没有子类的数据开始递归，将之前分好的数组分配给每一个类目
				let checkChildren = nodes => {
					return nodes.map(it => {
						let children = map[it.id];
						if (children) {
							it.children = checkChildren(children);
						}
						return it;
					});
				};
				return checkChildren(nodes);
			}
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.value.indexOf(value) !== -1;
		},
		handleDefault_expanded() {
			let self = this;
			let treeList = this.treeData;
			for (let i = 0; i < treeList.length; i++) {
				self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
			}
		},
		handleRowCommand(command, node) {
			switch (command) {
				case 'add':
				case 'edit':
					this.showDialog(node, command);
					break;
				case 'delete':
					this.deleteNode(node.key);
			}
		},
		showDialog(node, dialogType) {
			let type = dialogType || 'add';
			this.dialogConfig = {
				visible: true,
				type,
				id: node ? node.key : '',
				label: type === 'edit' ? node.label : '',
				title:
					type === 'add'
						? node
							? this.$t('metaData.addChildernNode')
							: this.$t('metaData.addNode')
						: this.$t('metaData.editNode')
			};
		},
		hideDialog() {
			this.dialogConfig = {
				visible: false
			};
		},
		async dialogSubmit() {
			let config = this.dialogConfig;
			let value = config.label;
			let id = config.id;
			let method = 'post';
			if (!value || value.trim() === '') {
				this.$message.error(this.$t('metaData.nodeName'));
				return;
			}
			let nameExist = await this.checkName(value);
			if (nameExist) {
				return this.$message.error(this.$t('metaData.nameExist'));
			}
			let params = {
				item_type: [this.type],
				value
			};
			if (config.type === 'edit') {
				method = 'patch';
				params.id = id;
			} else if (id) {
				params.parent_id = id;
			}

			MetadataDefinitions[method](params)
				.then(res => {
					let self = this;
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							self.getData();
							self.hideDialog();
						}
					}
				})
				.catch(e => {
					this.$message.error('MetadataInstances error' + e);
				});
		},
		deleteNode(id) {
			this.$confirm(this.$t('metaData.deteleMessage'), {
				confirmButtonText: this.$t('message.delete'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(() => {
				MetadataDefinitions.delete(id).then(res => {
					let self = this;
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							self.getData();
						}
					} else {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			});
		},
		checkName(value) {
			return new Promise(resolve => {
				this.getData(items => {
					resolve(items.find(it => it.value === value));
				});
			});
		},
		handleChecked(data) {
			this.$emit('nodeClick', data);
		}
	}
};
</script>

<style scoped lang="less">
.metadata {
	height: calc(100vh - 15px);
	width: 100%;
	user-select: none;
	margin-top: 10px;
	box-sizing: border-box;
	border-right: 1px solid #dedee4;
	border-bottom: 1px solid #dedee4;
	background: #fff;
	/*头部样式*/
	.metadata-header {
		height: 28px;
		background: #f5f5f5;
		border-bottom: 1px solid #dedee4;
		border-top: 1px solid #dedee4;
		font-size: 12px;
		line-height: 31px;
		padding-left: 8px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		.search {
			margin: 0 8px;
		}
	}
	.metadata-header-btns {
		color: #999;
		.iconfont:hover {
			color: #333;
		}
	}
	.tree-block {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: auto;
	}
	.custom-tree-node {
		flex: 1;
		display: flex;
		align-items: center;
		font-size: 12px;
		padding-right: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 26px;
		.icon-folder {
			margin-right: 5px;
			font-size: 12px;
			// color: #48b6e2;
			color: #edc958;
		}
		.table-label {
			flex: 1;
			font-size: 12px;
			vertical-align: middle;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.btn-menu {
			display: none;
		}
		&:hover .btn-menu {
			display: block;
		}
	}
}
</style>
<style lang="less">
.metadata-header {
	.el-input .el-input__inner {
		height: 24px;
		line-height: 24px;
	}
}
.metaData-tree {
	padding-bottom: 50px;
	.el-tree-node__content {
		height: 26px;
		overflow: hidden;
	}
}
</style>
