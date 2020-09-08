<template>
	<div class="verify-setting">
		<div class="head-text">
			<h2>{{ $t('dataVerify.setting.title') }}</h2>
			<p>{{ $t('dataVerify.setting.text') }}</p>
		</div>

		<el-form class="e-form" label-position="top" :data="formData">
			<el-form-item :label="$t('dataVerify.setting.keepTimeLabel')">
				<el-select v-model="formData.distinctWriteType" size="mini" class="dataWrite-list">
					<el-option v-for="item in dataWriteList" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.errorSaveSumLable')">
				<el-select v-model="formData.distinctWriteType" size="mini" class="dataWrite-list">
					<el-option v-for="item in dataWriteList" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.errorDifferenceResult')">
				<el-select v-model="formData.distinctWriteType" size="mini" class="dataWrite-list">
					<el-option v-for="item in dataWriteList" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.lineNumberFrequency')">
				<el-input
					placeholder="请输入内容"
					v-model="formData.distinctWriteType"
					class="input-with-select"
					size="mini"
				>
					<el-select v-model="formData.distinctWriteType" slot="append" placeholder="请选择">
						<el-option label="餐厅名" value="1"></el-option>
						<el-option label="订单号" value="2"></el-option>
						<el-option label="用户电话" value="3"></el-option>
					</el-select>
				</el-input>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.lineNumVerfyDuration')">
				<el-input
					placeholder="请输入内容"
					v-model="formData.distinctWriteType"
					class="input-with-select"
					size="mini"
				>
					<el-select v-model="formData.distinctWriteType" slot="append" placeholder="请选择">
						<el-option label="餐厅名" value="1"></el-option>
						<el-option label="订单号" value="2"></el-option>
						<el-option label="用户电话" value="3"></el-option>
					</el-select>
				</el-input>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.intervalFrequency')">
				<el-input
					placeholder="请输入内容"
					v-model="formData.distinctWriteType"
					class="input-with-select"
					size="mini"
				>
					<el-select v-model="formData.distinctWriteType" slot="append" placeholder="请选择">
						<el-option label="餐厅名" value="1"></el-option>
						<el-option label="订单号" value="2"></el-option>
						<el-option label="用户电话" value="3"></el-option>
					</el-select>
				</el-input>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.verifyDuration')">
				<el-input
					placeholder="请输入内容"
					v-model="formData.distinctWriteType"
					class="input-with-select"
					size="mini"
				>
					<el-select v-model="formData.distinctWriteType" slot="append" placeholder="请选择">
						<el-option label="餐厅名" value="1"></el-option>
						<el-option label="订单号" value="2"></el-option>
						<el-option label="用户电话" value="3"></el-option>
					</el-select>
				</el-input>
			</el-form-item>
			<el-form-item :label="$t('dataVerify.setting.verifyStartTime')">
				<el-select v-model="formData.distinctWriteType" size="mini" class="dataWrite-list">
					<el-option v-for="item in dataWriteList" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>
<script>
export default {
	name: 'verifySetting',

	data() {
		return {
			formData: {}
		};
	}
};
</script>
<style scoped lang="less">
.verify-setting {
	height: 100%;
	padding: 50px;
	.head-text {
		padding-bottom: 50px;
		h2 {
			padding-bottom: 10px;
			color: #333;
			font-size: 18px;
			font-weight: bold;
		}
		p {
			color: #666;
			font-size: 12px;
		}
	}
}
</style>
<style lang="less">
.verify-setting {
	height: 100%;
	overflow-y: auto;
	box-sizing: border-box;
	.el-form-item__label {
		padding-bottom: 0 !important;
		line-height: 28px;
	}
	.el-form-item__content {
		width: 400px;
		padding-top: 6px;
		line-height: 28px;
		.el-input {
			width: 400px;
		}
		.el-select > .el-input {
			width: 400px;
		}
		.el-input-group__append {
			.el-select > .el-input {
				width: 80px;
			}
		}
	}
}
</style>
