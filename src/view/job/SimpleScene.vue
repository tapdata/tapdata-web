<template>
	<div
		style="position:absolute; width:3276px; height:1688px; left:-700px; top:-200px; z-index:1999; opacity:0.8; background-color: gray;"
	>
		<div v-html="cellHtmls" style=""></div>
		<div class="exit">
			<el-button round size="mini" icon="el-icon-close" @click="toHome">{{ $t('message.cancel') }}</el-button>
			<el-button round size="mini" icon="iconfont icon-custom" @click="goFree">
				{{ $t('dataFlow.freedomMode') }}</el-button
			>
		</div>
		<div class="action-bar">
			<div class="left-bar">
				<span class="e-btn" @click="prevStep">
					{{ $t('dataFlow.previous') }}
				</span>
			</div>
			<div class="center-bar" @click="skip">
				<el-radio-group v-model="activeStep">
					<el-radio :label="1"
						>STEP1 <br />
						<span class="desc">{{ $t('dataFlow.sourceSetting') }}</span></el-radio
					>
					<span class="space-line"></span>
					<el-radio :label="2"
						>STEP2 <br />
						<span class="desc">{{ $t('dataFlow.targetSetting') }}</span></el-radio
					>
					<span class="space-line"></span>
					<el-radio :label="3"
						>STEP3 <br />
						<span class="desc">{{ $t('dataFlow.jobSetting') }}</span></el-radio
					>
				</el-radio-group>
			</div>
			<div class="left-bar">
				<span :class="activeValid ? 'e-btnv' : 'e-btn'" @click="nextStep">
					{{ $t('dataFlow.next') }}
				</span>
			</div>
		</div>
	</div>
</template>
<script>
import { db2db } from '../../editor/simpleSceneData';

export default {
	name: 'simpleScene',
	data() {
		return {
			cellHtmls: '',
			cellHtml: '',
			activeValid: false,
			activeStep: 1
		};
	},
	methods: {
		skip() {
			event.preventDefault();
		},
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
			if (this.activeStep < 3 && !this.$parent.editor.graph.graph.getElements()[this.activeStep - 1].validate())
				return;
			this.activeStep++;
			this.$parent.simpleGoNext(this.activeStep);
		},
		prevStep() {
			if (this.activeStep == 1) return;
			this.activeStep--;
			this.$parent.simpleGoNext(this.activeStep);
		},
		toHome() {
			location.replace(location.origin + '/#/dashboard');
		},
		goFree() {
			window.tpdata = db2db.data;
			this.$router.go({
				path: '/job',
				query: {}
			});
		}
	}
};
</script>
<style lang="less" scoped>
.exit {
	position: absolute;
	left: 800px;
	top: 240px;
}
.action-bar {
	position: absolute;
	top: 850px;
	left: -200px;
	display: flex;
	width: 100%;
	flex-flow: row;
	justify-content: center;
	font-size: 12px;

	& > div {
		background: #fff;
		margin-left: 30px;
		/*padding: 12px 16px;*/

		border-radius: 5px;
		box-shadow: 0 0 3px 1px rgba(220, 220, 220, 0.9);
	}
	& > div:first-child {
		margin-left: 0;
	}
	.e-btnv {
		color: green;
	}
	.e-btn {
		cursor: pointer;
		padding: 20px 16px;
		display: inline-block;
	}
	.e-btn:first-child {
		margin-left: 0;
	}

	.center-bar {
		padding: 12px;
		font-size: 12px;
		.el-radio {
			margin-right: 10px;
			margin-left: 10px;
			.desc {
				margin-left: 23px;
			}
		}
		.space-line {
			margin-bottom: 12px;
			display: inline-block;
			width: 70px;
			border: 1px solid #dddddd;
		}
	}

	.e-classification {
		padding: 6px;
	}
}
</style>
<style lang="less">
.action-bar {
	.el-radio__input .el-radio__inner {
		margin-bottom: -10px;
	}
}
</style>
