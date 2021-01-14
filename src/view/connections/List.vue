<template>
	<section class="connection-list-wrap">
		<TablePage
			ref="table"
			row-key="id"
			:title="$t('connection.databaseTittle')"
			:desc="description"
			:classify="{ authority: 'datasource_catalog_management', types: ['database'] }"
			:remoteMethod="getData"
			@selection-change="handleSelectionChange"
			@classify-submit="handleOperationClassify"
			@sort-change="handleSortTable"
		>
			<ul class="search-bar" slot="search">
				<li class="item">
					<el-input
						:placeholder="$t('connection.dataBaseSearch')"
						v-model="searchParams.keyword"
						class="input-with-select"
						size="mini"
						clearable
						@input="table.fetch(1, 800)"
					>
						<el-select
							v-model="searchParams.iModel"
							slot="prepend"
							class="sub-select"
							@input="table.fetch(1)"
						>
							<el-option :label="$t('connection.fuzzyQuery')" value="fuzzy"></el-option>
							<el-option :label="$t('connection.PreciseQuery')" value="precise"></el-option>
						</el-select>
					</el-input>
				</li>
				<li class="item">
					<el-select
						v-model="searchParams.databaseModel"
						:placeholder="$t('connection.connectionType')"
						clearable
						size="mini"
						@input="table.fetch(1)"
					>
						<el-option
							v-for="item in databaseModelOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
				</li>
				<li class="item">
					<el-select
						v-model="searchParams.databaseType"
						:placeholder="$t('connection.dataBaseType')"
						clearable
						size="mini"
						@input="table.fetch(1)"
					>
						<el-option
							v-for="item in databaseTypeOptions"
							:key="item.type"
							:label="item.name"
							:value="item.type"
						>
						</el-option>
					</el-select>
				</li>
				<li class="item">
					<el-select
						v-model="searchParams.status"
						:placeholder="$t('connection.dataBaseStatus')"
						clearable
						size="mini"
						@input="table.fetch(1)"
					>
						<el-option
							v-for="item in databaseStatusOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
				</li>
				<li class="item">
					<el-button type="text" class="restBtn" size="mini" @click="rest()">
						{{ $t('dataFlow.reset') }}
					</el-button>
				</li>
			</ul>
			<div slot="operation">
				<el-button
					v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
					v-readonlybtn="'datasource_category_application'"
					size="mini"
					class="btn"
					v-show="multipleSelection.length > 0"
					@click="$refs.table.showClassify(handleSelectTag())"
				>
					<i class="iconfont icon-biaoqian back-btn-icon"></i>
					<span> {{ $t('dataFlow.taskBulkTag') }}</span>
				</el-button>
				<el-button
					v-readonlybtn="'datasource_creation'"
					class="btn btn-create"
					size="mini"
					@click="checkTestConnectionAvailable"
				>
					<i class="iconfont icon-jia add-btn-icon"></i>
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
			<el-table-column prop="name" :label="$t('connection.dataBaseName')" sortable="name">
				<template slot-scope="scope">
					<div class="database-img">
						<img :src="getImgByType(scope.row.database_type)" />
					</div>
					<div class="database-text" :class="{ lineHeight: !scope.row.database_uri }">
						<span class="name" @click="preview(scope.row.id, scope.row.database_type)"
							>{{ scope.row.name }}
							<span class="tag" v-if="scope.row.listtags && scope.row.listtags.length > 0">{{
								formatterListTags(scope.row)
							}}</span></span
						>
						<div class="user" v-if="scope.row.database_uri">
							{{ formatterDatabaseType(scope.row) }}
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="username" :label="$t('connection.creator')" width="80" sortable="username">
				<template slot-scope="scope">
					<div class="database-text" style="margin-left:0;">
						<div>{{ scope.row.username }}</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column
				prop="connection_type"
				:label="$t('connection.connectionType')"
				:formatter="formatterConnectionType"
				width="120"
				sortable="connection_type"
			></el-table-column>
			<el-table-column prop="status" :label="$t('connection.dataBaseStatus')" width="100" sortable="status">
				<template slot-scope="scope">
					<span class="error" v-if="['invalid'].includes(scope.row.status)">
						<i class="el-icon-error"></i>
						<span>
							{{ $t('connection.status.invalid') }}
						</span>
					</span>
					<span class="success" v-if="['ready'].includes(scope.row.status)">
						<i class="el-icon-success"></i>
						<span>
							{{ $t('connection.status.ready') }}
						</span>
					</span>
					<span class="warning" v-if="['testing'].includes(scope.row.status)">
						<i class="el-icon-warning"></i>
						<span>
							{{ $t('connection.status.testing') }}
						</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column :label="$t('connection.operate')" width="220">
				<template slot-scope="scope">
					<el-button class="btn-text" type="text" @click="preview(scope.row.id, scope.row.database_type)">
						{{ $t('message.preview') }}
					</el-button>
					<el-button
						class="btn-text"
						type="text"
						v-readonlybtn="'datasource_edition'"
						:disabled="$disabledByPermission('datasource_edition_all_data', scope.row.user_id)"
						@click="edit(scope.row.id, scope.row.database_type)"
					>
						{{ $t('message.edit') }}
					</el-button>
					<el-button
						class="btn-text"
						type="text"
						v-readonlybtn="'datasource_creation'"
						@click="copy(scope.row)"
					>
						{{ $t('message.copy') }}
					</el-button>
					<el-button
						class="btn-text"
						type="text"
						v-readonlybtn="'datasource_delete'"
						:disabled="$disabledByPermission('datasource_delete_all_data', scope.row.user_id)"
						@click="delConfirm(scope.row)"
					>
						{{ $t('message.delete') }}
					</el-button>
				</template>
			</el-table-column>
		</TablePage>
		<el-dialog
			:title="$t('connection.deteleDatabaseTittle')"
			:close-on-click-modal="false"
			:visible.sync="deleteDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('connection.deteleDatabaseMsg') }}
				<span @click="edit(delData.id, delData.database_type)" style="color:#48B6E2;cursor: pointer">
					{{ delData.name }}</span
				>
				?
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="deleteDialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="remove(delData)" size="mini">{{ $t('message.confirm') }}</el-button>
			</span>
		</el-dialog>
		<Preview
			:id="id"
			:visible="previewVisible"
			:databaseType="databaseType"
			v-on:previewVisible="handlePreviewVisible"
		></Preview>
		<DatabaseTypeDialog
			:dialogVisible="dialogDatabaseTypeVisible"
			@dialogVisible="handleDialogDatabaseTypeVisible"
			@databaseType="handleDatabaseType"
		></DatabaseTypeDialog>
	</section>
</template>
<script>
import TablePage from '@/components/TablePage';

import DatabaseTypeDialog from './DatabaseTypeDialog';
import Preview from './Preview';
import { verify, desensitization } from './util';

let timeout = null;

export default {
	components: { TablePage, DatabaseTypeDialog, Preview },
	data() {
		return {
			user_id: this.$cookie.get('user_id'),
			restLoading: false,
			dialogDatabaseTypeVisible: false,
			deleteDialogVisible: false,
			delData: [],
			previewVisible: false,
			multipleSelection: [],
			tableData: [],
			databaseType: '',
			id: '',
			description: '',
			order: 'last_updated DESC',
			databaseModelOptions: [
				{
					label: this.$t('connection.type.source'),
					value: 'source'
				},
				{
					label: this.$t('connection.type.target'),
					value: 'target'
				},
				{
					label: this.$t('connection.type.source_and_target'),
					value: 'source_and_target'
				}
			],
			databaseStatusOptions: [
				{
					label: this.$t('connection.status.ready'),
					value: 'ready'
				},
				{
					label: this.$t('connection.status.invalid'),
					value: 'invalid'
				},
				{
					label: this.$t('connection.status.testing'),
					value: 'testing'
				}
			],
			databaseTypeOptions: [],
			whiteList: ['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres', 'elasticsearch', 'redis', 'file'], //目前白名单,
			searchParams: this.$store.state.connections,
			allowDataType: window.getSettingByKey('ALLOW_CONNECTION_TYPE')
		};
	},
	created() {
		this.getDatabaseType();
		//header
		let guideDoc =
			' <a style="color: #48B6E2" href="https://docs.tapdata.net/data-source">' +
			this.$t('dataForm.form.guideDoc') +
			'</a>';
		this.description = this.$t('connection.desc') + guideDoc;
		//定时轮询
		timeout = setInterval(() => {
			this.table.fetch(null, 0, true);
		}, 10000);
	},
	computed: {
		table() {
			return this.$refs.table;
		}
	},
	destroyed() {
		clearInterval(timeout);
	},
	methods: {
		//筛选条件
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		async getDatabaseType() {
			let filter = {
				where: {
					type: {
						in: this.allowDataType
					}
				}
			};
			let databaseTypes = await this.$api('DatabaseTypes').get({ filter: JSON.stringify(filter) });
			databaseTypes.data.forEach(dt => this.databaseTypeOptions.push(dt));
		},
		getData({ page, tags }) {
			this.$store.commit('connections', this.searchParams);
			let { current, size } = page;
			let { iModel, keyword, databaseType, databaseModel, status } = this.searchParams;
			let where = {};
			let fields = {
				name: true,
				user_id: true,
				connection_type: true,
				database_type: true,
				database_host: true,
				database_uri: true,
				status: true,
				id: true,
				listtags: true,
				tableCount: true,
				loadCount: true,
				loadFieldsStatus: true,
				schemaAutoUpdate: true
			};
			// if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS')
			// 	where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			//精准搜索 iModel
			if (keyword && keyword.trim()) {
				let filterObj = iModel ? { like: verify(keyword), options: 'i' } : keyword;
				where.or = [{ name: filterObj }, { database_uri: filterObj }, { database_host: filterObj }];
			}
			where.database_type = {
				in: this.allowDataType
			};
			databaseType && (where.database_type = databaseType);
			databaseModel && (where.connection_type = databaseModel);
			if (tags && tags.length) {
				where['listtags.id'] = {
					in: tags
				};
			}
			status && (where.status = status);
			let filter = {
				order: this.order,
				limit: size,
				fields: fields,
				skip: (current - 1) * size,
				where
			};
			return Promise.all([
				this.$api('connections').count({ where: where }),
				this.$api('connections').get({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				return {
					total: countRes.data.count,
					data: res.data
				};
			});
		},
		rest() {
			this.searchParams = {
				iModel: 'fuzzy',
				databaseType: '',
				keyword: '',
				databaseModel: '',
				status: '',
				panelFlag: true
			};
			this.table.fetch(1);
		},
		getImgByType(type) {
			if (!type) {
				type = 'default';
			}
			return require(`../../../static/image/databaseType/${type.toLowerCase()}.png`);
		},
		//列表全选
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		preview(id, type) {
			this.id = id;
			this.databaseType = type;
			if (this.whiteList.includes(type)) {
				this.previewVisible = true;
			} else {
				top.location.href = '/#/connection/' + id;
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		handlePreviewVisible() {
			this.previewVisible = false;
		},
		edit(id, type) {
			if (this.whiteList.includes(type)) {
				this.$router.push('connections/create?id=' + id + '&databaseType=' + type);
			} else {
				top.location.href = '/#/connection/' + id;
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		copy(data) {
			let headersName = { 'lconname-name': data.name };
			// return false;
			this.$api('connections')
				.copy(
					data.id,
					{
						uri: `${data.id}/copy`,
						headers: headersName
					},
					data.name
				)
				.then(res => {
					if (res && res.data) {
						this.table.fetch();
						this.$message.success(this.$t('connection.copyMsg'));
					}
				})
				.catch(err => {
					if (err && err.response) {
						if (err.response.msg === 'duplicate source') {
							this.$message.error(this.$t('connection.copyFailedMsg'));
						}
					}
				});
		},
		delConfirm(data) {
			this.deleteDialogVisible = true;
			this.delData = data;
		},
		remove(data) {
			this.$api('connections')
				.deleteConnection(data.id, data.name)
				.then(res => {
					let jobs = res.jobs || [];
					let modules = res.modules || [];
					if (jobs.length > 0 || modules.length > 0) {
						this.$message.error(this.$t('connection.checkMsg'));
					} else {
						this.$message.success(this.$t('message.deleteOK'));
						this.deleteDialogVisible = false;
						this.table.fetch();
					}
				})
				.catch(({ response }) => {
					let msg = response && response.msg;
					if (msg && (msg.jobs || msg.modules)) {
						this.$message.error(this.$t('connection.cannot_delete_remind'));
						// const h = this.$createElement;
						// this.$message.error(
						// 	h('div', {}, [
						// 		h('div', {}, ['数据源 ', h('span', {}, data.name), ' 被以下资源占用']),
						// 		...msg.jobs.map(j => h('div', {}, [])),
						// 		...msg.modules.map(j => h('div', {}, []))
						// 	])
						// );
					} else {
						this.$message.error(msg || this.$t('connection.deleteFail'));
					}
				});
		},
		//公用弹窗
		confirm(callback, catchCallback, config) {
			this.$confirm(config.Message + config.name + '?', config.title, {
				confirmButtonText: config.confirmButtonText,
				cancelButtonText: config.cancelButtonText,
				type: 'warning',
				closeOnClickModal: false
			})
				.then(callback)
				.catch(catchCallback);
		},
		//表格数据格式化
		formatterConnectionType(row) {
			switch (row.connection_type) {
				case 'target':
					return 'Target';
				case 'source':
					return 'Source';
				case 'source_and_target':
					return 'Source | Target';
			}
		},
		formatterListTags(row) {
			let listTags = row.listtags || [];
			return listTags.map(tag => tag.value).join(',');
		},
		formatterDatabaseType(row) {
			let url = null;
			if (['mongodb', 'gridfs'].includes(row.database_type)) {
				url = desensitization(row.database_uri);
			} else {
				url = row.database_host;
			}
			return url;
		},
		handleSelectTag() {
			let tagList = {};
			this.multipleSelection.forEach(row => {
				if (row.listtags && row.listtags.length > 0) {
					tagList[row.listtags[0].id] = {
						value: row.listtags[0].value
					};
				}
			});
			return tagList;
		},
		handleOperationClassify(listtags) {
			let attributes = {
				id: this.multipleSelection.map(r => r.id),
				listtags
			};
			this.$api('connections')
				.batchUpdateListtags(attributes)
				.then(() => {
					this.table.fetch();
				});
		},
		//选择创建类型
		handleDialogDatabaseTypeVisible() {
			this.dialogDatabaseTypeVisible = false;
		},
		handleDatabaseType(type) {
			this.handleDialogDatabaseTypeVisible();
			if (this.whiteList.includes(type)) {
				this.$router.push('connections/create?databaseType=' + type);
			} else {
				top.location.href = '/#/connection';
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		//检测agent 是否可用
		async checkTestConnectionAvailable() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			} else {
				this.dialogDatabaseTypeVisible = true;
			}
		}
	}
};
</script>
<style lang="less" scoped>
.connection-list-wrap {
	height: 100%;
	.database-img {
		//border: 1px solid #dedee4;
		vertical-align: middle;
		width: 40px;
		height: 40px;
		background: #ffffff;
		border-radius: 3px;
		display: flex;
		justify-content: center;
		align-items: center;
		float: left;
		img {
			width: 60%;
		}
	}
	.database-text {
		width: 70%;
		white-space: nowrap;
		word-break: break-word;
		text-overflow: ellipsis;
		float: left;
		margin-left: 10px;
		.name {
			color: #48b6e2;
			cursor: pointer;
		}
		div {
			line-height: 14px;
		}
		.user {
			color: #cccccc;
			white-space: nowrap;
			word-break: break-word;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.lineHeight {
		line-height: 40px;
	}
	.btn-text {
		color: #48b6e2;
		font-size: 12px;
		padding-right: 5px;
	}
	.tag {
		padding: 0 3px 2px 3px;
		line-height: 12px;
		font-size: 12px;
		font-weight: 400;
		color: #999999;
		background: #f5f5f5;
		border: 1px solid #dedee4;
		border-radius: 3px;
		margin-left: 5px;
	}
	.error {
		color: #f56c6c;
	}
	.success {
		color: #67c23a;
	}
	.warning {
		color: #e6a23c;
	}
	.search-bar {
		display: flex;
		.item {
			margin-right: 10px;
		}
		.sub-select {
			width: 120px;
		}
	}
	.btn + .btn {
		margin-left: 5px;
	}
	.btn {
		padding: 7px;
		background: #f5f5f5;
		i.iconfont {
			font-size: 12px;
		}
		&.btn-dropdowm {
			margin-left: 5px;
		}
		&.btn-create {
			margin-left: 5px;
		}
	}
}
</style>
