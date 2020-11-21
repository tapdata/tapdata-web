<template>
	<el-dialog title="跳过错误设置" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
		<div class="skip-tip">{{ $t('dataFlow.skipError.tip') }}</div>
		<div class="skip-tip">{{ $t('dataFlow.skipError.attention') }}</div>
		<div class="skip-name">
			{{ `${$t('dataFlow.skipError.taskName')}:` }}
			<span style="color: #48B6E2">{{ taskName }}</span>
		</div>
		<ul class="error-list">
			<span class="check-all"
				><el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
					$t('dataFlow.selectAll')
				}}</el-checkbox></span
			>
			<el-checkbox-group v-model="checkedData" @change="handleCheckedDataChange" class="list-box">
				<li v-for="(item, index) in errorEvents" :key="item.index">
					<el-checkbox :label="index">
						<div class="error-content">
							<span class="error-msg"><span style="color: red">[ERROR]</span> {{ item.message }}</span>
						</div>
					</el-checkbox>
				</li>
			</el-checkbox-group>
		</ul>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleClose" size="mini">{{ $t('dataFlow.skipError.cancel') }}</el-button>
			<el-button type="primary" size="mini" @click="skipErrorData">{{
				$t('dataFlow.skipError.startJob')
			}}</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'SkipError',
	props: {
		errorEvents: {
			required: true,
			value: Array
		},
		dialogVisible: {
			required: true,
			value: Boolean
		},
		taskName: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			isIndeterminate: true,
			checkAll: false,
			checkedData: []
		};
	},
	methods: {
		handleCheckAllChange(val) {
			let ids = this.errorEvents.map((item, index) => {
				return index;
			});
			this.checkedData = val ? ids : [];
			this.isIndeterminate = false;
		},
		handleCheckedDataChange(value) {
			let checkedCount = value.length;
			this.checkAll = checkedCount === this.errorEvents.length;
			this.isIndeterminate = checkedCount > 0 && checkedCount < this.errorEvents.length;
			this.checkedData = value;
		},
		skipErrorData() {
			if (this.checkedData.length > 0) {
				let data = [];
				this.checkedData.forEach(item => {
					data.push(this.errorEvents[item]);
				});
				this.checkedData = data;
			} else {
				this.checkedData = [];
			}
			this.$emit('operationsSkipError', this.checkedData);
			this.handleClose('skipError');
		},
		handleClose(data) {
			if (data !== 'skipError') {
				data = 'cancelError';
			}
			this.$emit('dialogVisible', false, data);
		}
	}
};
</script>
<style lang="less">
.error-list {
	.el-checkbox__input {
		vertical-align: top;
	}
}
</style>
<style scoped lang="less">
.error-list {
	background: #fefefe;
	border: 1px solid #dedee4;
	vertical-align: bottom;
	font-size: 12px;
	max-height: 500px;
	overflow-y: auto;
	overflow-x: hidden;
	li {
		margin-top: 10px;
		margin-left: 10px;
		.error-content {
			font-size: 12px;
			background: #fff;
			border: 1px solid #dedee4;
			width: 96%;
			padding: 5px 10px;
		}
		.error-msg {
			font-size: 12px;
			display: inline-block;
			line-height: 20px;
			word-break: break-all;
			white-space: normal;
		}
	}
	li:last-child {
		margin-bottom: 10px;
	}
	.check-all {
		display: inline-block;
		margin-left: 10px;
		margin-top: 10px;
	}
}
.skip-name {
	width: 98%;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 12px;
	margin-top: 18px;
	margin-bottom: 10px;
}
.skip-tip {
	font-size: 12px;
	color: #999;
}
</style>
