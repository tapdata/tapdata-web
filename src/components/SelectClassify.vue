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
		<el-tree
			node-key="id"
			:props="props"
			:expand-on-click-node="false"
			lazy
			show-checkbox
			:load="loadNodes"
			:filter-node-method="filterNode"
			ref="tree"
			check-strictly
			@check-change="handleCheckChange"
			class="metaData-tree SelectClassify-tree"
		>
			<span class="custom-tree-node" slot-scope="{ node }">
				<span>
					<span
						class="iconfont icon-Folder-closed filter-icon"
					></span>
					<span class="table-label">{{ node.label }}</span>
				</span>
			</span>
		</el-tree>
		<span slot="footer" class="dialog-footer">
			<el-button type="danger" @click="handleCancel" size="mini"
				>- 批量移除</el-button
			>
			<el-button type="primary" @click="handleAdd" size="mini"
				>+ 批量添加</el-button
			>
		</span>
	</el-dialog>
</template>

<script>
import factory from "../api/factory";

const MetadataDefinitions = factory("MetadataDefinitions");
const MetadataInstances = factory("MetadataInstances");

export default {
	name: "SelectClassify.vue",
	props: {
		dialogVisible: {
			required: true,
			value: [Object, Array, null, undefined]
		},
		checkData: {
			required: true,
			value: [Object, Array, null, undefined]
		},
		listdata: {
			required: true,
			value: [Object, Array, null, undefined]
		}
	},
	data() {
		return {
			default_expanded: false,
			props: {
				children: "children",
				label: "label",
				isLeaf: "leaf"
			},
			data: [],
			tagList: []
		};
	},
	watch: {
		dialogVisible: function() {
			this.$emit("dialogVisible", this.dialogVisible);
		}
	},
	methods: {
		loadNodes(node, resolve) {
			let self = this;
			let filter = {
				where: {}
			};

			if (node.level === 0) {
				filter.where["parent_id"] = {
					exists: false
				};
				MetadataDefinitions.get({ filter: JSON.stringify(filter) })
					.then(res => {
						if (res.statusText === "OK" || res.status === 200) {
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
					})
					.catch(e => {
						this.$message.error("MetadataInstances error");
					});
			} else {
				filter.where["parent_id"] = {
					regexp: `^${node.data.id}$`
				};
				MetadataDefinitions.get({ filter: JSON.stringify(filter) })
					.then(res => {
						if (res.statusText === "OK" || res.status === 200) {
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
					})
					.catch(e => {
						this.$message.error("MetadataInstances error");
					});
			}
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},
		handleClose() {
			this.dialogVisible = false;
		},
		handleCheckChange(data, checked) {
			if (checked) {
				let node = {
					id: data.id,
					value: data.label
				};
				this.tagList.push(node);
			} else {
				this.tagList.map((k, index) => {
					if (k.id === data.id) {
						this.tagList.splice(index, 1);
					}
				});
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
			let metadatas = [];
			if (this.checkData) {
				this.checkData.forEach(item => {
					let classifications = [];
					if (this.listdata) {
						this.listdata.map(v => {
							if (v.id === item) {
								if (
									v.classifications &&
									v.classifications.length !== 0
								) {
									classifications.push(v.classifications);
								} else {
									classifications = [];
								}
							}
						});
					}
					if (classifications.length === 0) {
						this.tagList = [];
						this.$message.error("该数据源无此分类 不需要删除");
						return;
					} else {
						classifications.map(v => {
							this.tagList.map((k, index) => {
								if (v.id === k.id) {
									classifications.splice(index, 1);
								}
							});
						});
					}
					let node = {
						id: item,
						classifications: classifications
					};
					metadatas.push(node);
				});
			}
			metadatas = {
				metadatas: metadatas
			};
			MetadataInstances.classification(metadatas)
				.then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						// 清空数据
						this.dialogVisible = false;
						this.checkData = [];
						this.tagList = [];
						this.$refs.tree.setCheckedKeys([]);
						this.$emit("clearCheckData", []);
						this.$emit("dialogVisible", false);
					}
				})
				.catch(e => {
					this.$message.error(
						"MetadataInstancesClassification error"
					);
				});
		},
		handleAdd() {
			let metadatas = [];
			if (this.checkData) {
				this.checkData.forEach(item => {
					let classifications = [];
					if (this.listdata) {
						this.listdata.map(v => {
							if (v.id === item) {
								if (
									v.classifications &&
									v.classifications.length !== 0
								) {
									classifications.push(v.classifications);
								} else {
									classifications = [];
								}
							}
						});
					}
					if (classifications.length === 0) {
						classifications = this.tagList;
					} else {
						this.tagList.map(v => {
							classifications.push(v);
						});
					}
					let node = {
						id: item,
						classifications: classifications
					};

					metadatas.push(node);
				});
			}
			metadatas = {
				metadatas: metadatas
			};
			MetadataInstances.classification(metadatas)
				.then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						// 清空数据
						this.dialogVisible = false;
						this.checkData = [];
						this.tagList = [];
						this.$refs.tree.setCheckedKeys([]);
						this.$emit("clearCheckData", []);
						this.$emit("dialogVisible", false);
					}
				})
				.catch(e => {
					this.$message.error(
						"MetadataInstancesClassification error"
					);
				});
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
}
</style>
<style lang="less">
.SelectClassify-dialog {
	.el-dialog__body {
		padding: 0 0 0 20px;
	}
}
</style>
