<template>
	<el-transfer
		filterable
		:titles="titles"
		:filter-method="filterMethod"
		:filter-placeholder="$t('editor.cell.link.searchContent')"
		v-model="selectSourceArr"
		:data="sourceData"
		@change="handleChangeTransfer"
		@right-check-change="handleSelectTable"
	>
	</el-transfer>
</template>

<script>
let selectKeepArr = [];
export default {
	data() {
		return {
			transferLoading: false,
			sourceData: [],
			titles: 'kkk'
		};
	},
	methods: {
		getTable(id) {
			this.transferLoading = true;
			this.$api('connections')
				.customQuery([id])
				.then(result => {
					if (result.data) {
						self.databaseInfo = result.data;
						let tables = (result.data.schema && result.data.schema.tables) || [];
						tables = tables.sort((t1, t2) =>
							t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
						);
						if (tables && tables.length) {
							this.sourceData = tables.map(table => ({
								label: table.table_name,
								key: table.table_name,
								disabled: this.disabled
							}));
						}
						this.$forceUpdate();
					}
				})
				.finally(() => {
					this.transferLoading = false;
				});
		},
		// 穿梭框值改变的时候
		handleChangeTransfer() {
			this.sourceData.forEach(el => {
				if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
					el.label = el.key;
				}
			});
			//this.preFixSuffixData();
		},

		// 穿梭框搜索
		filterMethod(query, item) {
			return item.label.indexOf(query) > -1;
		},

		// 已选择的表
		handleSelectTable(data) {
			selectKeepArr = data;
		}
	}
};
</script>
