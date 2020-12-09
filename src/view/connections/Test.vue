<template>
	<el-dialog :title="$t('dataForm.test.title')" :visible.sync="dialogTestVisible" width="770px" :show-close="false">
		<el-progress
			class="test-progress"
			:text-inside="testResult"
			:stroke-width="26"
			:percentage="progress"
		></el-progress>
		<el-table :data="testLogs" style="width: 100%" class="test-block">
			<el-table-column prop="show_msg" label="检测项" width="250"> </el-table-column>
			<el-table-column prop="status" label="检测结果" width="100"> </el-table-column>
			<el-table-column prop="fail_message" label="说明"> </el-table-column>
		</el-table>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" @click="handleClose">{{ $t('dataForm.cancel') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'Test',
	props: {
		testLogs: {
			required: true,
			value: Array
		},
		dialogTestVisible: {
			required: true,
			value: Boolean
		}
	},
	data() {
		return {
			progress: 0,
			testResult: ''
		};
	},
	watch: {
		testLogs() {
			this.handleProgress();
		}
	},
	methods: {
		handleClose() {
			this.$emit('dialogTestVisible', false);
		},
		handleProgress() {
			let count = 0;
			this.testLogs.forEach(log => {
				if (log.status === 'passed') {
					count++;
				}
			});
			let len = (100 / this.testLogs.length) * count;
			this.progress = Math.round(len);
		}
	}
};
</script>

<style lang="less">
.test-progress {
	.el-progress-bar__outer {
		border-radius: 0;
	}
	.el-progress-bar__inner {
		border-radius: 0;
	}
	margin-bottom: 10px;
}
.test-block {
	border: 1px solid #dedee4;
	padding: 10px;
	th,
	tr {
		background: #f5f5f5;
	}
	td,
	th.is-leaf {
		border-bottom: 5px solid #fff;
	}
	thead {
		color: #999;
	}
}
.el-table::before {
	left: 0;
	bottom: 0;
	width: 100%;
	height: 0;
}
</style>
