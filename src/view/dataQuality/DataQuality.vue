<template>
	<section class="data-quality-wrap">
		<TablePage ref="table" :title="$t('dataQuality.title')" :desc="$t('dataQuality.desc')" :remoteMethod="getData">
			<!-- 过滤项 -->
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-input
							clearable
							class="input-with-select"
							size="mini"
							suffix-icon="el-icon-search"
							v-model="searchParams.keyword"
							:placeholder="$t('dataQuality.sourceName')"
							@input="table.fetch(1, 800)"
						>
							<el-select
								style="width: 120px;"
								slot="prepend"
								v-model="searchParams.isFuzzy"
								@input="table.fetch(1)"
							>
								<el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
								<el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
							</el-select>
						</el-input>
					</li>
					<template v-if="searchParams.keyword">
						<li>
							<el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
						</li>
						<li>
							<el-button size="mini" type="text" @click="reset('reset')">{{
								$t('button.reset')
							}}</el-button>
						</li>
					</template>
				</ul>
			</div>

			<!-- 列表项 -->
			<el-table-column :label="$t('dataQuality.sourceName')" prop="name">
				<template slot-scope="scope">
					{{ scope.row.source ? scope.row.source.name : '' }}
					<div class="gray">{{ scope.row.collection }}</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.totalDocs')" prop="total_docs">
				<template slot-scope="scope">
					{{ scope.row.total_docs }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.violatedDocs')" prop="violated_docs">
				<template slot-scope="scope">
					<a target="_blank" :class="{ link: scope.row.violated_docs }" @click="violationData(scope.row)">
						{{ scope.row.violated_docs }}
					</a>
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.violatePercentage')" prop="violate_percentage">
				<template slot-scope="scope">
					{{
						scope.row.total_docs && scope.row.violated_docs
							? ((scope.row.violated_docs / scope.row.total_docs) * 100).toFixed(2)
							: 0
					}}
					%
				</template>
			</el-table-column>
			<el-table-column :label="$t('dataQuality.createTime')" prop="create_time">
				<template slot-scope="scope">
					{{ $moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
				</template>
			</el-table-column>
		</TablePage>
	</section>
</template>

<script>
import TablePage from '@/components/TablePage';
import { toRegExp } from '../../util/util';

export default {
	name: 'DataQuality',

	components: {
		TablePage
	},

	data() {
		return {
			searchParams: {
				// 搜索参数
				keyword: '', // 关键词
				isFuzzy: true // 是否模糊查询
			},
			order: { last_updated: -1 } // 默认排序方法
		};
	},

	computed: {
		// table组件dom实体
		table() {
			return this.$refs.table;
		}
	},

	methods: {
		// 获取列表数据
		getData({ page }) {
			let { current, size } = page;
			let { isFuzzy, keyword } = this.searchParams;
			let where = { violated_docs: { gt: 0 } }; // 查询条件

			if (keyword && keyword.trim()) {
				let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
				where.or = [{ 'source.name': filterObj }, { collection: filterObj }];
			}

			let filter = {
				order: this.order,
				limit: size,
				skip: (current - 1) * size,
				where
			};

			return Promise.all([
				this.$api('DataQuality').count({ where }),
				this.$api('DataQuality').getList({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				this.table.setCache({
					isFuzzy,
					keyword
				});
				return {
					total: countRes.data.count,
					data: res.data
				};
			});
		},
		// 跳转详情页(暂时跳老页面)
		violationData(item) {
			if (item.violated_docs) {
				this.$router.push({
					name: 'dataQualityDetail',
					params: {
						id: item.id
					},
					query: {
						collection_name: item.collection,
						connection_id: item.connection_id,
						source_name: item.source.name
					}
				});
			}
		},
		// 重置表单
		reset(name) {
			if (name === 'reset') {
				this.searchParams = {
					keyword: '',
					isFuzzy: true
				};
			}

			this.table.fetch(1);
		}
	},

	mounted() {
		// 初始化缓存搜索参数
		this.searchParams = Object.assign(this.searchParams, this.table.getCache());
	}
};
</script>

<style lang="less" scoped>
.data-quality-wrap {
	height: 100%;
	.search-bar {
		display: flex;
		li + li {
			margin-left: 10px;
		}
	}
	.gray {
		color: #bbb;
	}
	.link {
		cursor: pointer;
		color: #f56c6c;
	}
}
</style>
