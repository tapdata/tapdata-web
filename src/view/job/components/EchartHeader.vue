<template>
	<div class="echart-head">
		<h2>{{ data.title }}</h2>
		<ElTooltip v-if="data.isIput" class="ml-10" placement="top-start" :content="data.tip">
			<i class="echart-head-tooltip__icon el-icon-warning-outline"></i>
		</ElTooltip>
		<span style="flex: 1;">
			<i class="el-icon-loading" v-if="data && data.loading"></i>
		</span>
		<div class="unit" v-if="data.isIput && !data.isSpeed">
			<span v-if="data.type !== 'replicate'">{{ $t('dataFlow.unit') }} : ms / {{ $t('dataFlow.article') }}</span>
			<span v-else>{{ $t('dataFlow.unit') }} : {{ $t('dataFlow.secondUnit') }}</span>
		</div>
		<el-radio-group
			v-if="data.isScreeing"
			v-model="num"
			class="ml-10"
			size="mini"
			:class="selectColor"
			@change="changeRadio"
		>
			<el-radio-button label="flow">{{ $t('dataFlow.rowCount') }}</el-radio-button>
			<el-radio-button label="stage">KB</el-radio-button>
		</el-radio-group>
		<el-radio-group
			v-if="data.isSpeed"
			v-model="speed"
			class="ml-10"
			size="mini"
			:class="selectColor"
			@change="changeSpeed"
		>
			<el-radio-button label="qps">QPS</el-radio-button>
			<el-radio-button label="kbs">KB/S</el-radio-button>
		</el-radio-group>
		<el-radio-group
			v-if="data.isIput"
			v-model="time"
			class="ml-10"
			size="mini"
			:class="selectColor"
			@change="changeTime"
		>
			<el-radio-button v-if="this.data.type !== 'replicate'" label="second">{{
				$t('dataFlow.second')
			}}</el-radio-button>
			<el-radio-button label="minute">{{ $t('dataFlow.min') }}</el-radio-button>
			<el-radio-button label="hour">{{ $t('dataFlow.hour') }}</el-radio-button>
			<el-radio-button label="day">{{ $t('dataFlow.day') }}</el-radio-button>
		</el-radio-group>
	</div>
</template>
<script>
export default {
	name: 'EchartHeader',
	props: {
		data: {
			type: Object,
			default: () => {
				return {
					title: '',
					tip: '',
					isScreeing: false,
					isIput: false,
					isSpeed: false
				};
			}
		}
	},
	data() {
		return {
			num: 'flow',
			speed: 'qps',
			time: 'minute',
			rowCount: null,
			kbs: null,
			selectColor: ''
		};
	},
	mounted() {
		this.$nextTick(() => {
			if (this.data) {
				if (this.data.type === 'replicate') {
					this.time = 'minute';
				}

				this.$emit('twoRadio', this.num, this.data.type);
				this.$emit('getSpeed', this.speed, this.time);
				this.$emit('getTime', this.time, this.data.type);
				if (this.data.type === 'screening') {
					this.selectColor = 'screeningColor';
				} else if (this.data.type === 'throughput') {
					this.selectColor = 'putColor';
				} else if (this.data.type === 'transf') {
					this.selectColor = 'transfColor';
				} else if (this.data.type === 'replicate') {
					this.selectColor = 'replicateColor';
				}
			}
		});
	},
	methods: {
		changeRadio(val) {
			this.$emit('twoRadio', val, this.data.type);
		},
		changeSpeed(val) {
			this.$emit('getSpeed', val, this.time);
		},
		changeTime(val) {
			this.$emit('getTime', val, this.data.type);
			this.$emit('getSpeed', this.speed, val);
		}
	}
};
</script>
<style lang="less" scoped>
.echart-head {
	display: flex;
	align-items: center;
	height: 38px;
	padding: 0 10px;
	border-bottom: 1px solid #dcdfe6;
	background-color: #fafafa;
	h2 {
		display: inline-block;
		font-size: 14px;
		color: #333;
		vertical-align: bottom;
	}
	.arrow {
		display: inline-block;
		position: relative;
		width: 20px;
		height: 38px;
		overflow: hidden;

		.el-icon-caret-top {
			position: absolute;
			top: 8px;
		}

		.el-icon-caret-bottom {
			position: absolute;
			top: 16px;
		}
	}
	.unit {
		display: inline-block;
		font-size: 12px;
		span {
			padding: 3px 6px;
			border: 1px solid #ccc;
			border-radius: 3px;
		}
	}
	.echart-head-tooltip__icon {
		color: #999;
	}
}
</style>
<style lang="less">
.echart-head {
	.el-radio-button--mini .el-radio-button__inner {
		padding: 4px 6px;
	}
	.el-radio-button__orig-radio:checked + .el-radio-button__inner {
		color: #fff;
	}
	.screeningColor,
	.putColor {
		.el-radio-button__orig-radio:checked + .el-radio-button__inner {
			background-color: #48b6e2;
			border-color: #48b6e2;
			box-shadow: -1px 0 0 0 #48b6e2;
		}
	}

	.transfColor {
		.el-radio-button__orig-radio:checked + .el-radio-button__inner {
			background-color: #fb8e00;
			border-color: #fb8e00;
			box-shadow: -1px 0 0 0 #fb8e00;
		}
	}

	.replicateColor {
		.el-radio-button__orig-radio:checked + .el-radio-button__inner {
			background-color: #f56c6c;
			border-color: #f56c6c;
			box-shadow: -1px 0 0 0 #f56c6c;
		}
	}
}
</style>
