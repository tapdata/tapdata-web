<template>
	<section class="connection-box">
		<SubHead :tittle="databaseTittle" :description="description"></SubHead>
		<section class="connection-wrap">
			<div class="panel-left" v-if="searchParams.panelFlag && $window.getSettingByKey('SHOW_CLASSIFY')">
				<Classification
					:authority="'SYNC_category_management'"
					@nodeChecked="nodeDataChange"
					:type="'database'"
				></Classification>
			</div>
			<div class="panel-main">
				<div class="top-bar">
					<ul class="search-bar">
						<li
							v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
							:class="[{ panelOpen: searchParams.panelFlag }, 'item', 'panelBtn']"
							@click="handlePanelFlag"
						>
							<i class="iconfont icon-xiangshangzhanhang"></i>
						</li>
						<li class="item">
							<el-input
								:placeholder="$t('connection.dataBaseSearch')"
								v-model="searchParams.keyword"
								class="input-with-select"
								size="mini"
								clearable
								debounce
								@input="keyup()"
							>
								<el-select
									v-model="searchParams.iModel"
									slot="prepend"
									clearable
									placeholder="请选择"
									class="sub-select"
									@input="search(1)"
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
								@input="search(1)"
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
								@input="search(1)"
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
								@input="search(1)"
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
					<div class="top-bar-buttons">
						<el-button
							v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
							v-readonlybtn="'datasource_category_application'"
							size="mini"
							class="btn"
							v-show="multipleSelection.length > 0"
							@click="handleClassify"
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
				</div>
				<div class="connections-list" v-loading="restLoading">
					<el-table
						:element-loading-text="$t('dataFlow.dataLoading')"
						:data="tableData"
						height="100%"
						class="connection-table"
						:row-key="getRowKeys"
						@selection-change="handleSelectionChange"
					>
						<el-table-column
							v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
							type="selection"
							width="45"
							:reserve-selection="true"
						>
						</el-table-column>
						<el-table-column prop="name" :label="$t('connection.dataBaseName')">
							<template slot-scope="scope">
								<div class="database-img">
									<img :src="getImgByType(scope.row.database_type)" />
								</div>
								<div class="database-text" :class="{ lineHeight: !scope.row.database_uri }">
									<span
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
						<el-table-column prop="user_id" :label="$t('connection.creator')" width="80">
							<template slot-scope="scope">
								<div class="database-text">
									<div>{{ usersData[scope.row.user_id] }}</div>
									<div>{{ scope.row.username }}</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column
							prop="connection_type"
							:label="$t('connection.connectionType')"
							:formatter="formatterConnectionType"
							width="120"
						></el-table-column>
						<el-table-column prop="status" :label="$t('connection.dataBaseStatus')" width="100">
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
						<el-table-column :label="$t('connection.operate')" width="200">
							<template slot-scope="scope">
								<el-button
									class="btn-text"
									type="text"
									@click="preview(scope.row.id, scope.row.database_type)"
								>
									{{ $t('message.preview') }}
								</el-button>
								<el-button
									class="btn-text"
									type="text"
									v-readonlybtn="'datasource_edition'"
									:disabled="permissionBtnDisabel('datasource_edition_all_data', scope.row.user_id)"
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
									:disabled="permissionBtnDisabel('datasource_delete_all_data', scope.row.user_id)"
									@click="delConfirm(scope.row)"
								>
									{{ $t('message.delete') }}
								</el-button>
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
					<el-button type="primary" @click="remove(delData)" size="mini">{{
						$t('message.confirm')
					}}</el-button>
				</span>
			</el-dialog>
			<SelectClassify
				ref="SelectClassify"
				:dialogVisible="dialogVisible"
				type="database"
				:tagLists="tagList"
				@dialogVisible="handleDialogVisible"
				@operationsClassify="handleOperationClassify"
			></SelectClassify>
			<DatabaseTypeDialog
				:dialogVisible="dialogDatabaseTypeVisible"
				@dialogVisible="handleDialogDatabaseTypeVisible"
				@databaseType="handleDatabaseType"
			></DatabaseTypeDialog>
			<Preview
				:id="id"
				:visible="previewVisible"
				:databaseType="databaseType"
				v-on:previewVisible="handlePreviewVisible"
			></Preview>
		</section>
	</section>
</template>
<script>
import Classification from '@/components/Classification';
import SelectClassify from '@/components/SelectClassify';
import SubHead from '@/components/SubHead';
import DatabaseTypeDialog from './DatabaseTypeDialog';
import Preview from './Preview';
import { verify, desensitization } from './util';
import { permissionBtnDisabel } from '@/plugins/directive';

let timeout = null;

export default {
	components: { Classification, SelectClassify, DatabaseTypeDialog, Preview, SubHead },
	data() {
		return {
			user_id: this.$cookie.get('user_id'),
			dialogVisible: false,
			restLoading: false,
			dialogDatabaseTypeVisible: false,
			deleteDialogVisible: false,
			delData: [],
			previewVisible: false,
			checkedTags: [],
			tagList: [],
			multipleSelection: [],
			tableData: [],
			usersData: [],
			databaseType: '',
			id: '',
			databaseTittle: '',
			description: '',
			page: {
				current: 1,
				size: 20,
				total: 0,
				sortBy: 'createTime',
				order: '',
				panelFlag: true
			},
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
			whiteList: ['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres', 'elasticsearch', 'redis'], //目前白名单,
			searchParams: this.$store.state.connections,
			timer: '',
			allowDataType: window.getSettingByKey('ALLOW_CONNECTION_TYPE')
		};
	},
	created() {
		// this.formatterUserName();
		this.getDatabaseType();
		this.search(1);
		//header
		this.databaseTittle = this.$t('connection.databaseTittle');
		this.description = this.$t('connection.desc');
		//定时轮询
		this.timer = setInterval(() => {
			// this.formatterUserName();
			this.search(this.page.current, 1);
		}, 10000);
	},
	destroyed() {
		clearInterval(this.timer);
	},
	methods: {
		permissionBtnDisabel,

		// 面板显示隐藏
		handlePanelFlag() {
			this.$set(this.searchParams, 'panelFlag', !this.searchParams.panelFlag);
			this.$store.commit('dataFlows', this.searchParams);
		},

		//筛选条件
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
		keyup() {
			if (timeout) {
				window.clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				this.search(1);
				timeout = null;
			}, 800);
		},
		//列表全选
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		//列表操作
		getRowKeys(row) {
			return row.id; // 每条数据的唯一识别值
		},
		getImgByType(type) {
			if (!type) {
				type = 'default';
			}
			return require(`../../../static/image/databaseType/${type.toLowerCase()}.png`);
		},
		rest() {
			this.searchParams = {
				iModel: 'fuzzy',
				databaseType: '',
				keyword: '',
				databaseModel: '',
				status: '',
				rowsPerPage: '',
				descending: '',
				sortBy: '',
				panelFlag: true
			};
			this.search(1);
		},
		search(pageNum, loading) {
			this.$store.commit('connections', this.searchParams);
			if (loading == 1) {
				this.restLoading = false;
			} else {
				this.restLoading = true;
			}
			let { current, size } = this.page;
			let { iModel, keyword, databaseType, databaseModel, status } = this.searchParams;
			let currentPage = pageNum || current + 1;
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
			keyword = keyword ? keyword.trim() : '';
			if (keyword && iModel === 'fuzzy') {
				let word = verify(keyword);
				where.or = [
					{
						name: { like: word, options: 'i' }
					},
					{
						database_uri: { like: word, options: 'i' }
					},
					{
						database_host: { like: word, options: 'i' }
					}
				];
			} else if (keyword && iModel === 'precise') {
				where.or = [
					{
						name: keyword
					},
					{
						database_uri: keyword
					},
					{
						database_host: keyword
					}
				];
			}
			where.database_type = {
				in: this.allowDataType
			};
			databaseType && (where.database_type = databaseType);
			databaseModel && (where.connection_type = databaseModel);
			if (this.checkedTags && this.checkedTags.length) {
				where['listtags.id'] = {
					in: this.checkedTags
				};
			}
			status && (where.status = status);
			let filter = {
				order: 'createTime DESC',
				limit: size,
				fields: fields,
				skip: (currentPage - 1) * size,
				where
			};
			Promise.all([
				this.$api('connections').count({ where: where }),
				this.$api('connections').get({
					filter: JSON.stringify(filter)
				})
			])
				.then(([countRes, res]) => {
					if (res.data) {
						this.tableData = res.data || [];
						this.page.current = currentPage;
						this.page.total = countRes.data.count;
					}
				})
				.finally(() => {
					this.restLoading = false;
				});
		},
		reload(data) {
			let config = {
				title: this.$t('connection.reloadTittle'),
				Message: this.$t('connection.reloadMsg'),
				confirmButtonText: this.$t('message.confirm'),
				cancelButtonText: this.$t('message.cancel'),
				name: data.name,
				id: data.id
			};
			this.confirm(
				() => {
					this.$api('connections')
						.updateById(data.id, {
							status: 'testing',
							name: data.name
						})
						.then(res => {
							if (res.data) {
								this.$message.success(this.$t('connection.reloadOK'));
								this.search(this.page.current);
							}
						})
						.catch(() => {
							this.$message.error(this.$t('connection.reloadFail'));
						});
				},
				() => {},
				config
			);
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
						this.search(this.page.current);
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
						this.search(this.page.current);
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
		searchParamsChange() {
			this.$store.commit('connections', this.searchParams);
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
		// async formatterUserName() {
		// 	let usersData = await this.$api('users').get();
		// 	let Map = {};
		// 	if (usersData.data && usersData.data.length > 0) {
		// 		usersData.data.map(s => (Map[s.id] = s.username || 'admin'));
		// 	}
		// 	this.usersData = Map;
		// },
		//筛选分类
		nodeDataChange(checkedTags) {
			this.checkedTags = checkedTags;
			this.search(this.page.current);
		},
		//设置分类
		handleDialogVisible() {
			this.dialogVisible = false;
		},
		handleClassify() {
			if (this.multipleSelection.length === 0) {
				this.$message.info(this.$t('dataFlow.selectRowdata'));
				return;
			}
			this.tagList = this.handleSelectTag();
			this.dialogVisible = true;
		},
		handlerAddTag(id, listTags) {
			this.dataFlowId = id;
			this.tagList = listTags || [];
			this.dialogVisible = true;
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
			let attributes = { id: [], listtags };
			if (this.dataFlowId) {
				attributes.id.push(this.dataFlowId);
			} else {
				attributes.id = this.multipleSelection.map(r => r.id);
			}
			this.$api('connections')
				.batchUpdateListtags(attributes)
				.then(() => {
					this.search(this.page.current);
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
.connection-box {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	flex-direction: column;
	background: #fafafa;
}
.connection-wrap {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	.panel-left {
		width: 200px;
		height: 100%;
		margin-top: 10px;
		margin-left: 10px;
		box-sizing: border-box;
	}
	.panel-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		.top-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 10px;
			.panelBtn {
				padding: 5px 7px;
				color: #666;
				cursor: pointer;
				font-size: 12px;
				border: 1px solid #dcdfe6;
				border-radius: 3px;
				.iconfont {
					display: inline-block;
					font-size: 12px;
					transform: rotate(00deg);
				}
			}
			.panelOpen {
				.iconfont {
					transform: rotate(180deg) !important;
				}
			}
			.panelBtn:hover {
				color: #48b6e2;
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
			.restBtn {
				color: #48b6e2;
			}
			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.item {
					margin-right: 10px;
				}
				.sub-select {
					width: 120px;
				}
			}
		}
		.pagination {
			text-align: right;
			height: 26px;
			line-height: 23px;
			margin-top: 7px;
		}
		.title {
			margin-left: 10px;
			margin-top: 5px;
			font-size: 14px;
			font-weight: bold;
			color: #333;
		}
	}
}
.connections-list {
	flex: 1;
	overflow: hidden;
	padding: 0 10px 10px 10px;
	display: flex;
	flex-direction: column;
	font-size: 14px;
	.connection-table {
		flex: 1;
		overflow: hidden;
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
		}
		.error {
			color: #d54e21;
		}
		.success {
			color: #0ab300;
		}
		.warning {
			color: #e6a23c;
		}
	}
	.el-button.is-disabled {
		color: #c0c4cc;
	}
	.el-button--text {
		color: #606266;
	}
}
</style>
<style lang="less">
.connection-table {
	border: 1px solid #eeeeee;
	thead {
		th {
			padding: 2px 0;
			background: #fafafa;
			color: #999;
		}
	}
}
.connections-list .el-pagination .el-pagination__total {
	float: left;
}
.connection-table .el-table th,
.connection-table .el-table tr {
	background-color: #fcfcfc;
}
.connection-table .el-table .cell,
.connection-table .el-table th div,
.el-table--border td:first-child .cell,
.el-table--border th:first-child .cell {
	padding-left: 0px;
}
</style>
