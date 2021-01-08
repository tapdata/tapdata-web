<template>
	<TablePage
		ref="table"
		class="metadata-list-wrap"
		title="数据目录"
		row-key="id"
		:classify="{ authority: 'data_catalog_category_management' }"
		:remoteMethod="getData"
	>
		<div slot="search">
			<ul class="search-bar">
				<li>
					<el-input
						clearable
						class="input-with-select"
						size="mini"
						v-model="searchParams.keyword"
						placeholder="请输入表名/数据库名"
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
				<li>
					<el-select size="mini" v-model="searchParams.metaType" @input="table.fetch(1)">
						<el-option label="全部类型" value=""></el-option>
					</el-select>
				</li>
				<li>
					<el-select size="mini" v-model="searchParams.db" placeholder="选择所属库" @input="table.fetch(1)">
						<el-option v-for="opt in dbOptions" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
					</el-select>
				</li>
				<li>
					<el-button size="mini" type="text" @click="reset()">重置</el-button>
				</li>
			</ul>
		</div>
		<div slot="operation">
			<el-button
				v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
				size="mini"
				class="btn"
				v-show="multipleSelection.length > 0"
				@click="handleClassify"
			>
				<!-- <i class="iconfont icon-biaoqian back-btn-icon"></i> -->
				<span> {{ $t('dataFlow.taskBulkTag') }}</span>
			</el-button>
			<el-button class="btn btn-create" size="mini" @click="createModel">
				<!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
				<span> {{ $t('connection.createNewDataSource') }}</span>
			</el-button>
		</div>
		<el-table-column
			v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
			type="selection"
			width="45"
			:reserve-selection="true"
		>
		</el-table-column>
		<el-table-column label="表名/所属库" prop="name"></el-table-column>
		<el-table-column label="类型" prop="meta_type"></el-table-column>
		<el-table-column label="更新用户" prop="last_user_name"></el-table-column>
		<el-table-column label="更新时间">
			<template slot-scope="scope">
				{{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}
			</template>
		</el-table-column>
		<el-table-column label="操作">
			<template>
				<el-button size="mini" type="text">详情</el-button>
				<el-button size="mini" type="text">改名</el-button>
				<el-button size="mini" type="text">删除</el-button>
			</template>
		</el-table-column>
	</TablePage>
</template>

<script>
import TablePage from '@/components/TablePage';
export default {
	components: {
		TablePage
	},
	data() {
		return {
			searchParams: this.$store.state.metadata,
			dbOptions: [],
			page: {
				current: 1,
				size: 20,
				total: 0,
				sortBy: 'createTime',
				order: ''
			},
			list: null,
			multipleSelection: []
		};
	},
	created() {
		this.getDbOptions();
	},
	computed: {
		table() {
			return this.$refs.table;
		}
	},
	methods: {
		reset() {
			this.searchParams = {
				keyword: '',
				isFuzzy: true,
				metaType: '',
				db: ''
			};
			this.table.fetch(1);
		},
		getData(a, cb) {
			setTimeout(() => {
				cb([{ id: 111 }], 1000);
			}, 1000);
		},
		getDbOptions() {},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		nodeChecked() {},
		handleClassify() {},
		createModel() {}
	}
};
</script>
<style lang="less" scoped>
.metadata-list-wrap {
	.search-bar {
		display: flex;
		li + li {
			margin-left: 10px;
		}
	}
}
</style>
