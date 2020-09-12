<template>
	<section class="data-verify-wrap">
		<div class="panel-main">
			<div class="topbar">
				<ul class="search-bar">
					<li class="search-item">
						<el-button
							class="btn-class-collapse"
							size="mini"
							:class="{ 'is-open': isClassShow }"
							@click="isClassShow = !isClassShow"
						>
							<i class="iconfont icon-xiangshangzhanhang"></i>
							<span>{{ isClassShow ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel') }}</span>
						</el-button>
					</li>
					<li class="search-item">
						<el-input
							v-model="searchParams.keyword"
							size="mini"
							clearable
							prefix-icon="el-icon-search"
							placeholder="任务名称/节点名"
							@input="keyup()"
						></el-input>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.compareMethod"
							size="mini"
							placeholder="校验类型"
							@input="search(1)"
						>
							<el-option label="行数校验" value="row_count"></el-option>
							<el-option label="内容校验" value="field"></el-option>
						</el-select>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.mode"
							size="mini"
							placeholder="单词/重复校验"
							@input="search(1)"
						>
							<el-option label="单词校验" value="manual"></el-option>
							<el-option label="重复校验" value="cron"></el-option>
						</el-select>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.active"
							size="mini"
							placeholder="校验激活状态"
							@input="search(1)"
						>
							<el-option label="已启用" value="1"></el-option>
							<el-option label="已禁用" value="2"></el-option>
						</el-select>
					</li>
					<li class="search-item">
						<el-button size="mini" @click="reset">
							<i class="iconfont icon-shuaxin1"></i>
						</el-button>
					</li>
				</ul>
				<div class="topbar-buttons">
					<el-button size="mini" v-show="selections.length">
						<i class="iconfont icon-piliang"></i>
						<span>批量校验</span>
					</el-button>
					<el-button size="mini">
						<i class="iconfont icon-shezhi1"></i>
						<span>校验设置</span>
					</el-button>
					<el-button type="primary" size="mini" @click="create">
						<i class="iconfont icon-jia add-btn-icon"></i>
					</el-button>
				</div>
			</div>
			<div class="table-wrap">
				<el-table
					style="border: 1px solid #dedee4;"
					v-loading="loading"
					:data="page.data"
					@sort-change="sortHandler"
					@selection-change="selectHandler"
				>
					<el-table-column type="selection" width="44" align="center"></el-table-column>
					<el-table-column label="任务名称">
						<template slot-scope="scope">
							{{ scope.row.name }}
						</template>
					</el-table-column>
					<el-table-column label="源/目标行数">
						<template slot-scope="scope">
							<div>源表: {{ scope.row.name }}</div>
							<div>目标: {{ scope.row.name }}</div>
						</template>
					</el-table-column>
					<el-table-column label="校验结果">
						<template slot-scope="scope">
							<span> 行数差异 {{ scope.row.name }} </span>
						</template>
					</el-table-column>
					<el-table-column label="执行状态">
						<template slot-scope="scope">
							<span> {{ scope.row.name }} </span>
						</template>
					</el-table-column>
					<el-table-column label="校验时间" sortable="custom">
						<template slot-scope="scope">
							<span> {{ scope.row.name }} </span>
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="scope">
							<span> {{ scope.row.name }} </span>
						</template>
					</el-table-column>
				</el-table>
				<el-pagination
					background
					class="pagination"
					:current-page.sync="page.current"
					:page-sizes="[10, 20, 50, 100]"
					:page-size.sync="page.size"
					layout="total, sizes, prev, pager, next, jumper"
					:total="page.total"
					@size-change="search(1)"
					@current-change="search"
				>
				</el-pagination>
			</div>
		</div>
	</section>
</template>

<script>
/* eslint-disable */
let timeout = null;
export default {
	data() {
		return {
			isClassShow: true,
			loading: true,
			searchParams: this.$store.state.dataVerification,
			page: {
				data: null,
				current: 1,
				size: 10,
				total: 0,
				sortBy: '',
				order: ''
			},
			selections: []
		};
	},
	created() {
		this.search(1);
	},
	methods: {
		keyup() {
			if (timeout) {
				window.clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				this.search(1);
				timeout = null;
			}, 800);
		},
		selectHandler(val) {
			this.selections = val;
		},
		sortHandler({ prop, order }) {
			this.page.sortBy = prop;
			this.page.order = order;
			this.search(1);
		},
		search(pageNum) {
			this.searchParamsChange();
			this.loading = true;
			let { current, size, sortBy, order } = this.page;
			let { keyword } = this.searchParams;
			let currentPage = pageNum || current + 1;
			setTimeout(() => {
				this.page.data = [];
				this.page.current = currentPage;
				this.page.total = 232;
				this.loading = false;
			}, 1000);
		},
		reset() {
			this.searchParams = {
				keyword: '',
				compareMethod: '',
				mode: '',
				active: ''
			};
			this.search(1);
		},
		searchParamsChange() {
			this.$store.commit('dataVerification', this.searchParams);
		},
		classClickHandler(node) {
			this.search(1);
		}
	}
};
</script>

<style lang="less" scoped>
.data-verify-wrap {
	display: flex;
	height: 100%;
	overflow: hidden;
	.panel-slider {
		width: 200px;
		height: 100%;
		box-sizing: border-box;
	}
	.panel-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		.topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 10px;
			.iconfont {
				font-size: 12px;
			}
			.el-button {
				padding: 7px;
			}
			.el-button + .el-button {
				margin-left: 5px;
			}
			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.search-item {
					margin-right: 10px;
				}
				.btn-class-collapse {
					.iconfont {
						display: inline-block;
						transform: rotate(0deg);
					}
					&.is-open .iconfont {
						transform: rotate(180deg);
					}
				}
			}
		}
		.table-wrap {
			margin: 0 10px;
			flex: 1;
			display: flex;
			flex-direction: column;
			.pagination {
				padding: 20px 0;
				text-align: right;
			}
		}
	}
}
</style>
