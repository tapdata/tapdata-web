<template>
	<el-dialog :title="$t('dataFlow.createNew')" :visible.sync="dialogVisible" width="40%" :before-close="handleClose">
		<div>
			<ul class="item">
				<li @click="db2db">
					<span class="model">{{ $t('dataFlow.guidingMode') }}</span>
					<div class="content">
						<i class="iconfont icon-qianyi1"></i>
						<span>
							<span class="tag">{{ $t('dataFlow.databseProcessingHead') }}</span>
							{{ $t('dataFlow.databseProcessing') }}</span
						>
					</div>
				</li>
				<li @click="goNew">
					<span class="model">{{ $t('dataFlow.advancedMode') }}</span>
					<div class="content">
						<i class="iconfont icon-custom"></i>
						<span>
							<span class="tag">{{ $t('dataFlow.databseFreedomHead') }}</span>
							{{ $t('dataFlow.databseFreedom') }}</span
						>
					</div>
				</li>
			</ul>
		</div>
	</el-dialog>
</template>

<script>
export default {
	name: 'newDataFlow',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		}
	},
	methods: {
		handleClose() {
			this.dialogVisible = false;
			this.$emit('dialogVisible', false);
		},
		db2db() {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { isSimple: true }
			});
			window.open(routeUrl.href, '_blank');
			this.handleClose();
		},
		goNew() {
			let routeUrl = this.$router.resolve({
				path: '/job'
			});
			window.open(routeUrl.href, '_blank');
			this.handleClose();
		}
	}
};
</script>

<style scoped lang="less">
@color: #999999;
.item {
	display: flex;
	justify-content: center;
	padding: 0 20px;
	font-size: 12px;
	li {
		width: 50%;
		margin-right: 10px;
	}
	.model {
		display: block;
		color: @color;
		margin-bottom: 10px;
		margin-left: 20px;
	}
	li {
		.content {
			display: flex;
			justify-content: space-between;
			cursor: pointer;
			padding: 20px;
			color: #999;
			line-height: 24px;
			.iconfont {
				display: inline-block;
				font-size: 36px;
				margin-right: 10px;
			}
			&:hover {
				background: rgba(250, 250, 250, 1);
				border: 1px solid rgba(222, 222, 228, 1);
				box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.21);
				border-radius: 5px;
			}
			.tag {
				display: block;
				font-size: 16px;
				color: #48b6e2;
				font-weight: 400;
				margin-bottom: 10px;
			}
		}
	}
}
</style>
