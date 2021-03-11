<template>
	<div class="table-page-container">
		<div class="table-page-header" v-if="!$window.getSettingByKey('HIDE_TABLE_TITLE')">
			<slot name="header">
				<div class="page-header-title">{{ title }}</div>
				<div v-if="desc" class="page-header-desc" v-html="desc"></div>
			</slot>
		</div>

		<div class="table-page-main">
			<div class="table-page-left" v-if="classify && $window.getSettingByKey('SHOW_CLASSIFY')">
				<Classification
					:authority="classify.authority"
					:types="classify.types"
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
					v-loading="loading"
					class="table-page-table border"
					height="100%"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:row-key="rowKey"
					:data="list"
					@selection-change="handleSelectionChange"
					@sort-change="$emit('sort-change', $event)"
				>
					<slot></slot>
				</el-table>
				<el-pagination
					background
					class="table-page-pagination"
					layout="total, sizes, ->, prev, pager, next, jumper"
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
		<SelectClassify
			v-if="classify"
			ref="classify"
			:types="classify.types"
			@operationsClassify="$emit('classify-submit', $event)"
		></SelectClassify>
	</div>
</template>

<script>
import Classification from '@/components/Classification';
import SelectClassify from '@/components/SelectClassify';
import { delayTrigger } from '../util/util';

export default {
	components: {
		Classification,
		SelectClassify
	},
	props: {
		title: String,
		desc: String,
		defaultPageSize: {
			type: Number,
			default: 20
		},
		classify: {
			type: Object
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
			tags: [],
			classifyDialogVisible: false
		};
	},
	created() {
		this.fetch(1);
	},
	watch: {
		classify: function(_new, _old) {
			if (_new.toString() !== _old.toString()) {
				this.tags = [];
			}
		}
	},
	methods: {
		getCache() {
			let params = this.$cache.get('TABLE_PAGE_PARAMS') || {};
			return params[this.$route.name] || {};
		},
		setCache(cache) {
			let params = this.$cache.get('TABLE_PAGE_PARAMS') || {};
			let pageParams = params[this.$route.name] || {};
			pageParams = Object.assign({}, pageParams, cache);
			params[this.$route.name] = pageParams;
			this.$cache.set('TABLE_PAGE_PARAMS', params);
		},
		fetch(pageNum, debounce = 0, hideLoading) {
			this.page.current = pageNum || this.page.current;
			this.$nextTick(() => {
				delayTrigger(() => {
					if (!hideLoading) {
						this.loading = true;
					}
					this.remoteMethod &&
						this.remoteMethod({
							page: this.page,
							tags: this.tags,
							data: this.list,
							cache: this.cache
						})
							.then(({ data, total }) => {
								this.cache = null;
								this.page.total = total;
								this.list = data || [];
								if (total > 0 && (!data || !data.length)) {
									setTimeout(() => {
										this.fetch(this.page.current - 1);
									}, 0);
								}
							})
							.finally(() => {
								this.loading = false;
							});
				}, debounce);
			});
		},
		nodeChecked(tags) {
			this.tags = tags;
			this.fetch(1);
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
			this.$emit('selection-change', val);
		},
		showClassify(tagList) {
			this.$refs.classify.show(tagList);
		}
	}
};
</script>

<style lang="less">
.table-page-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
	min-width: 720px;
	flex: 1;
	width: 100%;
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
			font-weight: 600;
		}
		.page-header-desc {
			margin-top: 10px;
			font-size: 12px;
			color: #999;
		}
	}
	.table-page-main {
		flex: 1;
		padding: 20px;
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
			flex-wrap: wrap-reverse;
			.table-page-search-bar {
				margin-right: 5px;
				margin-bottom: 20px;
			}
			.table-page-operation-bar {
				margin-bottom: 20px;
				text-align: right;
			}
		}
		.table-page-table {
			flex: 1;
			overflow: auto;
			border-bottom: none;
			background: #fff;
		}
		.table-page-pagination {
			margin-top: 5px;
		}
	}
}
</style>
