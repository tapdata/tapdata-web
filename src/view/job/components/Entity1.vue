<template>
	<div class="e-entity" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom">
		<el-container>
			<el-header height="20">
				<!-- {{schema ? schema.name : ''}} -->
				
			</el-header>
			<el-row >
				<el-col :span='12'>字段名</el-col>
				<el-col :span='10'> 字段类型</el-col>
				<el-col :span='2'>操作</el-col>
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
						<span class="e-triangle" :style="`border-bottom-color: ${data.color || '#ffffff'};`"></span>
						<span class="e-port e-port-in" :data-id="getId(data)"></span>
						<span class="e-label">
							<el-input v-model="data.label"></el-input>
						</span>
						<el-select v-model="data.type" class="e-select">
							<el-option value="String" label="String"></el-option>
							<el-option value="Map" label="Map"></el-option>
							<el-option value="Integer" label="Integer"></el-option>
							<el-option value="Double" label="Double"></el-option>
							<el-option value="Array" label="Array"></el-option>
						</el-select>
						<span class="e-data-delete">删除</span>
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

	export default {
		name: "Entity",
		props: {
			width: {
				type: Number,
				default: 0
			},
			schema: {
				required: true,
				type: Object | Array | null | undefined,
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

		watch: {
			schema: {
				handler() {
					log.log('Entity.schema.change', this.schema);
				}
			}
		},

		methods: {

			getId(node){
				return node[this.nodeKey];
			},

			getOutPortByField(node){
				if( !node )
					return null;
				let id = this.getId(node);
				return $(this.$refs.entityDom).find(`.e-port-out[data-id=${id}]`)[0];
			},
			getInPortByField(node){
				if( !node )
					return null;
				let id = this.getId(node);
				return $(this.$refs.entityDom).find(`.e-port-in[data-id=${id}]`)[0];
			},
			handlerNodeExpand(data, node, ev){
				this.$emit('expand', data);
			},
			handlerNodeCollapse(data, node, ev){
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
			handlerCommand(command, data, node){
				if( command === 'rename') {
					this.$prompt( 'Input new name', 'Rename', {
						inputValue: data.label
					}).then((res) => {
						data.label = res.value;
					});
				} else if( command === 'delete') {
					this.$refs.tree.remove(node);
				} else if( command === 'change_type') {
					this.$message({
						message: 'Modified data type is not implemented',
						type: 'warning'
					});
				}
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
		max-width: 500px;

		.el-header {
			line-height: 23px;
			background: @color;
			color: #ffffff;
			font-weight: bold;
		}

		.el-main {
			padding: 0;
		}

		.custom-tree-node {

			flex: 1;

			display: flex;
			justify-content: start;
			align-items: center;
			flex-direction: row;

			line-height: 25px;

			.e-port{
				width: 10px;
				height: 10px;
				/*background: #31d0c6;*/
				position: relative;
			}

			.e-port-in {
				left: -11px;
			}

			/*.e-port-out{
				position: absolute;
				right: 0;
			}*/

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

			.el-icon-more{
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
		}
		.e-select{
			width:100px;
			border-left: 1px solid #71c179;
			border-right: 1px solid #71c179;
		}
		.e-data-delete{
			text-align: center;
			width:80px;
		}
	}
	.e-entity .el-main .el-tree .el-tree-node .icon-none {
		display: none;
	}

</style>
