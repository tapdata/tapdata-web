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
						<span class="e-label" :class="{ activename: data.isActiveName }" >
							<el-input v-model="data.label"  @blur="handleRename(node,data)" :disabled="data.isDisable" ></el-input>
						</span>
						<el-select v-model="data.type" class="e-select" :class="{ activedatatype: data.isActiveDataType }" :disabled="data.isDisable" @change="handleDataType(node,data)" >
							<el-option value="String" label="String"></el-option>
							<el-option value="Map" label="Map"></el-option>
							<el-option value="Integer" label="Integer"></el-option>
							<el-option value="Double" label="Double"></el-option>
							<el-option value="Array" label="Array"></el-option>
						</el-select>
						<span v-show="!data.isDisable" class="e-data-delete iconfont icon-l-del" @click="handleDelete(node)"></span>
						<span v-show="data.isDisable" class="e-data-delete iconfont icon-return" @click="handleReset(node)"></span>
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
		data(){
			return{
				cloneData: '',
				currentnodekey:'',
				activeName: false,
				activeDataType:false
			}
		},
		mounted(){
			//cloneData 是深拷贝schema,用于数据比较
			this.cloneData = JSON.parse(JSON.stringify(this.schema))
			
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
			getNativeData(data,id){
				let nativeData ={
					name:'',
					type:''
				}
				if(!data){
					return
				}
				data.map(item =>{
					if(item.id === id){
						 nativeData.name = item.label
						 nativeData.type = item.type
					}else{
						 this.getNativeData(item.children,id)
					}
				})
				return nativeData
			},
			handleDataType(node,data){
				let nativeData = this.getNativeData(this.cloneData.fields,data.id)
				if(data.type === nativeData.type){
					node.data.isActiveDataType = false
				}else{
					node.data.isActiveDataType = true
				}
			},
			handleRename(node,data){							
				let nativeData = this.getNativeData(this.cloneData.fields,data.id)
				if(data.label === nativeData.name){
					node.data.isActiveName = false
				}else{
					node.data.isActiveName = true
				}				
			},
			handleDelete(node){
				node.data.isDisable = true	
				node.data.isActiveName = false
				node.data.isActiveDataType = false
			},
			handleReset(node){
				let nativeData = this.getNativeData(this.cloneData.fields,node.data.id)
				node.data.isDisable = false
				node.data.label = nativeData.name
				node.data.type = nativeData.type
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
		min-width: 488px;

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
	.e-entity{
		font-size: 11px;
	}
	.header-row{
		display: inline;
		background-color: #71c179;
		color: #fff;
		line-height: 40px;
	}
	.row-col-base{
		display: inline-block;
	}
	.col-name{
		min-width: 150px;
		max-width: 430px;
	}
	.col-type{
		min-width: 100px;
	}
	.col-op{
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
		.activedatatype{
			.el-input__inner{
				color:@color;
			}
		}
		.activename{
			.el-input__inner{
				color: tomato;
			}
		}
		.e-select{
			width:100px;
			border-left: 1px solid #71c179;
			border-right: 1px solid #71c179;
			font-size: 11px;
		}
		.e-data-delete{
			text-align: center;
			width:40px;
		}
		
		
	}
	.e-entity .el-main .el-tree .el-tree-node .icon-none {
		display: none;
	}

</style>
