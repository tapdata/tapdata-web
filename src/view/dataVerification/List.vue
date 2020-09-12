<template>
	<section class="data-verify-wrap">
		<div class="panel-slider" v-show="isClassShow">
			<MetaData @nodeClick="classClickHandler"></MetaData>
		</div>
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

import metaData from '../metaData';
import { toRegExp } from '../../util/util';
let timeout = null;
export default {
	components: {
		MetaData: metaData
	},
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
		create() {},
		search(pageNum) {
			this.searchParamsChange();
			this.loading = true;
			let { current, size, sortBy, order } = this.page;
			let { keyword } = this.searchParams;
			let currentPage = pageNum || current + 1;
			Inspect.get().then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.loading = false;
					this.page.data = res.data;
				}
			})
			// setTimeout(() => {
			// 	this.page.data = [
			// 		{
			// 			//_id: ObjectId(),
			// 			name: '校验任务名称',
			// 			status: 'pause/scheduling/running/error/done', // 任务状态
			// 			errorMsg: '', // 状态为 error 时有效
			// 			mode: 'manual/cron', // 运行方式，手工执行，定时调度执行
			// 			inspectMethod: 'row_count/field', // 校验方法，row_count: 行数校验；field：字段校验
			// 			timing: {
			// 				intervals: 1, // 间隔时间
			// 				intervalsUnit: 'second', // 单位：second、minute、hour、day、week、month
			// 				start: '2020-09-01 12:12:00', // 开始时间，设置以后每次触发的执行时间，例如：intervals=1，intervals_unit=minute，start= 2020-09-01 12:12:00 表示：2020-09-01 12:12:00开始，每隔一分钟执行一次
			// 				end: '2020-09-01 12:00:00' //设置重复到什么时间结束，为 null 是表示永不结束
			// 			}, // 定时调度表达式，mode = cron 时，需要配置
			// 			limit: {
			// 				keep: 1000, // 差异保存条数
			// 				fullMatchKeep: 100, // 行比对差异信息保存条数
			// 				action: 'stop/continue' // 达到差异限制后，继续执行还是停止校验，默认停止校验
			// 			},
			// 			tasks: [
			// 				{
			// 					// 源和目标，可以是关系型数据库，也可以是非关系型数据库
			// 					taskId: '1', // 子任务id，可以objectid/uuid/数字，任务内唯一
			// 					fullMatch: false, // 是否执行行匹配
			//
			// 					// 自定义行数据比对脚本， null - 使用默认实现
			// 					// 自定义样例：function(sourceRecord, targetRecord){ return true; }
			// 					compareFn: null,
			// 					// 样例：function(inspect_result){ return true; }
			// 					confirmFn: null, // 用户可以自定义通过条件
			// 					source: {
			// 						connectionId: '', // 连接ID
			// 						table: 'IV_JW_MATRL', // 不能带 owner，默认使用connection的owner
			// 						sortColumn: 'INVNT_ID', // 必填，提示使用索引字段
			// 						direction: 'ASC', // 固定值 ASC，后端强制ASC
			// 						columns: [
			// 							// 必须带有排序字段，前端可以做限制，后端要自动适配
			// 							'INVNT_ID',
			// 							'...' // 需要校验比对的列名称，必填，顺序与目标字段一致
			// 						],
			// 						limit: null, // 取多少行数据，默认全部
			// 						skip: null, // 跳过多少行数据
			// 						where: '' // sql 查询条件，直接拼接到sql中
			// 						// 默认为 null，用户可以选择使用自定义 sql，但必须包含排序字段
			// 						// "sql": null, // 与上面几个配置互斥 暂时不支持自定义
			// 					},
			// 					target: {
			// 						connectionId: '', // 连接ID
			// 						table: 'FDM_cnWarehouseJeweIryMaterial',
			// 						sortColumn: 'INVNT_ID', // 必填，提示使用索引字段
			// 						columns: [
			// 							// 必须带有排序字段，前端可以做限制，后端要自动适配
			// 							'INVNT_ID',
			// 							'...' // 需要校验比对的列名称，必填，顺序与目标字段一致
			// 						],
			// 						where: 'json string', // MongoDB where 查询条件
			// 						limit: null, // 取多少行数据，默认全部
			// 						skip: null // 跳过多少行数据
			// 					}
			// 				}
			// 			],
			// 			createUid: '',
			// 			createDate: '',
			// 			updateDate: '',
			// 			updateUid: ''
			// 		}
			// 	];
			// 	this.page.current = currentPage;
			// 	this.page.total = 232;
			// 	this.loading = false;
			// }, 1000);
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
		},
		GoTableInfo(id){
			let routeUrl = this.$router.resolve({
				path: '/dataVerifyTable'
			});
			window.open(routeUrl.href, '_blank');
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
