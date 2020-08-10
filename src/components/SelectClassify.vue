<template>
	<el-dialog
		title="批量分类操作"
		:visible.sync="dialogVisible"
		width="600px"
		class="SelectClassify-dialog"
		:before-close="handleClose"
	>
		<div>
			<el-tag
				size="mini"
				class="SelectClassify-tag"
				closable
				v-for="item in tagList"
				v-bind:key="item.value"
				@close="handleCloseTag(item)"
				>{{ item.value }}</el-tag
			>
		</div>
		<div>
			<el-tag
				size="mini"
				type="info"
				class="SelectClassify-tag"
				v-for="item in oldTagList"
				v-bind:key="item.value"
				>{{ item.value }}</el-tag
			>
			<el-button size="mini" @click="handleClearOldTag" round v-if="Object.keys(oldTagList).length > 0"
				>Clear</el-button
			>
		</div>
		<el-tree
			node-key="id"
			:props="props"
			:expand-on-click-node="false"
			:data="treeData"
			:filter-node-method="filterNode"
			ref="tree"
			check-strictly
			@node-click="handleCheckChange"
			class="metaData-tree SelectClassify-tree"
		>
			<span class="custom-tree-node" slot-scope="{ node, data }">
				<span>
					<span class="iconfont icon-Folder-closed filter-icon"></span>
					<span class="table-label">{{ data.value }}</span>
				</span>
			</span>
		</el-tree>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleCancel" size="mini">取消</el-button>
			<el-button type="primary" @click="handleAdd" size="mini">保存修改</el-button>
		</span>
	</el-dialog>
</template>

<script>
import factory from '../api/factory';
import _ from 'lodash';

const MetadataDefinitions = factory('MetadataDefinitions');

export default {
	name: 'SelectClassify.vue',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		},
		type: {
			required: true,
			value: String
		},
		tagLists: {
			required: true,
			value: Object || []
		}
	},
	data() {
		return {
			default_expanded: false,
			props: {
				children: 'children',
				label: 'label',
				isLeaf: 'leaf'
			},
			treeData: [],
			tagList: [],
			oldTagList: []
		};
	},
	watch: {
		dialogVisible: {
			handler() {
				if (this.dialogVisible) {
					this.oldTagList = _.cloneDeep(this.tagLists);
					this.getData();
				}
			}
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
			return data.label.indexOf(value) !== -1;
		},
		handleClose() {
			this.tagList = [];
			this.oldTagList = [];
			this.$emit('dialogVisible', false);
		},
		handleClearOldTag() {
			this.oldTagList = '';
		},
		handleCheckChange(data) {
			this.oldTagList = [];
			if (this.tagList.lengt > 0 && data.id === this.tagList[0].id) {
				this.tagList = [];
			} else {
				this.tagList = [];
				let node = {
					id: data.id,
					value: data.value
				};
				this.tagList.push(node);
			}
		},
		handleCloseTag(data) {
			let checkList = this.$refs.tree.getCheckedKeys();
			if (checkList.length > 0) {
				checkList.map((k, index) => {
					if (k === data.id) {
						checkList.splice(index, 1);
					}
				});
				this.$refs.tree.setCheckedKeys(checkList);
			}
			this.tagList.map((k, index) => {
				if (k.id === data.id) {
					this.tagList.splice(index, 1);
				}
			});
		},
		handleCancel() {
			this.handleClose();
		},
		handleAdd() {
			if (Object.keys(this.oldTagList).length !== 0) {
				this.handleClose();
				return;
			}
			if (this.tagList && this.tagList.length === 0) {
				this.tagList = [];
			}
			this.$emit('operationsClassify', this.tagList);
			this.handleClose();
		}
	}
};
</script>

<style scoped lang="less">
.filter-icon {
	font-size: 12px;
	color: #edc958;
}

.SelectClassify-tree {
	max-height: 500px;
	overflow-y: auto;
	.el-dialog__body {
		padding: 0 0 0 20px;
	}
}
.SelectClassify-tag {
	margin-right: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
}
</style>
<style lang="less">
.SelectClassify-dialog {
	.el-dialog__body {
		padding: 0 0 0 20px;
	}
}
</style>
