<template>
	<div class="data-map-container">
		<div class="data-map">
			<div class="left-side-classification">
				<div class="e-header">{{$t("dataMap.classification")}}</div>
				<div>
					<!--<el-input
						placeholder="输入关键字进行过滤"
						clearable
						v-model="filterText"
						size="mini">
					</el-input>-->

					<el-tree
						class="filter-tree"
						:data="treeData"
						default-expand-all
						:filter-node-method="filterNode"
						:props="{label: 'value'}"
						@node-click="loadCellsByTag"
						:expand-on-click-node="false"
						highlight-current
					>
					</el-tree>
				</div>
			</div>
		</div>
		<div class="action-bar">
			<div class="left-bar">
				<span class="e-btn" @click="upward">
					<i class="el-icon-back"></i>
				</span>
			</div>
			<div class="center-bar">
				<el-radio-group v-model="level">
					<el-radio :label="1">{{$t("dataMap.topLevel")}}</el-radio>
					<span class="space-line"></span>
					<el-radio :label="2">{{$t("dataMap.dbLevel")}}</el-radio>
					<span class="space-line"></span>
					<el-radio :label="3">{{$t("dataMap.tableLevel")}}</el-radio>
				</el-radio-group>
			</div>
			<div class="right-bar">
				<span class="e-btn" @click="toggleFullscreen">
					<i class="fullscreen-btn iconfont icon-quanping"></i>
				</span>
				<span class="e-btn" @click="zoomIn">
					<i class="iconfont icon-zoomin"></i>
				</span>
				<span class="e-btn" @click="zoomOut">
					<i class="iconfont icon-zoomout"></i>
				</span>
			</div>
		</div>
	</div>
</template>

<script>
import $ from "jquery";
import DataMap from "../../editor/data-map/index";
import log from "../../log";
import factory from "../../api/factory";

const metadataInstances = factory("MetadataInstances");
const metadataDefinitions = factory("MetadataDefinitions");

export default {
	name: "DataMap",

	data(){
		return {
			level: 1,
			tag: "",

			fullscreen: false,

			filterText: "",

			treeData: [],
		};
	},

	watch: {
		level: {
			handler(){
				this.loadData();
			}
		}
	},

	mounted() {
		let self = this;

		self.dataMap = new DataMap({
			container: $(".data-map-container .data-map"),
			leftSidebar: $(".data-map-container .left-side-classification")
		});

		this.loadData();

		this.loadClassification();

		this.dataMap.graph.on('drill_down', (level) => {
			if(self.level !== level && level >= 1 && level <= 3);
				self.level = level;
		});
	},

	methods: {
		upward(){
			if( this.level > 1){
				this.level--;
			}
		},

		zoomIn(){
			this.dataMap.graph.zoomIn();
		},

		zoomOut(){
			this.dataMap.graph.zoomOut();
		},

		toggleFullscreen(e){
			if(this.fullscreen)
				this.exitFullscreen();
			else
				this.requestFullscreen($(".data-map-container")[0]);

			this.fullscreen = !this.fullscreen;
			$(e.target).parent()
				.find('i.fullscreen-btn')
				.removeClass('icon-quanping')
				.removeClass('icon-huanyuanhuabu')
				.addClass(this.fullscreen ? 'icon-huanyuanhuabu' : 'icon-quanping')
		},

		requestFullscreen(element) {
			if(element.requestFullscreen){
				element.requestFullscreen();
			}
			else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			}
			else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			}
			else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		},

		exitFullscreen() {
			if(document.exitFullscreen) {
				document.exitFullscreen();
			} else if(document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if(document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		},

		loadData(){
			let self = this;
			metadataInstances.dataMap(this.level, this.tag).then(result => {

				if(result && result.data){
					let cells = result.data.records;
					self.dataMap.graph.renderCells(self.level, cells);
				}

			}).catch(err => {
				log(err);
			});
		},

		loadCellsByTag(data, node, comp){
			this.tag = data.id;
			this.loadData();
		},

		loadClassification(cb){
			let self = this;
			let params = {
				filter:{
					where:{
						item_type: {
							inq: ["table", "view", "collection", "mongo_view"]
						}
					}
				}
			};
			metadataDefinitions.get(params).then(result => {
				if( result && result.data){
					let items = result.data || [];
					let rootNode = {
						children: []
					};
					find_children(rootNode, items);
					self.treeData.splice(0, self.treeData.length);
					self.treeData.push(...rootNode.children);
				}
			}).catch(log);

			function find_children (parent, items) {

				if (!items || !items.length) return;

				parent.children = parent.children || [];
				for (let i = 0; i < items.length; i++) {
					let item = items[i];
					if ((item.parent_id === parent.id) || (!parent.id && !item.parent_id)) {
						item.selected = false;
						parent.children.push(item);
						items.splice(i, 1);
						i--;
					}
				}
				if (parent && parent.children && parent.children.length) {
					for (let j = 0; j < parent.children.length; j++) {
						find_children(parent.children[j], items);
					}
				}
			}
		},

		filterNode(value, data) {
			if (!value) return true;
			return data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1;
		}
	}
};
</script>

<style lang="less">
@import "../../editor/data-map/style/data-map";
	.data-map-container {
		.left-side-classification {
			padding: 20px;
			.el-tree-node__label {
				font-size: 12px;
			}
			.el-tree-node__content{
				border-bottom: 1px dotted #ddd;
			}

			.e-header {

			}
		}
	}
</style>
