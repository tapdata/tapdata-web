<template>
	<div class="editor-container"></div>
</template>

<script>
	import $ from 'jquery';
	import editor from '../../editor/index';

	export default {
		name: "index.vue",
		data() {
			return {};
		},
		mounted() {
			let container = $('.editor-container');
			editor(container);
		}
	};
</script>

<style lang="less">
	@import "../../editor/style/editor";
</style>
