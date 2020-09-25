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
							:placeholder="$t('dataVerification.verifyJobName')"
							@input="keyup()"
						></el-input>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.inspectMethod"
							size="mini"
							:placeholder="$t('dataVerification.verifyType')"
							@input="search(1)"
						>
							<el-option :label="$t('dataVerification.rowVerify')" value="row_count"></el-option>
							<el-option :label="$t('dataVerification.contentVerify')" value="field"></el-option>
						</el-select>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.mode"
							size="mini"
							:placeholder="$t('dataVerification.singleRepeatingVerify')"
							@input="search(1)"
						>
							<el-option :label="$t('dataVerification.singleVerify')" value="manual"></el-option>
							<el-option :label="$t('dataVerification.repeatingVerify')" value="cron"></el-option>
						</el-select>
					</li>
					<li class="search-item">
						<el-select
							v-model="searchParams.active"
							size="mini"
							:placeholder="$t('dataVerification.verifyStatus')"
							@input="search(1)"
						>
							<el-option :label="$t('dataVerification.enable')" value="1"></el-option>
							<el-option :label="$t('dataVerification.disable')" value="2"></el-option>
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
						<span>{{ $t('dataVerification.batchVerify') }}</span>
					</el-button>
					<el-button size="mini" @click="$router.push('dataVerification/setting')">
						<i class="iconfont icon-shezhi1"></i>
						<span>{{ $t('dataVerification.verifySetting') }}</span>
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
					<el-table-column :label="$t('dataVerification.verifyJobName')">
						<template slot-scope="scope">
							<div>{{ scope.row.name }}</div>
							<div style="color: #aaa;">
								<span
									>{{ inspectMethod[scope.row.inspectMethod] }} (
									{{
										scope.row.mode === 'manual'
											? $t('dataVerification.singleVerify')
											: $t('dataVerification.repeatingVerify')
									}}
									)
								</span>
								<span v-if="!scope.row.enabled" style="color:#f56c6c;">&nbsp;Disabled</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.sourceTotalRows')" align="center" width="200">
						<template slot-scope="scope">
							{{ scope.row.InspectResult ? scope.row.InspectResult.source_total : '-' }}
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.targetTotalRows')" align="center" width="200">
						<template slot-scope="scope">
							{{ scope.row.InspectResult ? scope.row.InspectResult.target_total : '-' }}
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.verifyResult')" width="180">
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
											{{ $t('dataVerification.rowConsistent') }}
											{{
												scope.row.InspectResult.target_total -
													scope.row.InspectResult.source_total
											}}
										</span>
									</span>
								</div>
								<div v-if="scope.row.difference_number && scope.row.inspectMethod === 'field'">
									<span class="error" v-if="scope.row.difference_number">
										<i class="el-icon-error"></i>
										<span>
											{{ $t('dataVerification.contConsistent') }}
											{{ scope.row.difference_number }}
										</span>
									</span>
								</div>
								<span
									class="success"
									v-if="
										scope.row.InspectResult.target_total - scope.row.InspectResult.source_total ===
											0 && scope.row.difference_number === 0
									"
								>
									<i class="el-icon-success"></i>
									<span>{{ $t('dataVerification.consistent') }}</span>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.verifyStatus')" align="center" width="140">
						<template slot-scope="scope">
							<span>{{ statusMap[scope.row.status] }}</span>
							<span v-if="scope.row.InspectResult && scope.row.status === 'running'">
								{{ `(${(Math.round(scope.row.InspectResult.progress * 1000) / 1000) * 100}%)` }}
							</span>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('dataVerification.verifyTime')"
						prop="timing.start"
						sortable="custom"
						align="center"
						width="180"
					>
						<template slot-scope="scope">
							<span>
								{{
									scope.row.InspectResult &&
										$moment(scope.row.InspectResult.createTime).format('YYYY-MM-DD HH:mm:ss')
								}}
							</span>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.operation')" align="center" width="180">
						<template slot-scope="scope">
							<el-button
								v-if="!['running', 'scheduling'].includes(scope.row.status)"
								class="btn-icon"
								type="text"
								size="mini"
								@click="startTask(scope.row.id)"
							>
								<i class="btn-icon iconfont icon-bofang"></i>
							</el-button>
							<i
								v-if="['running', 'scheduling'].includes(scope.row.status)"
								class="btn-icon el-icon-loading"
								style="color:#48B6E2;"
							></i>
							<el-button
								class="btn-icon"
								type="text"
								size="mini"
								:disabled="!scope.row.InspectResult"
								@click="
									toTableInfo(
										scope.row.id,
										scope.row.InspectResult.id,
										scope.row.inspectMethod,
										scope.row.name
									)
								"
							>
								<i class="btn-icon iconfont icon-chaxun"></i>
							</el-button>
							<el-button
								class="btn-icon el-icon-time"
								type="text"
								size="mini"
								:disabled="!scope.row.InspectResult"
								@click="toTableHistory(scope.row.id, scope.row.inspectMethod, scope.row.name)"
							></el-button>
							<el-button
								class="btn-icon el-icon-setting"
								type="text"
								size="mini"
								@click="$router.push('dataVerification/' + scope.row.id + '/edit')"
							></el-button>
							<el-button
								class="btn-icon el-icon-delete"
								type="text"
								size="mini"
								@click="remove(scope.row.id)"
							></el-button>
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
			inspectMethod: {
				row_count: this.$t('dataVerification.rowVerify'),
				field: this.$t('dataVerification.contentVerify'),
				jointField: this.$t('dataVerification.jointVerify')
			},
			statusMap: {
				waiting: this.$t('dataVerification.waiting'),
				scheduling: this.$t('dataVerification.scheduling'),
				error: this.$t('dataVerification.error'),
				done: this.$t('dataVerification.done'),
				running: this.$t('dataVerification.running')
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
		selectHandler(arr) {
			this.selections = arr.map(item => item.id);
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
		toTableInfo(id, resultId, type, name) {
			let routeUrl = this.$router.resolve({
				path: '/dataVerifyResult',
				query: {
					id: resultId,
					inspectId: id,
					type: type,
					name: name
				}
			});
			window.open(routeUrl.href, '_blank');
		},
		toTableHistory(id, type, name) {
			let routeUrl = this.$router.resolve({
				path: '/dataVerifyHistory',
				query: {
					type: type,
					inspectId: id,
					name: name
				}
			});
			window.open(routeUrl.href, '_blank');
		},
		startTask(id) {
			let selections = id ? [id] : this.selections;
			this.$api('Inspects')
				.update(
					{
						id: {
							inq: selections
						}
					},
					{ status: 'scheduling' }
				)
				.then(() => {
					this.$message.success('任务启动成功');
					this.search(this.page.current);
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
				& + .btn-icon {
					margin-left: 5px;
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
