<template>
	<div class="relatedTasks">
		<el-popover placement="top" width="400" popper-class="taskLink-popover" trigger="click">
			<div v-for="item in taskList" :key="item.id" class="text item" @click="handleTask(item)">
				{{ item.name }}
				<!-- <router-link tag="a" target="_blank" :to="{ name: 'job', query: { id: item.id } }"></router-link> -->
			</div>

			<el-button class="e-button" slot="reference">点击查看相关任务</el-button>
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
			debugger;
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { id: data.id }
			});

			setTimeout(() => {
				window.windows.push(window.open(routeUrl.href, '_blank'));
				window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
			}, 200);
		},

		getTempKeys() {
			let tk = [];
			window.windows.forEach(it => {
				if (it.parent != null && it.tempKey) tk.push(it.tempKey);
			});
			return tk;
		}
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
