<template>
	<div style="position:absolute; width:3276px; height:1688px; z-index:1999; opacity:0.5; background-color: gray;">
		<div v-html="cellHtmls" style=""></div>
		<div class="steps">
			<el-button size="mini" @click="prevStep">上一步</el-button>
			<el-steps :active="activeStep" finish-status="success" simple class="el-step">
				<el-step title="步骤 1">1</el-step>
				<el-step title="步骤 2">2</el-step>
				<el-step title="步骤 3">3</el-step>
			</el-steps>
			<el-button size="mini" @click="nextStep">下一步</el-button>
		</div>
	</div>
</template>
<script>
export default {
	name: 'simpleScene',
	data() {
		return {
			cellHtmls: '',
			cellHtml: '',
			activeStep: 1
		};
	},
	methods: {
		renderCell() {
			this.cellHtmls =
				`<div style="width: 3276px; height: 1688px;">
				<svg width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" joint-selector="svg" id="v-50">
				<g joint-selector="layers" class="joint-layers" transform="matrix(1,0,0,1,1638,444)">
				<g joint-selector="cells" class="joint-cells-layer joint-viewport">` +
				this.cellHtml +
				`<!--z-index:3--><!--z-index:4--></g><g joint-selector="tools" class="joint-tools-layer"></g></g></svg></div>`;
		},
		nextStep() {
			if (this.activeStep == 3) return;
			this.activeStep++;
			this.$parent.simpleGoNext(this.activeStep);
		},
		prevStep() {
			if (this.activeStep == 1) return;
			this.activeStep--;
			this.$parent.simpleGoNext(this.activeStep);
		}
	}
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
