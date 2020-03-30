<template>
	<div class="filter-toolbar">
		<el-tree
				:data="data"
				node-key="id"
				default-expand-all
				:expand-on-click-node="false">
			<span class="custom-tree-node" slot-scope="{ node}">
				<span>
					<span class="iconfont icon-charulianjie"></span>
					{{ node.label }}
				</span>
				<span @click="handleGraph()">链接</span>
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
				data: [{
					label: '一级 1',
					children: [{
						label: '二级 1-1',
						children: [{
							label: '三级 1-1-1'
						}]
					}]
				}, {
					label: '一级 2',
					children: [{
						label: '二级 2-1',
						children: [{
							label: '三级 2-1-1'
						}]
					}, {
						label: '二级 2-2',
						children: [{
							label: '三级 2-2-1'
						}]
					}]
				}, {
					label: '一级 3',
					children: [{
						label: '二级 3-1',
						children: [{
							label: '三级 3-1-1'
						}]
					}, {
						label: '二级 3-2',
						children: [{
							label: '三级 3-2-1'
						}, {
							label: '一级 3',
							children: [{
								label: '二级 3-1',
								children: [{
									label: '三级 3-1-1'
								}]
							}, {
								label: '二级 3-2',
								children: [{
									label: '三级 3-2-1'
								}]
							}, {
								label: '一级 3',
								children: [{
									label: '二级 3-1',
									children: [{
										label: '三级 3-1-1'
									}]
								}, {
									label: '二级 3-2',
									children: [{
										label: '三级 3-2-1'
									}, {
										label: '一级 3',
										children: [{
											label: '二级 3-1',
											children: [{
												label: '三级 3-1-1'
											}]
										}, {
											label: '二级 3-2',
											children: [{
												label: '三级 3-2-1'
											}]
										}, {
											label: '一级 3',
											children: [{
												label: '二级 3-1',
												children: [{
													label: '三级 3-1-1'
												}]
											}, {
												label: '二级 3-2',
												children: [{
													label: '三级 3-2-1'
												}]
											}]
										}]
									}]
								}]
							}]
						}]
					}]
				}],
				defaultProps: {
					children: 'children',
					label: 'label'
				}
			};
		},
		created() {
			this.getData();
		},
		methods: {
			handleNodeClick(data) {
			},
			getData() {
				let parm  = {
					meta_type: 'database'
				};
				MetadataInstances.get(parm).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							this.data = res.data;
							log('data', res.data);
						}
					}
				});
			},
			handleGraph(){
				let cell = this.editor.graph.createCell('app.Collection');
				cell.set(FORM_DATA_KEY, {});
				this.editor.graph.addCell(cell,0,0);
			}
		}
	};
</script>

<style>
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
		overflow:hidden;
		overflow-x: scroll !important;
	}
</style>
