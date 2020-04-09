<template>
	<div class="e-entity" :style="width > 0 ? `width: ${width}px;` : ''" ref="entityDom">
		<el-container>
			<el-header height="20">
				{{schema ? schema.name : ''}}
			</el-header>
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
						<span class="e-port e-port-in" :data-id="getId(data)" :data-table="getTableName(data)"></span>
						<span class="e-pk">{{ data.primary_key_position > 0 ? 'PK' : '' }}</span>
						<span class="e-label">{{node.label}}</span>
						<span class="e-data-type">{{ data.type}}</span>
						<el-dropdown v-if="editable" size="mini" @command="(command) => {handlerCommand(command, data, node)}">
							<span class="el-dropdown-link">
								<i class="el-icon-more el-icon--right"></i>
							</span>
							<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="rename">Rename</el-dropdown-item>
							<el-dropdown-item command="delete">Delete</el-dropdown-item>
							<el-dropdown-item command="change_type" divided>Modified data type</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
						<span class="e-port e-port-out" :data-id="getId(data)" :data-table="getTableName(data)"></span>
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
				value: [Object, Array, null, undefined],
			},
			nodeKey: {
				type: String,
				default: 'id'
			},
			editable: {
				type: Boolean,
				default: false
			},
			tableNameKey: {
				type: String,
				default: 'table_name'
			}
		},

		watch: {
			schema: {
				handler() {
					log('Entity.schema.change', this.schema);
				}
			}
		},

		methods: {

			getId(node){
				return node[this.nodeKey];
			},
			getTableName(node){
				let tableName = node[this.tableNameKey];
				tableName = tableName.replace(/[\\.,]/g, '_');
				return tableName;
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
			getOutPortByTable(table){
				if( !table )
					return null;
				let tableName = this.getTableName(table);
				return $(this.$refs.entityDom).find(`.e-port-out[data-table=${tableName}]`)[0];
			},
			getInPortByTable(table){
				if( !table )
					return null;
				let tableName = this.getTableName(table);
				return $(this.$refs.entityDom).find(`.e-port-in[data-table=${tableName}]`)[0];
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
		max-width: 300px;
		text-align: left;

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

			.e-pk{
				font-size: 9px;
				font-weight: bold;
				color: #FFA000;
				position: relative;
				left: -14px;
				display: inline-block;
				width: 5px;
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
	}
	.e-entity .el-main .el-tree .el-tree-node .icon-none {
		display: none;
	}

</style>
