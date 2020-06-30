<template>
	<div class="relatedTasks">
		<el-popover placement="top" width="400" popper-class="taskLink-popover" trigger="click">
			<div v-for="item in taskList" :key="item.id" class="text item" @click="handleTask(item)">
				{{ item.name }}
			</div>

			<el-button class="e-button" slot="reference">{{ $t('message.clickRelatedTasks') }}</el-button>
		</el-popover>
	</div>
</template>
<script>
import factory from '../api/factory';

const dataFlowApi = factory('DataFlows');
export default {
	props: {
		taskData: Object
	},
	data() {
		return {
			taskList: []
		};
	},

	mounted() {
		this.$nextTick(() => {
			this.getTaskData();
		});
	},

	methods: {
		getTaskData() {
			let params = {
				connectionID: this.taskData.id,
				tableName: this.taskData.tableName
			};
			dataFlowApi.relatedDataFlows(params).then(res => {
				if (res.data && res.data.length > 0) {
					this.taskList = res.data;
				}
			});
		},
		/***
		 * 选择任务
		 */
		handleTask(data) {
			// let routeUrl = this.$router.resolve({
			// 	path: '/job',
			// 	query: { id: data.id }
			// });
			let routeUrl =
				window.location.protocol +
				'//' +
				window.location.hostname +
				':' +
				window.location.port +
				'/job?id=' +
				data.id;
			setTimeout(() => {
				window.open(routeUrl, '_blank');
			}, 200);
		}

		// getTempKeys() {
		// 	let tk = [];
		// 	window.windows.forEach(it => {
		// 		if (it.parent != null && it.tempKey) tk.push(it.tempKey);
		// 	});
		// 	return tk;
		// }
	}
};
</script>
<style scoped lang="less">
.relatedTasks {
	position: absolute;
	bottom: 0;
	width: 100%;
	.e-button {
		width: 100%;
	}
}
</style>
<style lang="less">
.taskLink-popover {
	min-width: 500px !important;
	max-height: 300px;
	overflow: auto;
	.item {
		padding: 0 0 10px 20px;
		cursor: pointer;
	}
	.item:hover {
		color: #48b6e2;
	}
}
</style>
