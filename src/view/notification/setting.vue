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
				</div>
				<section>
					邮件通知为全局邮件通知设置，针对某个指定的设置（例如任务的专属设置）可以在其任务详情页进行专门的邮件通知设置，其优先级高于此处的全局邮件通知设置
				</section>
				<section>
					<span class="block"></span><span>通知运行通知</span>
					<ul>
						<li>
							<span>{{ $t('notification.systemNotice') }}</span>
							<el-checkbox v-model="checked1">系统通知</el-checkbox>
							<el-checkbox v-model="checked1">邮件通知</el-checkbox>
						</li>
					</ul>
				</section>
			</div>
		</div>
	</div>
</template>

<script>
import factory from '../../api/factory';
const notification = factory('notification');
import * as moment from 'moment';
import { notificationMAP } from './tyepMap';

export default {
	name: 'list',
	data() {
		return {
			notificationMAP: notificationMAP
		};
	},
	created() {},
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
			if (this.$cookie.get('isAdmin') == 0) {
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
		}
	}
};
</script>

<style scoped lang="less">
@unreadColor: #ee5353;
.notification {
	height: 100%;
	font-size: 12px;
	.unread {
		min-width: 25px;
		height: 17px;
		display: inline-block;
		line-height: 17px;
		white-space: nowrap;
		cursor: pointer;
		background: @unreadColor;
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
				color: #202d40;
				font-size: 12px;
			}
			&:hover {
				background: #fafafa;
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
