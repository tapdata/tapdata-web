<template>
	<el-popover placement="bottom" trigger="hover" @show="activeTab = 'system'">
		<div class="btn" slot="reference" @click="toCenter()">
			<el-badge class="item-badge" :value="unRead" :max="99" :hidden="!unRead">
				<i class="iconfont icon-lingdang"></i>
			</el-badge>
		</div>
		<el-tabs
			stretch
			class="notification-popover-wrap"
			v-model="activeTab"
			type="border-card"
			@tab-click="tabHandler"
		>
			<el-tab-pane class="tab-item" :label="$t('notification.systemNotice')" name="system">
				<div class="item-head">
					<span>
						<router-link to="/settingCenter/notificationSetting">
							<span>
								{{ $t('notification.setting') }}
							</span>
						</router-link>
					</span>
					<span class="item-head-text">
						<router-link to="/notification">
							<span>
								{{ $t('notification.viewMore') }}
							</span>
						</router-link>
					</span>
				</div>
				<ul class="cuk-list clearfix cuk-list-type-block">
					<li class="list-item" v-for="item in listData" :key="item.id" @click="handleRead(item.id)">
						<div class="list-item-content" v-if="item.msg === 'JobDDL'">
							<div class="unread-1zPaAXtSu" v-show="!item.read"></div>
							<div class="list-item-desc">
								<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
								<span>{{ systemMap[item.system] }}</span>
								<router-link
									:to="`/job?id=${item.sourceId}&isMoniting=true&mapping=` + item.mappingTemplate"
								>
									<span style="color: #48B6E2">
										{{ `${item.serverName} , ` }}
									</span>
								</router-link>
								<span class="list-item-platform">
									{{
										`${$t('notification.sourceName')} : ${item.sourceName} , ${$t(
											'notification.databaseName'
										)} : ${item.databaseName} , ${$t('notification.schemaName')} : ${
											item.schemaName
										} ,`
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
							<div class="unread-1zPaAXtSu"></div>
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
			</el-tab-pane>
			<el-tab-pane class="tab-item" :label="$t('notification.userNotice')" name="user" v-loading="loading">
				<div class="item-head">
					<span></span>
					<router-link to="/notification?type=user">
						<span class="item-text">
							{{ $t('notification.viewMore') }}
						</span>
					</router-link>
				</div>
				<ul class="notification-list">
					<li class="notification-item" v-for="record in userOperations" :key="record.id">
						<UserOperation :record="record"></UserOperation>
						<div class="item-time">{{ $moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
					</li>
				</ul>
			</el-tab-pane>
		</el-tabs>
	</el-popover>
</template>

<script>
import ws from '../../api/ws';
import UserOperation from './UserOperation';
import { TYPEMAP } from './tyepMap';
import { mapState } from 'vuex';

export default {
	components: {
		UserOperation
	},
	data() {
		return {
			loading: false,
			activeTab: 'system',
			listData: [],
			colorMap: {
				ERROR: 'red',
				WARN: 'orangered',
				INFO: '#48b6e2'
			},
			typeMap: TYPEMAP,
			systemMap: {
				dataFlow: this.$t('notification.dataFlow'),
				agent: this.$t('notification.manageSever'),
				inspect: this.$t('notification.inspect'),
				JobDDL: this.$t('notification.ddlDeal')
			},
			userOperations: []
		};
	},
	computed: mapState({
		unRead: state => state.notification.unRead
	}),
	created() {
		this.init();
		let node = {
			createTime: '2021-10-09T16:00:03.069Z',
			id: '6161bc83b7d93d01da3ae4ab',
			level: 'ERROR',
			msg: 'connectionInterrupted',
			serverName: '10.9.35.81',
			sourceId: '72d1323d-c8c1-472d-be4a-447b755fca46',
			system: 'agent'
		};
		for (let i = 1; i < 30; i++) {
			this.listData.push(node);
		}
	},
	methods: {
		init() {
			let msg = {
				type: 'notification'
			};
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				msg['userId'] = this.$cookie.get('user_id');
			}
			this.getUnReadNum();
			ws.on('notification', data => {
				if (data.data && data.data.length > 0) {
					this.listData.unshift(...data.data);
					this.getUnReadNum();
				}
				//格式化日期
				if (this.listData && this.listData.length > 0) {
					this.listData.map(item => {
						item['createTime'] = item.createTime
							? this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
							: '';
					});
				}
			});
			let int = setInterval(() => {
				if (ws.ws.readyState == 1) {
					ws.send(msg);
					clearInterval(int);
				}
			}, 2000);
			this.$root.$on('notificationUpdate', () => {
				ws.send(msg);
			});
		},
		getUnReadNum() {
			let where = {
				where: {
					read: false
				}
			};
			if (this.$cookie.get('isAdmin') == 0 && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			this.$api('notification')
				.count(where)
				.then(res => {
					if (res.data) {
						this.$store.commit('notification', {
							unRead: res.data.count
						});
					}
				});
		},
		handleRead(id) {
			this.$api('notification')
				.patch({ read: true, id: id })
				.then(res => {
					if (res.data) {
						this.listData = [];
						this.$root.$emit('notificationUpdate');
					}
				});
		},
		getLag(lag) {
			let r = '0s';
			if (lag) {
				let m = this.$moment.duration(lag, 'seconds');
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
		},
		tabHandler() {
			if (this.activeTab === 'user') {
				this.getUserOperations();
			}
		},
		getUserOperations() {
			this.loading = true;
			let filter = {
				order: 'createTime DESC',
				limit: 50,
				skip: 0,
				where: {
					type: 'userOperation'
				}
			};
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				filter.where.user_id = {
					like: this.$cookie.get('user_id')
				};
			}
			this.$api('UserLogs')
				.get({
					filter: JSON.stringify(filter)
				})
				.then(res => {
					this.userOperations = res.data || [];
				})
				.finally(() => {
					this.loading = false;
				});
		},
		toCenter() {
			if (this.$route.name === 'notification') {
				return;
			}
			this.$router.push({ name: 'notification' });
		}
	}
};
</script>
<style lang="less">
.notification-popover-wrap {
	> .el-tabs__content {
		padding: 0 !important;
	}
	.tab-item {
		margin-bottom: 1px;
	}
}
</style>
<style lang="less" scoped>
.notification-popover-wrap {
	margin: -15px;
	height: 440px;
	width: 440px;
	overflow: hidden;
	position: relative;
	.item-head {
		position: absolute;
		bottom: 0;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-pack: justify;
		-ms-flex-pack: justify;
		justify-content: space-between;
		font-size: 12px;
		height: 40px;
		line-height: 40px;
		padding: 0 25px;
		width: 100%;
		margin-left: -20px;
		background: #f1f1f1;
		border: 1px solid #dedee4;
		.item-head-text {
			display: inline-block;
			cursor: pointer;
			color: #666;
			padding-right: 35px;
			padding-left: 10px;
		}
		.item-text {
			display: inline-block;
			cursor: pointer;
			color: #666;
			padding-right: 20px;
		}
		background: rgba(241, 241, 241, 1);
		border: 1px solid rgba(222, 222, 228, 1);
	}
	.tab-item {
		.cuk-list {
			height: 362px;
			overflow-y: auto;
			font-size: 12px;
			margin-bottom: 39px;
			.list-item {
				position: relative;
				background: #fff;
				border-bottom: 1px solid #dedee4;
				padding: 0 5px 5px 0;
				cursor: pointer;
				.list-item-content {
					position: relative;
					height: 40px;
					line-height: 40px;
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
					background: #f81d22;
					border-radius: 50%;
				}
				.list-item-desc {
					color: #666;
					position: absolute;
					top: -5px;
					left: 30px;
					right: 20px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					span {
						font-size: 12px;
					}
				}
				.list-item-platform {
					color: #666;
				}
				.list-item-time {
					margin: 15px 0 0 17px;
					color: #aaa;
					font-size: 12px;
				}
			}
		}
		.notification-list {
			height: 362px;
			overflow-y: auto;
			box-sizing: border-box;
			margin-bottom: 39px;
			.notification-item {
				padding: 5px 20px 4px 20px;
				border-bottom: 1px solid #dedee4;
				font-size: 12px;
				color: #666;
				&:last-child {
					border: none;
				}
				.item-time {
					margin-top: 5px;
					color: #aaa;
					font-size: 12px;
				}
			}
		}
	}
}
</style>
