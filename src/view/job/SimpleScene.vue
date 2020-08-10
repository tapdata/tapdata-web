<template>
	<div style="position:absolute; width:2400px; height:1200px; z-index:19999; opacity:0.5; background-color: gray;">
		<div v-html="cellHtmls" style=""></div>
		<div class="steps">
			<el-button size="mini">上一步</el-button>
			<el-steps :active="1" finish-status="success" simple class="el-step">
				<el-step title="步骤 1"></el-step>
				<el-step title="步骤 2"></el-step>
				<el-step title="步骤 3"></el-step>
			</el-steps>
			<el-button size="mini">下一步</el-button>
		</div>
	</div>
</template>
<script>
export default {
	name: 'simpleScene',
	data() {
		return {
			cellHtmls: `<div style="width: 3276px; height: 1688px;">
			<svg width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" joint-selector="svg" id="v-50">
			<g joint-selector="layers" class="joint-layers" transform="matrix(1,0,0,1,1638,444)">
			<g joint-selector="cells" class="joint-cells-layer joint-viewport">
			<g model-id="49f87756-4be6-45fc-ac81-81da37743f42" data-type="app.Collection" id="j_17" class="joint-cell joint-type-app joint-type-app-collection
			joint-element joint-theme-default" transform="translate(-310,120)"><rect joint-selector="body" id="v-118" fill="#fafafa" stroke="#2196F3"
			stroke-width="1" rx="20" ry="20" width="160" height="36"></rect><image joint-selector="image" id="v-116" xlink:href="static/editor/o-collection.svg"
			x="10" y="10" preserveAspectRatio="xMidYMin" width="30.4" height="29.52" transform="matrix(1,0,0,1,-6.4,-6.8)"></image><text joint-selector="label"
			 id="v-117" font-size="11" xml:space="preserve" text-anchor="left" fill="#333333" x="0" y="0" transform="matrix(1,0,0,1,36,18)">
			 <tspan dy="0.3em" class="v-line">CUSTOMER</tspan></text><path id="v-128" d="M 0 17 v 2 a 17 17 0 0 0 17 17 h 126 a 17 17 0 0 0 17 -17 v -2 a 17 17 0 0 0
			 -17 -17 h -126 a 17 17 0 0 0 -17 17 Z" pointer-events="none" vector-effect="non-scaling-stroke" fill="none" stroke-width="2" stroke="#00bcd4"
			 class="joint-highlight-stroke joint-theme-default" transform="matrix(1 0 0 1 0 0)"></path></g><!--z-index:2--><g model-id="9e2887ec-2369-4d3a-b0fb-ec0a1ac944aa"
			 data-type="app.Table" id="j_18" class="joint-cell joint-type-app joint-type-app-table joint-element joint-theme-default" transform="translate(22,120)">
			 <rect joint-selector="body" id="v-121" fill="#fafafa" stroke="#2196F3" stroke-width="1" rx="20" ry="20" width="160" height="36"></rect><image joint-selector="image"
			 id="v-119" xlink:href="static/editor/o-table.svg" x="10" y="10" preserveAspectRatio="xMidYMin" width="30.4" height="29.52" transform="matrix(1,0,0,1,-6.4,-6.8)">
			 </image><text joint-selector="label" id="v-120" font-size="11" xml:space="preserve" text-anchor="left" fill="#333333" x="0" y="0" transform="matrix(1,0,0,1,36,18)">
			 <tspan dy="0.3em" class="v-line">C9</tspan></text></g><!--z-index:3--><!--z-index:4--></g><g joint-selector="tools" class="joint-tools-layer"></g></g></svg></div>`
		};
	},
	mounted() {
		//let self = this;
		setTimeout(() => {
			//self.cellHtmls = document.getElementById('j_17').outerHTML;
			//console.log(document.getElementById('j_17').outerHTML)
		}, 4000);
		//document.body.getElementsByClassName('e-sidebar-right')[0].style.zIndex = 20009
	},
	methods: {}
};
</script>
<style lang="less">
.steps {
	position: absolute;
	background-color: gray;
	top: 800px;
	left: 300px;
	display: flex;
	justify-content: space-between;
	.el-step {
		width: 500px;
		margin-left: 10px;
	}
	.el-button {
		margin-left: 10px;
	}
}
</style>
