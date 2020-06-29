<template>
	<div class="relatedTasks">
		<el-popover placement="top" width="400" popper-class="taskLink-popover" trigger="click">
			<div v-for="o in taskList" :key="o" class="text item">
				{{ '列表内容 ' + o }}
			</div>
			<el-button class="e-button" slot="reference">点击查看相关任务</el-button>
		</el-popover>
	</div>
</template>
<script>
export default {
	data() {
		return {
			taskList: 4
		};
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
