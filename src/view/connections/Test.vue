<template>
	<el-dialog
		:title="$t('dataForm.test.title')"
		:visible.sync="dialogTestVisible"
		width="770px"
		:show-close="false"
		append-to-body
		:before-close="handleClose"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<div v-show="testData.testLogs && testData.testLogs.length === 0">
			<div v-if="wsError === 'ERROR'" style="color: #d54e21">{{ $t('dataForm.test.error') }}</div>
			<div v-else>{{ $t('dataForm.primaryTest') }}</div>
		</div>
		<el-table
			:data="testData.testLogs"
			style="width: 100%"
			class="test-block"
			v-show="testData.testLogs && testData.testLogs.length > 0"
		>
			<el-table-column prop="show_msg" :label="$t('dataForm.test.items')" width="250">
				<template slot-scope="scope">
					<span>{{ $t(`dataForm.form.response_body.${scope.row.show_msg}`) }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="status" :label="$t('dataForm.test.result')" width="100">
				<template slot-scope="scope">
					<span :style="`color: ${colorMap[scope.row.status]};`">{{ statusMap[scope.row.status] }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="fail_message" :label="$t('dataForm.test.information')" width="358">
			</el-table-column>
		</el-table>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" @click="handleClose()">{{ $t('dataForm.close') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
import ws from '../../api/ws';

export default {
	name: 'Test',
	props: {
		dialogTestVisible: {
			required: true,
			value: Boolean
		},
		formData: {
			required: true,
			value: Object
		}
	},
	data() {
		return {
			progress: 0,
			testData: {
				testLogs: [],
				testResult: '',
				progress: 0
			},
			wsError: '',
			colorMap: {
				passed: '#70AD47',
				waiting: '#666',
				failed: '#f56c6c'
			},
			statusMap: {
				passed: this.$t('dataForm.test.success'),
				waiting: this.$t('dataForm.test.testing'),
				failed: this.$t('dataForm.test.fail')
			}
		};
	},
	watch: {
		dialogTestVisible: {
			handler() {
				if (this.dialogTestVisible) {
					this.handleWS(); //开始测试建立ws
				} else {
					this.clearInterval();
					this.testData.testLogs = [];
				}
			}
		}
	},
	destroyed() {
		this.clearInterval();
	},
	methods: {
		handleClose() {
			this.$emit('dialogTestVisible', false);
		},
		//建立长连接 测试使用
		handleWS() {
			//默认检查项初始化
			this.wsError = '';
			let msg = {
				type: 'testConnection',
				data: this.formData
			};
			//接收数据
			ws.on('testConnectionResult', data => {
				let result = data.result || [];
				this.wsError = data.status;
				if (result.response_body) {
					let validate_details = result.response_body.validate_details || [];
					this.testData.testLogs = validate_details;
				}
			});
			ws.on('unknown_event_result', data => {
				this.wsError = data.status;
			});
			//建立连接
			this.timer = setInterval(() => {
				if (ws.ws.readyState == 1) {
					ws.send(msg);
					clearInterval(this.timer);
				}
			}, 2000);
		},
		clearInterval() {
			// 取消长连接
			ws.off('testConnection');
			clearInterval(this.timer);
			this.timer = null;
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
