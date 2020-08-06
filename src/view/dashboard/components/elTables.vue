<template>
	<div class="tap-table">
		<el-table
			:data="tableObj.tableData"
			:height="tableObj.height"
			border
			:show-header="tableObj.isHeader"
			style="width: 100%"
		>
			<!-- <template v-if="tableObj.isHeader"> -->
			<el-table-column v-for="(ele, index) in header" :key="index" :prop="ele.prop" :label="ele.label">
			</el-table-column>
			<!-- </template> -->
		</el-table>
	</div>
</template>
<script>
export default {
	name: 'TapTable',
	props: ['tableObj'],
	data() {
		return {
			header: []
		};
	},
	created() {
		// 表格表头数据处理
		// this.$nextTick(() => {
		if (this.tableObj.tableData.length) {
			this.tableObj.tableData.forEach(item => {
				let tableArr = [];
				for (let itemObj in item) {
					var obj = {
						label: item[itemObj],
						prop: itemObj
					};
					tableArr.push(obj);
				}
				this.header = tableArr;
			});
		}
		// });
	}
};
</script>
