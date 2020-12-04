<template>
	<el-dialog
		:title="$t('dataFlow.createNew')"
		:visible.sync="dialogVisible"
		width="60%"
		:before-close="handleClose"
		:close-on-click-modal="false"
		class="simple-scene"
	>
		<div>
			<ul class="item">
				<li @click="db2db">
					<span class="model">{{ $t('dataFlow.guidingMode') }}</span>
					<div class="content">
						<i class="iconfont icon-shujukuqianyi2"></i>
						<span>
							<span class="tag">{{ $t('dataFlow.databseMigrationHead') }}</span>
							{{ $t('dataFlow.databseMigration') }}</span
						>
					</div>
				</li>
				<li @click="goNew">
					<span class="model">{{ $t('dataFlow.advancedMode') }}</span>
					<div class="content">
						<i class="iconfont icon-shujukuqianyi2"></i>
						<span>
							<span class="tag">{{ $t('dataFlow.databseFreedomHead') }}</span>
							{{ $t('dataFlow.databseFreedom') }}</span
						>
					</div>
				</li>
				<li @click="goNewCust">
					<div class="content">
						<i class="iconfont icon-renwubianpai2"></i>
						<span>
							<span class="tag">{{ $t('dataFlow.dataMigrationHead') }}</span>
							{{ $t('dataFlow.dataFreedom') }}</span
						>
					</div>
				</li>
			</ul>
			<div style="clear: both"></div>
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
				query: { isSimple: true, mapping: 'cluster-clone' }
			});
			window.open(routeUrl.href, '_blank');
			this.handleClose();
		},
		goNew() {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { mapping: 'cluster-clone' }
			});
			window.open(routeUrl.href, '_blank');
			this.handleClose();
		},
		goNewCust() {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { mapping: 'custom' }
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
	font-size: 12px;
	li {
		float: left;
		width: 32%;
	}
	li:first-child {
		margin-right: 20px;
		border-right: 1px solid #dedee4;
	}
	li:last-child {
		margin-top: 25px;
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
			margin-right: 15px;
			&:hover {
				background: rgba(250, 250, 250, 1);
				border: 1px solid rgba(222, 222, 228, 1);
				box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.21);
				border-radius: 5px;
			}
			.iconfont {
				display: inline-block;
				font-size: 30px;
				margin-right: 10px;
				color: #48b6e2;
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
<style lang="less">
.simple-scene {
	.el-dialog__body {
		min-height: 240px;
		padding: 30px 90px;
	}
}
</style>
