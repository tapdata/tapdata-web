<template>
	<div class="user-notification" v-loading="loading">
		<div class="header">
			<div class="title">{{ $t('notification.userNotice') }}</div>
			<div class="search-bar">
				<el-input
					clearable
					class="search-item"
					size="mini"
					v-model="search.keyword"
					:placeholder="$t('notification.placeholder.keyword')"
					@change="getData(1)"
				></el-input>
				<el-date-picker
					class="search-item"
					popper-class="user-notification-data-picker"
					style="width: 320px"
					size="mini"
					v-model="search.range"
					type="datetimerange"
					range-separator="至"
					:start-placeholder="$t('dataFlow.startTime')"
					:end-placeholder="$t('dataFlow.endTime')"
					@change="getData(1)"
				>
				</el-date-picker>
				<el-select
					clearable
					v-if="isAdmin"
					class="search-item"
					size="mini"
					v-model="search.userId"
					:placeholder="$t('notification.placeholder.user')"
					@change="getData(1)"
				>
					<el-option
						v-for="user in userOptions"
						:key="user.id"
						:value="user.id"
						:label="user.username"
					></el-option>
				</el-select>
			</div>
		</div>
		<ul class="list">
			<li class="item" v-for="record in list" :key="record._id">
				<UserOperation :record="record"></UserOperation>
				<span class="item-time">{{ $moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
			</li>
		</ul>
		<el-pagination
			class="pagination"
			background
			layout="prev, pager, next,sizes"
			:page-sizes="[20, 30, 50, 100]"
			:page-size.sync="page.size"
			:total="page.total"
			:current-page.sync="page.index"
			@current-change="getData"
			@size-change="getData()"
		>
		</el-pagination>
	</div>
</template>
<script>
import UserOperation from './UserOperation';
import { toRegExp } from '../../util/util';

export default {
	components: {
		UserOperation
	},
	data() {
		return {
			loading: false,
			isAdmin: parseInt(this.$cookie.get('isAdmin')),
			search: {
				keyword: '',
				range: [],
				userId: ''
			},
			page: {
				index: 1,
				size: 20,
				total: 0
			},
			list: [],
			userOptions: []
		};
	},
	created() {
		if (this.isAdmin) {
			this.getUsers();
		} else {
			this.search.userId = this.$cookie.get('user_id');
		}
		this.getData();
	},
	methods: {
		getUsers() {
			this.$api('users')
				.get()
				.then(res => {
					this.userOptions = res.data || [];
				});
		},
		getData(pageNum) {
			this.loading = true;
			let { keyword, range, userId } = this.search;
			let { size, index } = this.page;
			let current = pageNum || index;
			let where = {
				type: 'userOperation'
			};
			if (keyword && keyword.trim()) {
				where.parameter1 = { like: toRegExp(keyword), options: 'i' };
			}
			if (userId) {
				where.user_id = {
					like: userId
				};
			}
			if (range && range.length) {
				where.and = [
					{ createTime: { gte: range[0].toISOString() } },
					{ createTime: { lte: range[1].toISOString() } }
				];
			}
			let filter = {
				order: 'createTime DESC',
				limit: size,
				skip: (current - 1) * size,
				where: where
			};
			let UserLogs = this.$api('UserLogs');
			UserLogs.count({
				where
			}).then(res => {
				if (res.data) {
					this.page.total = res.data.count;
				}
			});
			UserLogs.get({
				filter: JSON.stringify(filter)
			})
				.then(res => {
					this.page.index = current;
					this.list = res.data || [];
				})
				.finally(() => {
					this.loading = false;
				});
		}
	}
};
</script>
<style lang="less">
.user-notification-data-picker .el-time-panel.el-popper {
	right: 0;
	left: unset;
}
</style>
<style lang="less" scoped>
.user-notification {
	padding-left: 20px;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	.header {
		padding: 20px 20px 20px 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		.title {
			line-height: 34px;
			font-size: 18px;
			font-weight: bold;
		}
		.search-bar {
			display: flex;
			align-items: center;
			.search-item {
				margin-left: 15px;
				width: 200px;
			}
		}
	}
	.list {
		flex: 1;
		overflow: auto;
		padding-right: 20px;
		.item {
			padding-left: 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 50px;
			border-bottom: 1px solid #f5f7fa;
			font-size: 12px;
			color: #202d40;
			.item-time {
				color: #202d40;
			}
		}
	}
	.pagination {
		text-align: right;
		padding: 10px 0 20px 0;
	}
}
</style>
