<template>
	<el-dialog
		:title="$t('dataForm.test.title')"
		:visible.sync="testData.dialogTestVisible"
		width="770px"
		:show-close="false"
		append-to-body
		:before-close="handleClose"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<el-progress
			type="line"
			class="test-progress"
			:text-inside="true"
			:stroke-width="26"
			:percentage="testData.progress"
			:status="testData.testResult"
		></el-progress>
		<div v-if="testData.testLogs && testData.testLogs.length === 0">{{ $t('dataForm.primaryTest') }}</div>
		<el-table :data="testData.testLogs" style="width: 100%" class="test-block" v-else>
			<el-table-column prop="show_msg" :label="$t('dataForm.test.items')" width="250"> </el-table-column>
			<el-table-column prop="status" :label="$t('dataForm.test.result')" width="100">
				<template slot-scope="scope">
					<span :style="`color: ${colorMap[scope.row.status]};`">{{ scope.row.status }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="fail_message" :label="$t('dataForm.test.information')" width="358">
			</el-table-column>
		</el-table>
		<span slot="footer" class="dialog-footer">
			<el-button v-if="testData.testResult === 'warning'" type="primary" size="mini" @click="handleClose()">{{
				$t('dataForm.backDetection')
			}}</el-button>
			<el-button v-else size="mini" type="primary" @click="handleClose()">{{ $t('dataForm.close') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'Test',
	props: {
		testData: {
			required: true,
			value: Object
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
	methods: {
		handleClose() {
			this.$emit('dialogTestVisible', false);
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
		.cell {
			white-space: normal !important;
		}
	}
	td,
	th.is-leaf {
		border-bottom: 5px solid #fff;
	}
	thead {
		color: #222;
	}
	.information {
		width: 358px;
		white-space: normal;
	}
}
.el-table::before {
	left: 0;
	bottom: 0;
	width: 100%;
	height: 0;
}
</style>
