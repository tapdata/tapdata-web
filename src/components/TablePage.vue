<template>
	<div class="table-page-container">
		<div class="table-page-header">
			<slot name="header">
				<div class="page-header-title">{{ title }}</div>
				<div v-if="desc" class="page-header-desc" v-html="desc"></div>
			</slot>
		</div>

		<div class="table-page-main">
			<div class="table-page-left" v-if="classify && $window.getSettingByKey('SHOW_CLASSIFY')">
				<Classification
					:authority="classify.authority"
					:type="classify.type"
					@nodeChecked="nodeChecked"
				></Classification>
			</div>
			<div class="table-page-body">
				<div class="table-page-topbar">
					<div class="table-page-search-bar">
						<slot name="search"></slot>
					</div>
					<div class="table-page-operation-bar">
						<slot name="operation"></slot>
					</div>
				</div>
				<el-table
					class="table"
					height="100%"
					v-loading="loading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:row-key="rowKey"
					:data="list"
					@selection-change="$emit('selection-change', $event)"
				>
					<slot></slot>
				</el-table>
				<el-pagination
					background
					class="pagination"
					layout="total, ->, sizes, prev, pager, next, jumper"
					:current-page.sync="page.current"
					:page-sizes="[10, 20, 50, 100]"
					:page-size.sync="page.size"
					:total="page.total"
					@size-change="fetch(1)"
					@current-change="fetch"
				>
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
import Classification from '@/components/Classification';
import { delayTrigger } from '../util/util';

export default {
	components: {
		Classification
	},
	props: {
		title: String,
		desc: String,
		defaultPageSize: {
			type: Number,
			default: 20
		},
		classify: {
			type: Object,
			default: () => {
				return null;
			}
		},
		remoteMethod: Function,
		rowKey: [String, Function]
	},
	data() {
		return {
			loading: false,
			page: {
				current: 1,
				size: this.defaultPageSize,
				total: 0
			},
			list: [],
			multipleSelection: [],
			tags: []
		};
	},
	created() {
		this.fetch(1);
	},
	methods: {
		fetch(pageNum, debounce = 0, hideLoading) {
			this.page.current = pageNum || this.page.current;
			delayTrigger(() => {
				if (!hideLoading) {
					this.loading = true;
				}
				this.remoteMethod &&
					this.remoteMethod({
						page: this.page,
						tags: this.tags,
						data: this.list
					})
						.then(({ data, total }) => {
							this.page.total = total;
							this.list = data || [];
						})
						.finally(() => {
							this.loading = false;
						});
			}, debounce);
		},
		nodeChecked(tags) {
			this.tags = tags;
			this.fetch(1);
		},

		handleSelectionChange(val) {
			this.multipleSelection = val;
		}
	}
};
</script>

<style lang="less" scoped>
.table-page-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
	.table-page-header {
		padding: 15px 10px;
		background: #ffffff;
		overflow: hidden;
		border-bottom: 1px solid #dedee4;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		.page-header-title {
			font-size: 16px;
			color: #333;
		}
		.page-header-desc {
			margin-top: 10px;
			font-size: 12px;
			color: #999;
		}
	}
	.table-page-main {
		flex: 1;
		padding: 10px;
		display: flex;
		overflow: hidden;
	}
	.table-page-left {
		margin-right: 10px;
	}
	.table-page-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		.table-page-topbar {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			margin-bottom: 10px;
			.table-page-search-bar {
				flex: 2;
			}
			.table-page-operation-bar {
				flex: 1;
				text-align: right;
			}
		}
		.table {
			flex: 1;
			overflow: auto;
			border: 1px solid #eee;
			border-bottom: none;
			background: #fff;
			table thead tr th {
				padding: 2px 0;
				background: #fafafa;
				color: #999;
			}
		}
		.pagination {
			margin-top: 5px;
		}
	}
}
</style>
