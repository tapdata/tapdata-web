<template>
	<section class="connection-wrap">
		<div class="panel-left" v-if="searchParams.panelFlag">
			<Classification
				v-on:nodeClick="nodeClick"
				@nodeDataChange="nodeDataChange"
				:type="'database'"
			></Classification>
		</div>
		<div class="panel-main">
			<div class="title">
				数据源管理
			</div>
			<div class="top-bar">
				<ul class="search-bar">
					<li :class="[{ panelOpen: searchParams.panelFlag }, 'item', 'panelBtn']" @click="handlePanelFlag">
						<i class="iconfont icon-xiangshangzhanhang"></i>
						<span>{{
							searchParams.panelFlag ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel')
						}}</span>
					</li>
					<li class="item">
						<el-input
							placeholder="请输入内容"
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
								<el-option label="模糊搜索" value="fuzzy"></el-option>
								<el-option label="精确搜素" value="precise"></el-option>
							</el-select>
						</el-input>
					</li>
					<li class="item">
						<el-select
							v-model="searchParams.databaseModel"
							placeholder="请选择"
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
							placeholder="请选择"
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
							placeholder="请选择"
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
					<li class="item" v-if="checkedTag && checkedTag !== ''">
						<el-tag size="small" closable @close="handleClose()">{{ checkedTag.value }}</el-tag>
					</li>
					<li class="item">
						<el-button class="btn" size="mini" @click="rest()">
							<i class="iconfont icon-shuaxin1 back-btn-icon"></i>
						</el-button>
					</li>
				</ul>
				<div class="top-bar-buttons">
					<el-button
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
						type="primary"
						size="mini"
						@click="dialogDatabaseTypeVisible = true"
					>
						<i class="iconfont icon-jia add-btn-icon"></i>
					</el-button>
				</div>
			</div>
			<div class="connections-list" v-loading="restLoading">
				<el-table
					v-loading="restLoading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					class="connection-table"
					row-key="id"
					@selection-change="handleSelectionChange"
				>
					<el-table-column type="selection" width="45"> </el-table-column>
					<el-table-column prop="name" :label="$t('connection.dataBaseName')">
						<template slot-scope="scope">
							<div class="database-img">
								<img :src="getImgByType(scope.row.database_type)" />
							</div>
							<div class="database-text">
								<div>{{ scope.row.name }}</div>
								<div class="user">admin</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="database_uri" :label="$t('connection.dataBaseHost')"></el-table-column>
					<el-table-column
						prop="connection_type"
						:label="$t('connection.dataBaseType')"
						:formatter="formatterConnectionType"
						width="180"
					></el-table-column>
					<el-table-column prop="status" :label="$t('connection.dataBaseStatus')" width="180">
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
								<i class="icon-gantanhao2"></i>
								<span>
									{{ $t('connection.status.testing') }}
								</span>
							</span>
						</template>
					</el-table-column>
					<el-table-column
						prop="listtags"
						:label="$t('connection.dataBaseClassify')"
						width="180"
						:formatter="formatterListTags"
					></el-table-column>
					<el-table-column :label="$t('connection.operate')" width="220">
						<template slot-scope="scope">
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_edition'"
								:content="$t('message.delete')"
								placement="bottom"
							>
								<el-button type="text" @click="preview(scope.row.id)">
									<i class="iconfont task-list-icon icon-chaxun1"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_edition'"
								:content="$t('message.edit')"
								placement="bottom"
							>
								<el-button type="text" @click="edit(scope.row.id, scope.row.database_type)">
									<i class="iconfont task-list-icon icon-ceshishenqing"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_edition'"
								:content="$t('message.delete')"
								placement="bottom"
							>
								<el-button type="text" @click="test(scope.row.id, scope.row.database_type)">
									<i class="iconfont task-list-icon icon-lianjie1"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_edition'"
								:content="$t('dataFlow.edit')"
								placement="bottom"
							>
								<el-button type="text" @click="reload(scope.row)">
									<i class="iconfont  task-list-icon  icon-kujitongbucopy"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_creation'"
								:content="$t('message.delete')"
								placement="bottom"
							>
								<el-button type="text" @click="copy(scope.row)">
									<i class="iconfont task-list-icon icon-fuzhi1"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip
								class="item"
								v-readonlybtn="'datasource_delete'"
								:content="$t('message.delete')"
								placement="bottom"
							>
								<el-button type="text" @click="remove(scope.row)">
									<i class="iconfont task-list-icon icon-shanchu"></i>
								</el-button>
							</el-tooltip>
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
		<Preview :id="id" :visible="previewVisible" v-on:previewVisible="handlePreviewVisible"></Preview>
	</section>
</template>
<script>
import Classification from '@/components/Classification';
import SelectClassify from '@/components/SelectClassify';
import DatabaseTypeDialog from './DatabaseTypeDialog';
import Preview from './Preview';
import { verify } from './util';
import { toRegExp } from '../../util/util';
let timeout = null;

export default {
	components: { Classification, SelectClassify, DatabaseTypeDialog, Preview },
	data() {
		return {
			dialogVisible: false,
			restLoading: false,
			dialogDatabaseTypeVisible: false,
			previewVisible: false,
			checkedTag: '',
			tagList: [],
			multipleSelection: [],
			tableData: [],
			id: '',
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
					label: '源头',
					value: 'source'
				},
				{
					label: '目标',
					value: 'target'
				},
				{
					label: '源头和目标',
					value: 'source_and_target'
				}
			],
			databaseStatusOptions: [
				{
					label: '有效',
					value: 'ready'
				},
				{
					label: '无效',
					value: 'invalid'
				},
				{
					label: '测试中',
					value: 'testing'
				}
			],
			databaseTypeOptions: [],
			searchParams: this.$store.state.connections
		};
	},
	created() {
		this.search(1);
		this.getDatabaseType();
	},
	methods: {
		// 面板显示隐藏
		handlePanelFlag() {
			this.$set(this.searchParams, 'panelFlag', !this.searchParams.panelFlag);
			this.$store.commit('dataFlows', this.searchParams);
		},
		//筛选条件
		async getDatabaseType() {
			let databaseTypes = await this.$api('DatabaseTypes').get();
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
		getImgByType(type) {
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
		search(pageNum) {
			this.$store.commit('connections', this.searchParams);
			this.restLoading = true;
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
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS')
				where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			//精准搜索 iModel
			if (keyword && keyword.trim() && iModel === 'fuzzy') {
				let word = verify(keyword);
				where.or = [
					{
						name: { like: toRegExp(word), options: 'i' }
					},
					{
						database_uri: { like: toRegExp(word), options: 'i' }
					},
					{
						database_host: { like: toRegExp(word), options: 'i' }
					}
				];
			} else if (keyword && keyword.trim() && iModel === 'precise') {
				where.or = [
					{
						name: { like: keyword }
					},
					{
						database_uri: { like: keyword }
					},
					{
						database_host: { like: keyword }
					}
				];
			}
			databaseType && (where.database_type = databaseType);
			databaseModel && (where.connection_type = databaseModel);
			status && (where.status = status);
			let filter = {
				order: 'name DESC',
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
			this.$api('connections')
				.updateById(data.id, {
					status: 'testing',
					name: data.name
				})
				.then(res => {
					if (res.data) {
						this.$message.success(this.$t('message.deleteOK'));
					}
				})
				.catch(() => {
					this.$message.error(this.$t('message.deleteFail'));
				});
		},
		async test(id, type) {
			let result = null;
			if (type === 'mongodb') {
				result = await this.$api('connections').customQuery([id]);
			} else {
				result = await this.$api('connections').get([id]);
			}
			if (result.data) {
				this.search();
				this.$message.success(this.$t('message.deleteOK'));
			}
		},
		preview(id) {
			this.id = id;
			this.previewVisible = true;
		},
		handlePreviewVisible() {
			this.previewVisible = false;
		},
		edit(id, type) {
			this.$router.push('connections/create?id=' + id + '&databaseType=' + type);
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
						this.$message.success('保存成功');
					}
				});
		},
		remove(data) {
			let config = {
				title: this.$t('message.deteleJobMessage'),
				Message: this.$t('message.deteleJobMessage'),
				confirmButtonText: this.$t('dataFlow.button.reset'),
				cancelButtonText: this.$t('message.cancel'),
				name: data.name,
				id: data.id
			};
			this.confirm(
				() => {
					this.$api('connections')
						.deleteConnection(data.id, data.name)
						.then(() => {
							this.$message.success('删除成功');
							this.search(this.page.current);
						});
				},
				() => {
					this.$message.error('删除失败');
				},
				config
			);
		},
		confirm(callback, catchCallback, config) {
			this.$confirm(config.title + config.name, config.title, {
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
		//筛选分类
		nodeClick(data) {
			if (data) {
				this.checkedTag = {
					id: data.id,
					value: data.value
				};
			}
			this.search();
		},
		nodeDataChange(list) {
			let tag = list.find(item => item.id === this.checkedTag.id);
			if (tag) {
				this.checkedTag.value = tag.value;
			}
			this.search();
		},
		handleClose() {
			this.checkedTag = '';
			this.search();
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
			let attributes = [];
			if (this.dataFlowId) {
				let node = {
					id: this.dataFlowId,
					listtags: listtags
				};
				attributes.push(node);
			} else {
				this.multipleSelection.forEach(row => {
					row.listtags = row.listtags || [];
					let node = {
						id: row.id,
						listtags: listtags
					};
					attributes.push(node);
				});
			}
			// connections.patchAll({ attrs: attributes }).then(() => {
			// 	this.dataFlowId = '';
			// 	this.search();
			// });
		},
		//选择创建类型
		handleDialogDatabaseTypeVisible() {
			this.dialogDatabaseTypeVisible = false;
		},
		handleDatabaseType(type) {
			this.handleDialogDatabaseTypeVisible();
			if (
				['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres', 'elasticsearch', 'redis', 'db2'].includes(type)
			) {
				this.$router.push('connections/create?databaseType=' + type);
			} else {
				top.location.href = '/#/connection';
			}
		}
	}
};
</script>
<style lang="less" scoped>
.connection-wrap {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	.panel-left {
		width: 200px;
		height: 100%;
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
				padding: 5px 12px;
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
					background: #48b6e2;
				}
			}
			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.item {
					margin-right: 10px;
				}
				.sub-select {
					width: 100px;
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
			border: 1px solid #dedee4;
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
				width: 50%;
			}
		}
		.database-text {
			width: 70%;
			white-space: nowrap;
			word-break: break-word;
			text-overflow: ellipsis;
			float: left;
			margin-top: 5px;
			margin-left: 10px;
			div {
				line-height: 14px;
			}
			.user {
				color: #cccccc;
			}
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
	.thead {
		color: #999;
		th {
			padding: 5px 0;
			background: #f5f5f5;
		}
	}
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
