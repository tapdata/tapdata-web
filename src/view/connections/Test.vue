<template>
	<el-dialog
		class="connection-test-dialog"
		:title="$t('connection.testConnection')"
		:visible="dialogTestVisible"
		width="770px"
		:show-close="false"
		append-to-body
		:before-close="handleClose"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<div class="test-status">
			<div
				v-if="testData.testLogs && testData.testLogs.length === 0 && wsError === 'ERROR'"
				style="color: #d54e21"
			>
				{{ $t('dataForm.test.error') }}
			</div>
			<div v-else>
				<div v-if="status === 'invalid' || status === 'ready'">
					{{ $t('dataForm.test.testResult')
					}}<span :style="`color: ${colorMap[status]};`">{{ statusMap[status] }}</span>
				</div>
				<div v-else>
					{{ $t('dataForm.primaryTest') }}
					<el-image style="width: 32px; height: 15px;" src="static/editor/wating.svg"></el-image>
				</div>
			</div>
		</div>
		<el-table
			:data="testData.testLogs"
			style="width: 100%"
			class="test-block"
			:row-style="rowStyleHandler"
			v-show="testData.testLogs && testData.testLogs.length > 0"
		>
			<el-table-column prop="show_msg" :label="$t('dataForm.test.items')" width="250">
				<template slot-scope="scope">
					<span>{{ $t(`dataForm.form.response_body.${scope.row.show_msg}`) }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="status" :label="$t('dataForm.test.result')" width="100">
				<template slot-scope="scope">
					<span
						v-if="scope.row.status === 'failed' && !scope.row.required"
						:style="`color: ${colorMap['warning']};`"
						>{{ statusMap[scope.row.status] }}</span
					>
					<span v-else :style="`color: ${colorMap[scope.row.status]};`">{{
						statusMap[scope.row.status]
					}}</span>
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
			status: '',
			timer: null,
			colorMap: {
				passed: '#70AD47',
				waiting: '#aaaaaa',
				failed: '#f56c6c',
				warning: '#ffc107',
				ready: '#70AD47',
				invalid: '#f56c6c',
				testing: '#aaaaaa'
			},
			statusMap: {
				ready: this.$t('dataForm.test.success'),
				invalid: this.$t('dataForm.test.fail'),
				testing: this.$t('dataForm.test.testing'),
				passed: this.$t('dataForm.test.success'),
				waiting: this.$t('dataForm.test.testing'),
				failed: this.$t('dataForm.test.fail')
			}
		};
	},
	mounted() {
		this.handleWS();
	},
	destroyed() {
		this.clearInterval();
	},
	methods: {
		rowStyleHandler({ row }) {
			return row.status === 'waiting' ? { background: '#fff' } : '';
		},
		handleClose() {
			this.$emit('update:dialogTestVisible', false);
		},
		handleWS() {
			ws.ready(() => {
				//接收数据
				ws.on('testConnectionResult', data => {
					let result = data.result || [];
					this.wsError = data.status;
					let testData = {
						wsError: data.status
					};
					if (result.response_body) {
						let validate_details = result.response_body.validate_details || [];
						this.testData.testLogs = validate_details;
						testData['testLogs '] = validate_details;
						testData['status'] = result.status;
						this.status = result.status;
					}
					this.$emit('returnTestData', testData);
				});
				//长连接失败
				ws.on('testConnection', data => {
					this.wsError = data.status;
					let testData = {
						wsError: data.status
					};
					this.$emit('returnTestData', testData);
				});
			});
		},
		start(updateSchema, editTest) {
			let msg = {
				type: 'testConnection',
				data: this.formData
			};
			msg.data['updateSchema'] = false; //默认值
			msg.data['editTest'] = false; //默认值
			this.wsError = '';
			this.testData.testLogs = [];
			if (updateSchema) {
				msg.data['updateSchema'] = updateSchema; //是否需要更新Schema
			}
			if (editTest) {
				msg.data['editTest'] = editTest; //是否编辑测试
			}
			ws.ready(() => {
				ws.send(msg);
			});
		},
		clearInterval() {
			// 取消长连接
			ws.off('testConnection');
			this.testData.testLogs = [];
			this.status = '';
		}
	}
};
</script>
<style lang="less" scoped>
.connection-test-dialog {
	.test-status {
		margin-bottom: 10px;
	}
}
</style>

<style lang="less">
.connection-test-dialog {
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
}
</style>
