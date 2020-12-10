<template>
	<el-dialog :title="$t('dataForm.test.title')" :visible.sync="dialogTestVisible" width="770px" :show-close="false">
		<el-progress
			type="line"
			class="test-progress"
			:text-inside="true"
			:stroke-width="26"
			:percentage="progress"
			:status="testResult"
		></el-progress>
		<el-table :data="testLogs" style="width: 100%" class="test-block">
			<el-table-column prop="show_msg" label="检测项" width="250"> </el-table-column>
			<el-table-column prop="status" label="检测结果" width="100">
				<template slot-scope="scope">
					<span :style="`color: ${colorMap[scope.row.status]};`">{{ scope.row.status }}</span>
				</template>
			</el-table-column>
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
		},
		testResult: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			progress: 0,
			colorMap: {
				passed: '#70AD47',
				waiting: '#666',
				failed: '#f56c6c'
			}
		};
	},
	watch: {
		testLogs: {
			handler() {
				this.handleProgress();
			}
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

			switch (this.testResult) {
				case 'ready':
					return (this.testResult = 'success');
				case 'invalid':
					return (this.testResult = 'warning');
				default:
					return (this.testResult = 'exception');
			}
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
		color: #222;
	}
}
.el-table::before {
	left: 0;
	bottom: 0;
	width: 100%;
	height: 0;
}
</style>
