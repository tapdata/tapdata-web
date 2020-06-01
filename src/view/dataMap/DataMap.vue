<template>
	<div class="data-map-container">
		<div class="data-map"></div>
	</div>
</template>

<script>
import $ from "jquery";
import DataMap from "../../editor/data-map/index";
export default {
	name: "DataMap",

	mounted() {
		let self = this;

		self.dataMap = new DataMap({
			container: $(".data-map-container .data-map")
		});
	}
};
</script>

<style lang="less">
@import "../../editor/data-map/style/data-map";
</style>
