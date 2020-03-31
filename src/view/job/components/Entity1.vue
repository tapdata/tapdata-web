<template>
	<div class="e-entity" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom">
		<el-container>
			<el-header height="20">
				<!-- {{schema ? schema.name : ''}} -->
			</el-header>
			<el-row class="header-row">
				<el-col :span="18">字段名</el-col>
				<el-col :span="4">字符类型</el-col>
				<el-col :span="2">操作</el-col>
			</el-row>
			<el-main>
				<el-tree
						:data="schema ? schema.fields : []"
						:node-key="nodeKey"
						default-expand-all
						:expand-on-click-node="false"
						@node-drag-start="handleDragStart"
						@node-drag-enter="handleDragEnter"
						@node-drag-leave="handleDragLeave"
						@node-drag-over="handleDragOver"
						@node-drag-end="handleDragEnd"
						@node-drop="handleDrop"
						:draggable="editable"
						:allow-drop="allowDrop"
						:allow-drag="allowDrag"
						icon-class="icon-none"
						@node-expand="handlerNodeExpand"
						@node-collapse="handlerNodeCollapse"
						ref="tree">
            <span class="custom-tree-node" slot-scope="{ node, data }">
						<span class="e-triangle" :style="`border-bottom-color: ${data.color || '#ddd'};`"></span>
						<span class="e-port e-port-in" :data-id="getId(data)"></span>
						<span class="e-label" :class="{ activename: isRename(data.id) }">
							<el-input v-model="data.label" @blur="handleRename(node,data)" :disabled="isRemove(data.id)"></el-input>
						</span>
						<el-select v-model="data.type" class="e-select" :class="{ activedatatype: isConvertDataType(data.id) }" :disabled="isRemove(data.id)" @change="handleDataType(node,data)">
							<el-option value="String" label="String"></el-option>
							<el-option value="Map" label="Map"></el-option>
							<el-option value="Integer" label="Integer"></el-option>
							<el-option value="Double" label="Double"></el-option>
							<el-option value="Array" label="Array"></el-option>
						</el-select>
						<span class="e-data-delete iconfont icon-l-del" @click="handleDelete(node,data)"></span>
						<span class="e-data-delete iconfont icon-return" @click="handleReset(node,data)"></span>
						<span class="e-port e-port-out" :data-id="getId(data)"></span>
					</span>
				</el-tree>
			</el-main>
		</el-container>
	</div>
</template>

<script>
	import $ from 'jquery';
	import log from '../../../log';
	import _ from 'lodash';
	//import factory from "../../../api/factory";

	const REMOVE_OPS_TPL = {
		id: '',
		op: 'REMOVE',
		field: ''
	};
	const RENAME_OPS_TPL = {
		id: '',
		op: 'RENAME',
		field: '',
		operand: ''
	};
	const CONVERT_OPS_TPL = {
		id: '',
		op: 'CONVERT',
		field: '',
		operand: '',
		originalDataType: '',
	};

	export default {
		name: "Entity1",
		props: {
			width: {
				type: Number,
				default: 0
			},
			originalSchema: {
				required: true,
				value: [Object, Array, null, undefined],
			},
			schema: {
				required: true,
				value: [Object, Array, null, undefined],
			},
			nodeKey: {
				type: String,
				default: 'id'
			},
			editable: {
				type: Boolean,
				default: false
			}
		},
		data() {
			//TODO: 1. 修改父节点名字时，下面会多出一行
			//TODO: 2. 父级节点数据类型只能有 map, array
			//TODO: 3. 组合操作 回退无效
			//TODO： 4. 删除时 颜色置灰

			return {
				operations: [],
			};
		},
		methods: {
			setOperations(operations) {
				this.operations = operations;
			},
			isRemove(id) {
				let ops = this.operations.filter(v => v.id === id && v.op === 'REMOVE');
				return ops && ops.length > 0;
			},
			isRename(id) {
				let ops = this.operations.filter(v => v.id === id && v.op === 'RENAME');
				return ops && ops.length > 0;
			},
			isConvertDataType(id) {
				let ops = this.operations.filter(v => v.id === id && v.op === 'CONVERT');
				return ops && ops.length > 0;
			},

			getId(node) {
				return node[this.nodeKey];
			},

			getOutPortByField(node) {
				if (!node)
					return null;
				let id = this.getId(node);
				return $(this.$refs.entityDom).find(`.e-port-out[data-id=${id}]`)[0];
			},
			getInPortByField(node) {
				if (!node)
					return null;
				let id = this.getId(node);
				return $(this.$refs.entityDom).find(`.e-port-in[data-id=${id}]`)[0];
			},
			handlerNodeExpand(data, node, ev) {
				this.$emit('expand', data);
			},
			handlerNodeCollapse(data, node, ev) {
				this.$emit('collapse', data);
			},
			handleDragStart(node, ev) {
			},
			handleDragEnter(draggingNode, dropNode, ev) {
			},
			handleDragLeave(draggingNode, dropNode, ev) {
			},
			handleDragOver(draggingNode, dropNode, ev) {
			},
			handleDragEnd(draggingNode, dropNode, dropType, ev) {
			},
			handleDrop(draggingNode, dropNode, dropType, ev) {
				this.$emit('drop', draggingNode);
			},
			allowDrop(draggingNode, dropNode, type) {
				return type !== 'inner';
			},
			allowDrag(draggingNode) {
				return draggingNode.data.children && draggingNode.data.children.length > 0;
			},
			getNativeData(fields, id) {
				let field = null;
				let fn = function (fields) {
					if (!fields) {
						return;
					}
					for (let i = 0; i < fields.length; i++) {
						let f = fields[i];
						if (f.id === id) {
							field = f;
							break;
						} else if (f.children) {
							fn(f.children);
						}
					}
				};
				fn(fields);
				return field;
			},
			handleDataType(node, data) {
				let nativeData = this.getNativeData(this.originalSchema.fields, data.id);
				let ops = this.operations.filter(v => v.id === nativeData.id && v.op === 'CONVERT');
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(CONVERT_OPS_TPL), {
						id: data.id,
						field: nativeData.label,
						operand: data.type,
						originalDataType: nativeData.type,
					});
					this.operations.push(op);
				} else {
					op = ops[0];
				}
				op.id = data.id;
				op.operand = data.type;
				this.$emit('dataChanged', this.operations);
			},
			handleRename(node, data) {
				let nativeData = this.getNativeData(this.originalSchema.fields, data.id);
				log("nativeData", this.operations);
				let ops = this.operations.filter(v => v.id === nativeData.id && v.op === 'RENAME');
				let op;
				if (data.label === nativeData.label) {
					return;
				}
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(RENAME_OPS_TPL), {
						id: data.id,
						field: nativeData.label,
						operand: data.label
					});
					this.operations.push(op);
				} else {
					Object.assign(ops[0], {
						id: data.id,
						field: nativeData.label,
						operand: data.label
					});
				}
				this.$emit('dataChanged', this.operations);
			},
			handleDelete(node, data) {
				let originalField = this.getNativeData(this.originalSchema.fields, data.id);
				let self = this;

				let fn = function (field) {

					for (let i = 0; i < self.operations.length; i++) { //删除所有的重命名的操作
						let ops = self.operations[i];
						if (self.operations[i].id === field.id && ops.op === 'RENAME') {
							let originalNode = self.getNativeData(self.schema.fields, field.id);
							originalNode.label = field.label;
							self.operations.splice(i, 1);
						}
					}
					for (let i = 0; i < self.operations.length; i++) { //删除所有的类型改变的操作
						let ops = self.operations[i];
						if (self.operations[i].id === field.id && ops.op === 'CONVERT') {
							let originalNode = self.getNativeData(self.schema.fields, field.id); //替换原始数据 主要是操作子节点
							originalNode.type = field.type;
							self.operations.splice(i, 1);
						}
					}

					let ops = self.operations.filter(v => v.op === 'REMOVE' && v.id === field.id);

					let op;
					if (ops.length === 0) {
						op = Object.assign(_.cloneDeep(REMOVE_OPS_TPL), {
							id: field.id,
							field: field.label,
							operand: true
						});
						self.operations.push(op);
					}

					if (field.children) {
						field.children.forEach(fn);
					}
				};
				fn(originalField);

				this.$emit('dataChanged', this.operations);
			},
			handleReset(node, data) {
				//子节点查找父节点
				let parentId = node.parent.data.id;
				let indexId = this.operations.filter(v => v.op === 'REMOVE' && v.id === parentId);
				if (parentId && indexId != 0) {
					return;
				}
				let self = this;
				let fn = function (node, data) {
					let nativeData = self.getNativeData(self.originalSchema.fields, data.id);
					for (let i = 0; i < self.operations.length; i++) {
						if (self.operations[i].id === data.id) {
							let ops = self.operations[i];
							if (ops.op === 'REMOVE') {
								self.operations.splice(i, 1);
								node.childNodes.forEach((childNode) => {
									fn(childNode, childNode.data);
								});
								break;
							}
							if (ops.op === 'RENAME') {
								node.data.label = nativeData.label;
								self.operations.splice(i, 1);
								break;
							}
							if (ops.op === 'CONVERT') {
								node.data.type = nativeData.type;
								self.operations.splice(i, 1);
								break;
							}
						}
					}
				};
				fn(node, data);
				this.$emit('dataChanged', this.operations);
			}

		}
	};
</script>

<style lang="less" scoped>

	@color: #71c179;

	.e-entity {
		width: 100%;
		border: 1px solid @color;
		display: inline-block;
		max-width: 600px;
		min-width: 400px;

		.el-header {
			line-height: 23px;
			background: @color;
			color: #ffffff;
			font-weight: bold;
		}

		.el-main {
			padding: 0;
			overflow: hidden;
		}

		.custom-tree-node {

			flex: 1;

			display: flex;
			justify-content: start;
			align-items: center;
			flex-direction: row;

			line-height: 25px;

			.e-port {
				width: 10px;
				height: 10px;
				/*background: #31d0c6;*/
				position: relative;
			}

			.e-port-in {
				left: -11px;
			}
			.e-label {
				flex: 1;

				input {
					color: #606266;
					outline: none;
					border: none;
					background: transparent;
					line-height: 20px;
					height: 25px;

					&:focus {
						background: #ffffaa;
					}
				}
			}

			.e-triangle {
				width: 0;
				height: 0;
				border-right: 5px solid transparent;
				border-left: 5px solid transparent;
				border-bottom: 5px solid transparent;

				-webkit-transform: rotate(-45deg);
				-moz-transform: rotate(-45deg);
				-ms-transform: rotate(-45deg);
				-o-transform: rotate(-45deg);
				transform: rotate(-45deg);

				position: relative;
				left: -3px;
				top: -11px;
			}

			.e-data-type {
				font-size: 0.8em;
			}

			.el-icon-more {
				-webkit-transform: rotate(90deg);
				-moz-transform: rotate(90deg);
				-ms-transform: rotate(90deg);
				-o-transform: rotate(90deg);
				transform: rotate(90deg);
			}

		}
	}

</style>
<style lang="less">

	@color: #71c179;
	.e-entity {
		font-size: 11px;
	}

	.header-row {
		display: inline;
		background-color: #71c179;
		color: #fff;
		line-height: 30px;
	}

	.row-col-base {
		display: inline-block;
	}

	.col-name {
		min-width: 150px;
		max-width: 430px;
	}

	.col-type {
		min-width: 100px;
	}

	.col-op {
		min-width: 50px;
	}

	.e-entity .el-main .el-tree .el-tree-node {
		border-bottom: 1px solid @color;

		&:last-child {
			border-bottom: none;
		}

		&:first-child {
			border-top: 1px solid @color;
		}

		.el-input__inner {
			border: none;
			background-color: transparent;
			font-size: 11px;

		}

		.activedatatype {
			.el-input__inner {
				color: @color;
			}
		}

		.activename {
			.el-input__inner {
				color: tomato;
			}
		}

		.e-select {
			width: 100px;
			border-left: 1px solid #71c179;
			border-right: 1px solid #71c179;
			font-size: 11px;
		}

		.e-data-delete {
			text-align: center;
			width: 40px;
		}

	}

	.e-entity .el-main .el-tree .el-tree-node .icon-none {
		display: none;
	}

</style>
