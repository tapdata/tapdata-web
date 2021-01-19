<template>
	<section class="clusterManagement-container">
		<div v-if="activeIndex === 1">
			<div class="header">
				<div class="page-header-title">
					<span class="title">{{ $t('message.serviceCluMange') }}</span>
					<div class="logBtn" @click="handleSelect">{{ $t('message.statusLog') }}</div>
				</div>
			</div>
			<div class="main">
				<ClusterManagement></ClusterManagement>
			</div>
		</div>
		<DailyRecord class="clusterManagement-wrap" v-else v-readonlybtn="'status_log'"></DailyRecord>
	</section>
</template>
<script>
import ClusterManagement from './clusterManagement';
import DailyRecord from './dailyRecord';
export default {
	components: {
		ClusterManagement,
		DailyRecord
	},
	data() {
		return {
			activeIndex: 1,
			langType: 'en'
		};
	},
	methods: {
		handleSelect(key) {
			this.activeIndex = key;
		}
	}
};
</script>
<style lang="less" scoped>
.clusterManagement-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
	.header {
		padding: 15px 10px;
		background: #ffffff;
		overflow: hidden;
		border-bottom: 1px solid #dedee4;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		.title {
			font-size: 16px;
			color: #333;
			font-weight: 600;
		}
		.logBtn {
			font-size: 14px;
			color: #48b6e2;
			cursor: pointer;
			float: right;
		}
	}
	.main {
		flex: 1;
		padding: 10px;
		display: flex;
		overflow: hidden;
	}
}
</style>
