<template>
	<div class="notification">
		<div class="notification-main">
			<div class="notification-left-sidebar">
				<div class="title">{{ $t('notification.noticeCenter') }}</div>
				<ul>
					<li>
						<i class="iconfont icon-lingdang"></i>
						<span>{{ $t('notification.systemNotice') }}</span>
						<span class="unread" v-show="count > 0">{{ count }}</span>
					</li>
				</ul>
			</div>
			<div class="notification-right-list" v-loading="loading">
				<div class="notification-head">
					<div class="title">{{ $t('notification.systemNotice') }}</div>
					<div class="operation">
						<el-select
							v-model="search"
							placeholder="请选择消息类型"
							class="search"
							@change="getData()"
							clearable
							size="mini"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							>
							</el-option>
						</el-select>
						<span @click="handlePageRead()">{{ $t('notification.maskRead') }}</span>
						<span @click="handleAllRead()">{{ $t('notification.maskReadAll') }}</span>
						<!--						<span>通知设置</span>-->
					</div>
				</div>
				<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
					<el-tab-pane :label="$t('notification.allNotice')" name="first"></el-tab-pane>
					<el-tab-pane :label="$t('notification.unreadNotice')" name="second"></el-tab-pane>
				</el-tabs>
				<ul class="cuk-list clearfix cuk-list-type-block">
					<li class="list-item" v-for="item in listData" :key="item.id" @click="handleRead(item.id)">
						<div class="list-item-content">
							<div class="unread-1zPaAXtSu" v-show="!item.read"></div>
							<div class="list-item-desc">
								<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
								<span>{{
									item.system === 'dataFlow'
										? $t('notification.dataFlow')
										: $t('notification.manageSever')
								}}</span>
								<span>
									<router-link
										:to="
											item.system === 'dataFlow'
												? `/job?id=${item.sourceId}&isMoniting=true`
												: '/clusterManagement'
										"
									>
										<span style="color: #48B6E2">
											{{ item.serverName }}
										</span>
									</router-link>
								</span>
								<span>{{ typeMap[item.msg] }}</span>
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
		</div>
	</div>
</template>

<script>
import factory from '../../api/factory';
const notification = factory('notification');
import * as moment from 'moment';
import { TYPEMAP } from './tyepMap';

export default {
	name: 'list',
	data() {
		return {
			activeName: 'first',
			listData: [],
			read: true,
			loading: false,
			search: '',
			currentPage: 1,
			pagesize: 20,
			total: '',
			colorMap: {
				error: 'red',
				warn: 'orangered',
				info: 'blue'
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
			typeMap: TYPEMAP,
			count: ''
		};
	},
	mounted() {
		this.getData();
		this.getUnreadNum(); //未读消息数量
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
			if (this.$cookie.get('isAdmin') === 0) {
				where.filter.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			this.loading = true;
			notification.get(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.loading = false;
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
				} else {
					this.loading = false;
				}
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
			if (this.$cookie.get('isAdmin') === 0) {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			notification.count(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.total = res.data.count;
					} else {
						this.loading = false;
					}
				}
			});
		},
		getUnreadNum() {
			let where = {
				where: {
					read: false
				}
			};
			if (this.$cookie.get('isAdmin') === 0) {
				where.where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			notification.count(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.count = res.data.count;
					}
				}
			});
		},
		handleRead(id) {
			notification.patch({ read: true, id: id }).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.getUnreadNum(); //未读消息数量
						this.getData();
						this.$root.$emit('notificationUpdate');
					}
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
			notification.upsertWithWhere(where, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.read = true;
						this.getUnreadNum(); //未读消息数量
						this.getData();
						this.$root.$emit('notificationUpdate');
					}
				}
			});
		},
		handleAllRead() {
			let where = {};
			if (this.$cookie.get('isAdmin') === 0) {
				where['userId'] = { regexp: `^${this.$cookie.get('user_id')}$` };
			}
			let data = {
				read: true
			};
			where = JSON.stringify(where);
			notification.readAll(where, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.read = true;
						this.getUnreadNum(); //未读消息数量
						this.getData();
						this.$root.$emit('notificationUpdate');
					}
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
		}
	}
};
</script>

<style scoped lang="less">
.notification {
	height: 100%;
	font-size: 12px;
	.unread {
		width: 25px;
		height: 17px;
		display: inline-block;
		line-height: 17px;
		white-space: nowrap;
		cursor: pointer;
		background: red;
		color: #fff;
		-webkit-appearance: none;
		text-align: center;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		outline: 0;
		margin: 0;
		-webkit-transition: 0.1s;
		transition: 0.1s;
		font-weight: 500;
		padding: 0px 5px;
		font-size: 12px;
		border-radius: 4px;
		float: right;
		margin-top: 15px;
		margin-right: 15px;
	}
}
.notification-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	color: #48b6e2;
	padding: 20px;
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
.notification-main {
	display: flex;
	justify-content: space-between;
	height: 100%;
	.notification-left-sidebar {
		background: rgba(250, 250, 250, 1);
		border: 1px solid rgba(230, 230, 232, 1);
		width: 250px;
		.title {
			height: 14px;
			font-size: 14px;
			font-weight: bold;
			color: rgba(51, 51, 51, 1);
			line-height: 34px;
			margin: 30px 20px;
		}
		ul li {
			height: 44px;
			font-size: 12px;
			font-weight: 400;
			color: rgba(102, 102, 102, 1);
			line-height: 44px;
			background: rgba(238, 238, 238, 1);
			padding-left: 20px;
			cursor: pointer;
		}
	}
	.notification-right-list {
		margin-left: 20px;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
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
				background: #f81d22;
				border-radius: 50%;
			}
			.list-item-desc {
				color: #202d40;
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
				margin: 0 20px;
				color: #202d40;
				font-size: 12px;
			}
		}
	}
}
.pagination {
	float: right;
	margin-top: 10px;
}
</style>
<style lang="less">
.notification {
	.el-tabs__item {
		height: 32px;
		line-height: 32px;
		font-size: 12px;
	}
}
</style>
