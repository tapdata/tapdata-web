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
							placeholder="任务名称"
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
					<li class="search-item" v-if="searchParams.tag">
						<el-tag
							size="small"
							closable
							@close="
								searchParams.tag = null;
								search(1);
							"
						>
							{{ searchParams.tag.value }}
						</el-tag>
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
					<el-button type="primary" size="mini" @click="$router.push('dataVerification/create')">
						<i class="iconfont icon-jia add-btn-icon"></i>
					</el-button>
				</div>
			</div>
			<div class="table-wrap">
				<el-table
					style="border: 1px solid #dedee4;border-bottom: none;"
					v-loading="loading"
					:data="page.data"
					@sort-change="sortHandler"
					@selection-change="selectHandler"
				>
					<el-table-column type="selection" width="44" align="center"></el-table-column>
					<el-table-column label="任务名称">
						<template slot-scope="scope">
							<div>{{ scope.row.name }}</div>
							<div style="color: #aaa;">
								<span>{{ scope.row.inspectMethod }} ( {{ scope.row.mode }} ) </span>
								<span v-if="!scope.row.enabled" style="color:#f56c6c;">&nbsp;Disabled</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="源总行数" align="center" width="200">
						<template slot-scope="scope">
							{{ scope.row.InspectResult ? scope.row.InspectResult.source_total : '-' }}
						</template>
					</el-table-column>
					<el-table-column label="目标总行数" align="center" width="200">
						<template slot-scope="scope">
							{{ scope.row.InspectResult ? scope.row.InspectResult.target_total : '-' }}
						</template>
					</el-table-column>
					<el-table-column label="校验结果" width="180">
						<template slot-scope="scope">
							<div class="inspect-result" v-if="scope.row.InspectResult">
								<div
									v-if="
										scope.row.InspectResult.target_total - scope.row.InspectResult.source_total != 0
									"
								>
									<span
										class="error"
										v-if="
											scope.row.InspectResult.target_total -
												scope.row.InspectResult.source_total !=
												0
										"
									>
										<i class="el-icon-error"></i>
										<span>
											行数差异
											{{
												scope.row.InspectResult.target_total -
													scope.row.InspectResult.source_total
											}}
										</span>
									</span>
								</div>
								<div v-if="scope.row.difference_number">
									<span class="error" v-if="scope.row.difference_number">
										<i class="el-icon-error"></i>
										<span>
											内容差异
											{{ scope.row.difference_number }}
										</span>
									</span>
								</div>
								<span class="success" v-if="!scope.row.result === 'passed'">
									<i class="el-icon-success"></i>
									<span>一致</span>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="执行状态" align="center" width="140">
						<template slot-scope="scope">
							<span>{{ scope.row.status }}</span>
							<span v-if="scope.row.InspectResult && scope.row.status === 'running'">
								({{ scope.row.InspectResult.progress * 100 }}%)
							</span>
						</template>
					</el-table-column>
					<el-table-column label="校验时间" prop="timing.start" sortable="custom" align="center" width="180">
						<template slot-scope="scope">
							<span>
								{{
									scope.row.InspectResult &&
										$moment(scope.row.InspectResult.createTime).format('YYYY-MM-DD HH:mm:ss')
								}}
							</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="160">
						<template slot-scope="scope">
							<i
								v-if="!['running', 'scheduling'].includes(scope.row.status)"
								class="btn-icon iconfont icon-bofang"
								@click="run(scope.row.id)"
							></i>
							<i
								v-if="['running', 'scheduling'].includes(scope.row.status)"
								class="btn-icon el-icon-loading"
							></i>
							<i
								class="btn-icon iconfont icon-chaxun"
								:class="{ disabled: !scope.row.InspectResult }"
								@click="scope.row.InspectResult && $router.push('dataVerification/create')"
							></i>
							<i
								class="btn-icon el-icon-time"
								:class="{ disabled: !scope.row.InspectResult }"
								@click="scope.row.InspectResult && $router.push('dataVerification/create')"
							></i>
							<i class="btn-icon el-icon-setting" @click="$router.push('dataVerification/create')"></i>
							<i class="btn-icon el-icon-delete" @click="remove(scope.row.id)"></i>
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
				size: 20,
				total: 0,
				sortBy: 'last_updated',
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
			let { keyword, inspectMethod, mode, enabled, tag } = this.searchParams;
			let currentPage = pageNum || current + 1;
			let where = {};
			inspectMethod && (where.inspectMethod = inspectMethod);
			mode && (where.mode = mode);
			enabled && (where.enabled = enabled);
			tag && (where['listtags.id'] = { in: [tag.id] });
			if (keyword && keyword.trim()) {
				where.name = toRegExp(keyword);
			}
			let filter = {
				order: sortBy + ' ' + (order === 'ascending' ? 'ASC' : 'DESC'),
				limit: size,
				skip: (currentPage - 1) * size,
				where
			};
			Promise.all([
				this.$api('Inspects').count(where),
				this.$api('Inspects').get({
					filter: JSON.stringify(filter)
				})
			])
				.then(([countRes, res]) => {
					if (res.data) {
						let list = res.data || [];
						this.page.data = list;
						this.page.current = currentPage;
						this.page.total = countRes.data.count;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		reset() {
			this.searchParams = {
				keyword: '',
				inspectMethod: '',
				mode: '',
				enabled: '',
				tag: null
			};
			this.search(1);
		},
		searchParamsChange() {
			this.$store.commit('dataVerification', this.searchParams);
		},
		classClickHandler(node) {
			this.searchParams.tag = node;
			this.search(1);
		},
		toTableInfo(id) {
			let routeUrl = this.$router.resolve({
				path: '/dataVerifyResult',
				query: {
					id: id
				}
			});
			window.open(routeUrl.href, '_blank');
		},
		run(id) {
			this.$api('Inspects')
				.patch({ id, status: 'scheduling' })
				.then(() => {
					let { data, current } = this.page;
					this.$message.success(this.$t('message.deleteOK'));
					this.search(data.length === 1 ? current - 1 : current);
				});
		},
		remove(id) {
			this.$confirm(this.$t('message.deteleMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('metaData.deleteNode'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(() => {
				this.$api('Inspects')
					.delete(id)
					.then(() => {
						let { data, current } = this.page;
						this.$message.success(this.$t('message.deleteOK'));
						this.search(data.length === 1 ? current - 1 : current);
					});
			});
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
			.btn-icon {
				font-size: 16px;
				cursor: pointer;
				&.disabled {
					color: #ccc;
					cursor: unset;
				}
				&.el-icon-loading {
					cursor: unset;
				}
				& + .btn-icon {
					margin-left: 10px;
				}
			}
			.inspect-result {
				.error,
				.success {
					padding: 0 8px 0 5px;
					display: inline-block;
					line-height: 20px;
					color: #fff;
					border-radius: 20px;
				}
				.error {
					background: #f56c6c;
				}
				.success {
					background: #70ae48;
				}
			}
			.pagination {
				padding: 20px 0;
				text-align: right;
			}
		}
	}
}
</style>
