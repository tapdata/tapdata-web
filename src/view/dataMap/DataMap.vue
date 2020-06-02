<template>
	<div class="data-map-container">
		<div class="data-map"></div>
		<div class="action-bar">
			<div class="left-bar">
				<i class="e-btn el-icon-back" @click="getData"></i>
			</div>
			<div class="center-bar">
				<i class="e-btn el-icon-help"></i>
				<i class="e-btn el-icon-help"></i>
				<i class="e-btn el-icon-help"></i>
				<i class="e-btn el-icon-help"></i>
			</div>
			<div class="right-bar">
				<i class="e-btn el-icon-zoom-in"></i>
				<i class="e-btn el-icon-zoom-out"></i>
			</div>
		</div>
	</div>
</template>

<script>
import $ from "jquery";
import DataMap from "../../editor/data-map/index";
import log from "../../log";
export default {
	name: "DataMap",

	mounted() {
		let self = this;

		self.dataMap = new DataMap({
			container: $(".data-map-container .data-map")
		});
	},

	methods: {
		getData(){
			log("DataMap.getData", this.dataMap.graph.getData());
		}
	}
};
</script>

<style lang="less">
@import "../../editor/data-map/style/data-map";
</style>
