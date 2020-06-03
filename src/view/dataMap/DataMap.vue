<template>
	<div class="data-map-container">
		<div class="data-map"></div>
		<div class="action-bar">
			<div class="left-bar">
				<span class="e-btn" @click="upward">
					<i class="el-icon-back"></i>
				</span>
			</div>
			<div class="center-bar">
				<el-radio-group v-model="level">
					<el-radio :label="1">顶级</el-radio>
					<span class="space-line"></span>
					<el-radio :label="2">库级</el-radio>
					<span class="space-line"></span>
					<el-radio :label="3">表级</el-radio>
				</el-radio-group>
			</div>
			<div class="right-bar">
				<span class="e-btn" @click="zoomIn">
					<i class="el-icon-zoom-in"></i>
				</span>
				<span class="e-btn" @click="zoomOut">
					<i class="el-icon-zoom-out"></i>
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

export default {
	name: "DataMap",

	data(){
		return {
			level: 1
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
			container: $(".data-map-container .data-map")
		});

		this.loadData();
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

		loadData(){
			let self = this;
			metadataInstances.dataMap(this.level).then(result => {

				if(result && result.data){
					let cells = result.data.records;
					self.dataMap.graph.renderCells(self.level, cells);
				}

			}).catch(err => {
				log(err);
			});
		}
	}
};
</script>

<style lang="less">
@import "../../editor/data-map/style/data-map";
</style>
