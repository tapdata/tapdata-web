<template>
	<div class="system-notification" v-loading="loading">
		<div class="notification-head">
			<div class="title">{{ $t('notification.systemNotice') }}</div>
			<div class="operation">
				<el-select
					v-model="search"
					:placeholder="$t('notification.noticeLevel')"
					class="search"
					@change="getData()"
					clearable
					size="mini"
				>
					<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
				<el-select
					v-model="msg"
					:placeholder="$t('notification.noticeType')"
					class="search"
					@change="getData()"
					clearable
					size="mini"
				>
					<el-option v-for="item in msgOptions" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
				<span @click="handlePageRead()">{{ $t('notification.maskRead') }}</span>
				<span @click="handleAllRead()">{{ $t('notification.maskReadAll') }}</span>
				<span>
					<router-link to="/notification/setting"
						><span style="color: #48B6E2">{{ $t('notification.setting') }}</span></router-link
					>
				</span>
			</div>
		</div>
		<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
			<el-tab-pane :label="$t('notification.allNotice')" name="first"></el-tab-pane>
			<el-tab-pane :label="$t('notification.unreadNotice')" name="second"></el-tab-pane>
		</el-tabs>
		<ul class="cuk-list clearfix cuk-list-type-block">
			<li class="list-item" v-for="item in listData" :key="item.id" @click="handleRead(item.id)">
				<div class="list-item-content" v-if="item.msg === 'JobDDL'">
					<div class="unread-1zPaAXtSu" v-show="!item.read"></div>
					<div class="list-item-desc">
						<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
						<span>{{ systemMap[item.system] }}</span>
						<router-link :to="`/job?id=${item.sourceId}&isMoniting=true&mapping=` + item.mappingTemplate">
							<span style="color: #48B6E2">
								{{ `${item.serverName} , ` }}
							</span>
						</router-link>
						<span>
							{{
								`${$t('notification.sourceName')} : ${item.sourceName} , ${$t(
									'notification.databaseName'
								)} : ${item.databaseName} , ${$t('notification.schemaName')} : ${item.schemaName} ,`
							}}
						</span>
						<el-tooltip :content="item.sql" placement="top">
							<span>
								{{ `DDL SQL : ${item.sql}` }}
							</span>
						</el-tooltip>
					</div>
					<div class="list-item-time">
						<span>{{ item.createTime }}</span>
					</div>
				</div>
				<div class="list-item-content" v-else>
					<div class="unread-1zPaAXtSu" v-show="!item.read"></div>
					<div class="list-item-desc">
						<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
						<span>{{ systemMap[item.system] }}</span>
						<span style="color: #48B6E2" @click="handleGo(item)">
							{{ item.serverName }}
						</span>
						<span>{{ typeMap[item.msg] }}</span>
						<span v-if="item.CDCTime">{{ getLag(item.CDCTime) }}</span>
					</div>
					<div class="list-item-time">
						<span>{{ item.createTime }}</span>
					</div>
				</div>
			</li>
		</ul>
		<el-pagination
			class="pagination"
			background
			layout="total,prev, pager, next,sizes"
			:page-sizes="[20, 30, 50, 100]"
			:page-size="pagesize"
			:total="total"
			:current-page.sync="currentPage"
			@current-change="handleCurrentChange"
			@size-change="handleSizeChange"
		>
		</el-pagination>
	</div>
</template>

<script>
import factory from '../../api/factory';
const notification = factory('notification');
import * as moment from 'moment';
import { TYPEMAP } from './tyepMap';
export default {
	data() {
		return {
			activeName: 'first',
			listData: [],
			read: true,
			loading: false,
			search: '',
			msg: '',
			currentPage: 1,
			pagesize: 20,
			total: 0,
			colorMap: {
				ERROR: 'red',
				WARN: 'orangered',
				INFO: '#48b6e2'
			},
			systemMap: {
				dataFlow: this.$t('notification.dataFlow'),
				agent: this.$t('notification.manageSever'),
				inspect: this.$t('notification.inspect'),
				JobDDL: this.$t('notification.ddlDeal')
			},
			options: [
				{
					value: 'error',
					label: 'ERROR'
				},
				{
					value: 'warn',
					label: 'WARN'
				},
				{
					value: 'info',
					label: 'INFO'
				}
			],
			msgOptions: [
				{
					value: 'deleted',
					label: this.$t('notification.jobDeleted')
				},
				{
					value: 'paused',
					label: this.$t('notification.jobPaused')
				},
				{
					value: 'stoppedByError',
					label: this.$t('notification.jobStateError')
				},
				{
					value: 'jobEncounterError',
					label: this.$t('notification.jobEncounterError')
				},
				{
					value: 'CDCLag',
					label: this.$t('notification.CDCLag')
				},
				{
					value: 'JobDDL',
					label: this.$t('notification.DDL')
				},
				{
					value: 'connectionInterrupted',
					label: this.$t('notification.serverDisconnected')
				},
				{
					value: 'manageSeverStartedSuccessfully',
					label: this.$t('notification.agentStarted')
				},
				{
					value: 'manageSeverStoppedSuccessfully',
					label: this.$t('notification.agentStopped')
				},
				{
					value: 'newSeverCreatedSuccessfully',
					label: this.$t('notification.agentCreated')
				},
				{
					value: 'newSeverDeletedSuccessfully',
					label: this.$t('notification.agentDeleted')
				}
			],
			typeMap: TYPEMAP,
			count: ''
		};
	},
	created() {
		this.getData();
		this.getUnreadNum(); //未读消息数量
		this.$root.$on('notificationUpdate', () => {
			this.getUnreadNum(); //未读消息数量
			this.getData();
		});
	},
	methods: {
		getData() {
			let where = {};
			where = {
				filter: {
					where: {},
					order: 'createTime DESC',
					limit: this.pagesize,
					skip: (this.currentPage - 1) * this.pagesize
				}
			};
			if (!this.read) {
				where.filter.where['read'] = false;
			}
			if (this.search || this.search !== '') {
				where.filter.where['level'] = this.search;
			}
			if (this.msg || this.msg !== '') {
				where.filter.where['msg'] = this.msg;
			}
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where.filter.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			this.loading = true;
			notification
				.get(where)
				.then(res => {
					if (res.data) {
						this.listData = res.data;
						//格式化日期
						if (this.listData && this.listData.length > 0) {
							this.listData.map(item => {
								item['createTime'] = item.createTime
									? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
									: '';
							});
						}
					}
				})
				.finally(() => {
					this.loading = false;
				});
			this.getCount(this.read);
		},
		handleCurrentChange(cpage) {
			this.currentPage = cpage;
			this.getData();
		},
		handleSizeChange(psize) {
			this.pagesize = psize;
			this.getData();
		},
		getCount(read) {
			let where = {
				where: {}
			};
			if (read === false) {
				where.where['read'] = false;
			}
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			if (this.search || this.search !== '') {
				where.where['level'] = this.search;
			}
			if (this.msg || this.msg !== '') {
				where.where['msg'] = this.msg;
			}
			notification
				.count(where)
				.then(res => {
					if (res.data) {
						this.total = res.data.count;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getUnreadNum() {
			let where = {
				where: {
					read: false
				}
			};
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			notification.count(where).then(res => {
				if (res.data) {
					this.count = res.data.count;
				}
			});
		},
		handleRead(id) {
			let read = this.read;
			notification.patch({ read: true, id: id }).then(res => {
				if (res.data) {
					this.getUnreadNum(); //未读消息数量
					this.getData();
					this.read = read;
					this.$root.$emit('notificationUpdate');
				}
			});
		},
		handlePageRead() {
			let ids = [];
			this.listData.map(item => {
				ids.push(item.id);
			});
			let where = {
				id: {
					inq: ids
				}
			};
			let data = {
				read: true
			};
			where = JSON.stringify(where);
			let read = this.read;
			notification.upsertWithWhere(where, data).then(res => {
				if (res.data) {
					this.getUnreadNum(); //未读消息数量
					this.getData();
					this.read = read;
					this.$root.$emit('notificationUpdate');
				}
			});
		},
		handleAllRead() {
			let where = {};
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			let data = {
				read: true
			};
			where = JSON.stringify(where);
			let read = this.read;
			notification.readAll(where, data).then(res => {
				if (res.data) {
					this.getUnreadNum(); //未读消息数量
					this.getData();
					this.read = read;
					this.$root.$emit('notificationUpdate');
				}
			});
		},
		handleClick(tab) {
			this.currentPage = 1;
			if (tab.name === 'first') {
				this.read = true; // 全部信息
			} else {
				this.read = false; //未读
			}
			this.getData();
		},
		getLag(lag) {
			let r = '0s';
			if (lag) {
				let m = moment.duration(lag, 'seconds');
				if (m.days()) {
					r = m.days() + 'd';
				} else if (m.hours()) {
					r = m.hours() + 'h';
				} else if (m.minutes()) {
					r = m.minutes() + 'm';
				} else {
					r = lag + 's';
				}
			}
			return r;
		},
		handleGo(item) {
			switch (item.system) {
				case 'dataFlow':
					this.$router.push({
						name: 'job',
						query: {
							id: item.sourceId,
							isMoniting: true,
							mapping: item.mappingTemplate
						}
					});
					break;
				case 'inspect':
					if (item.msg !== 'inspectDelete') {
						this.$router.push({
							name: 'dataVerifyResult',
							query: {
								id: item.sourceId,
								inspectId: item.inspectId,
								type: item.type,
								name: item.serveName
							}
						});
					}
					break;
				case 'agent':
					this.$router.push({
						name: 'clusterManagement'
					});
					break;
			}
		}
	}
};
</script>

<style scoped lang="less">
@unreadColor: #ee5353;
.system-notification {
	margin-left: 20px;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	font-size: 12px;
	.notification-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		color: #48b6e2;
		padding: 20px 20px 20px 0;
		.title {
			font-size: 18px;
			font-weight: bold;
			color: rgba(51, 51, 51, 1);
			line-height: 34px;
		}
		.search {
			margin-top: 10px;
			margin-right: 10px;
			width: 200px;
		}
	}
	.operation {
		cursor: pointer;
		span {
			display: inline-block;
			margin-left: 10px;
		}
	}
	ul.cuk-list {
		list-style: none;
		flex: 1;
		overflow: auto;
	}
	.clearfix {
		zoom: 1;
	}
	.clearfix:after,
	.clearfix:before {
		content: ' ';
		display: table;
	}
	[class*='cuk-'],
	[class*='cuk-'] :after,
	[class*='cuk-'] :before {
		box-sizing: border-box;
	}
	.list-item {
		position: relative;
		background: #fff;
		border-bottom: 1px solid #f5f7fa;
		cursor: pointer;
		margin-right: 30px;
		.list-item-content {
			position: relative;
			height: 50px;
			line-height: 50px;
			padding-left: 14px;
			box-sizing: border-box;
			overflow: hidden;
			display: block;
		}
		.unread-1zPaAXtSu {
			position: absolute;
			top: 22px;
			left: 8px;
			width: 6px;
			height: 6px;
			background: @unreadColor;
			border-radius: 50%;
		}
		.list-item-desc {
			color: #666;
			position: absolute;
			top: 0;
			left: 30px;
			right: 120px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.list-item-time {
			float: right;
			color: #202d40;
			font-size: 12px;
		}
		&:hover {
			background: #fafafa;
		}
	}
}
.pagination {
	text-align: right;
	padding: 10px 0 20px 0;
}
</style>
<style lang="less">
.system-notification {
	.el-tabs__item {
		height: 32px;
		line-height: 32px;
		font-size: 12px;
	}
}
</style>
