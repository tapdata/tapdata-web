<template>
	<div>
		<div
			style="position:absolute; width:3276px; height:1688px; left:-700px; top:-200px; z-index:1999; opacity:0.7; background-color: black;"
		>
			<div v-html="cellHtmls" style=""></div>
			<div class="exit">
				<el-button round size="mini" icon="el-icon-close" @click="toHome">{{ $t('message.cancel') }}</el-button>
				<el-button round size="mini" @click="goFree"> {{ $t('dataFlow.freedomMode') }}</el-button>
			</div>
		</div>
		<div class="action-bar">
			<div class="left-bar">
				<el-button :class="activeStep > 1 ? 'e-btnv' : 'e-btn'" @click="prevStep">
					{{ $t('dataFlow.previous') }}
				</el-button>
			</div>
			<div class="center-bar" @click="skip">
				<el-checkbox-group v-model="vsteps">
					<el-checkbox label="1"
						>STEP1 <br />
						<span class="desc">{{ $t('dataFlow.sourceSetting') }}</span></el-checkbox
					>
					<span class="space-line"></span>
					<el-checkbox label="2"
						>STEP2 <br />
						<span class="desc">{{ $t('dataFlow.targetSetting') }}</span></el-checkbox
					>
					<span class="space-line"></span>
					<el-checkbox label="3"
						>STEP3 <br />
						<span class="desc">{{ $t('dataFlow.jobSetting') }}</span></el-checkbox
					>
				</el-checkbox-group>
			</div>
			<div class="left-bar">
				<el-button :class="activeValid ? 'e-btnv' : 'e-btn'" @click="nextStep">
					{{ $t('dataFlow.next') }}
				</el-button>
			</div>
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
			activeValid: false,
			activeStep: 1,
			isSetting: false,
			vsteps: ['1']
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
			if (this.isSetting) {
				this.$parent.editor.showSetting(false);
				this.$parent.simpleGoNext(this.activeStep);
			}
			if (this.activeStep == 3) return;
			try {
				if (this.activeStep) this.$parent.editor.graph.graph.getElements()[this.activeStep - 1].validate();
			} catch (e) {
				this.$message.error(e.message);
				return;
			}
			try {
				if (this.activeStep < 2 && !this.$parent.editor.graph.graph.getElements()[this.activeStep].validate())
					this.activeValid = true;
			} catch (e) {
				this.activeValid = false;
			}
			this.activeStep++;
			if (!this.vsteps.includes(this.activeStep + '')) this.vsteps.push(this.activeStep + '');
			this.$parent.simpleGoNext(this.activeStep);
		},
		prevStep() {
			if (this.isSetting) {
				this.$parent.editor.showSetting(false);
			}
			if (this.activeStep == 1) return;
			this.activeStep--;
			if (this.activeStep == 2) this.$parent.simpleGoNext(1); //激活selection change事件
			this.$parent.simpleGoNext(this.activeStep);
		},
		stepValid() {
			this.activeValid = true;
		},
		toHome() {
			location.replace(location.origin + '/#/dashboard');
		},
		goFree() {
			window.name = JSON.stringify(this.$parent.getDataFlowData(true));
			this.$router.push({
				path: '/job',
				query: { isSimple: false }
			});
			location.reload();
		},
		setSetting() {
			this.isSetting = true;
		}
	}
};
</script>
<style lang="less" scoped>
.exit {
	position: absolute;
	left: 800px;
	top: 240px;
	color: #666;
}
.action-bar {
	position: absolute;
	bottom: 80px;
	left: -200px;
	z-index: 2002;
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
	}
	& > div:first-child {
		margin-left: 0;
	}
	.e-btnv {
		background: #48b6e2;
		color: #fff;
		border-radius: 5px;
		cursor: pointer;
		padding: 20px 16px;
		display: inline-block;
	}
	.e-btn {
		cursor: pointer;
		color: #aaa;
		padding: 20px 16px;
		display: inline-block;
	}
	.e-btn:first-child {
		margin-left: 0;
	}

	.center-bar {
		padding: 12px;
		font-size: 12px;
		.el-checkbox {
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
	.el-checkbox__input .el-checkbox__inner {
		margin-bottom: -10px;
	}
	.el-button:focus,
	.el-button:hover {
		color: #666 !important;
	}
}
</style>
