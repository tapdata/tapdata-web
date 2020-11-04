<template>
	<div>
		<div class="item-head">
			<span>
				<router-link to="/notification/setting">
					<span style="color: #48B6E2">
						{{ $t('notification.setting') }}
					</span>
				</router-link>
			</span>
			<span class="item-head-text">
				<router-link to="/notification">
					<span style="color: #48B6E2">
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
	</div>
</template>

<script>
import ws from '../../api/ws';
import * as moment from 'moment';
import { TYPEMAP } from './tyepMap';
import factory from '../../api/factory';
const notification = factory('notification');

export default {
	name: 'notification',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		}
	},
	data() {
		return {
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
			}
		};
	},
	created() {
		let msg = {
			type: 'notification'
		};
		if (this.$cookie.get('isAdmin') == 0) {
			msg['userId'] = this.$cookie.get('user_id');
		}
		this.getUnreadNum();
		ws.on('notification', data => {
			if (data.data && data.data.length > 0) {
				this.listData.unshift(...data.data);
				this.getUnreadNum();
			}
			//格式化日期
			if (this.listData && this.listData.length > 0) {
				this.listData.map(item => {
					item['createTime'] = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
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
	methods: {
		getUnreadNum() {
			let where = {
				where: {
					read: false
				}
			};
			if (this.$cookie.get('isAdmin') == 0) {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			notification.count(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.$emit('unread', res.data.count);
						//this.$root.$emit('notificationUpdate');
					}
				}
			});
		},
		handleRead(id) {
			notification.patch({ read: true, id: id }).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.listData = [];
						this.$root.$emit('notificationUpdate');
					}
				}
			});
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
.item-head {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	height: 40px;
	line-height: 40px;
	padding: 0 20px;
	.item-head-text {
		cursor: pointer;
		color: #48b6e2;
	}
	/*background: rgba(241, 241, 241, 1);*/
	/*border: 1px solid rgba(222, 222, 228, 1);*/
}
.cuk-list {
	width: 360px;
	height: 600px;
	overflow: auto;
	font-size: 12px;
	.list-item {
		position: relative;
		background: #fff;
		border-bottom: 1px solid #dedee4;
		padding: 0 5px 5px 20px;
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
			color: #202d40;
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
		.list-item-time {
			margin: 15px 0 0 17px;
			color: #aaa;
			font-size: 12px;
		}
	}
}
</style>
