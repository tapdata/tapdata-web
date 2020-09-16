<template>
	<div class="notification" v-loading="loading">
		<div class="notification-main">
			<subNav></subNav>
			<div class="notification-right-list">
				<div class="notification-head">
					<div class="title">{{ $t('notification.systemNotice') }}</div>
				</div>
				<section>
					{{ $t('notification.tip') }}
				</section>
				<section class="run-notification" v-show="runNotification && runNotification.length > 0">
					<span class="block"></span><span class="title">{{ $t('notification.jobOperationNotice') }}</span>
					<ul>
						<li v-for="(item, index) in runNotification" :key="index">
							<span class="label">{{ notificationMAP[item.label] }}</span>
							<el-checkbox class="notice" v-model="item.notice">{{
								$t('notification.systemNotice')
							}}</el-checkbox>
							<el-checkbox class="email" v-model="item.email">{{
								$t('notification.emailNotice')
							}}</el-checkbox>
							<span class="sort-label" v-if="item.lagTime">{{ notificationMAP[item.lagTime] }}</span>
							<span v-if="item.label === 'CDCLagTime'">
								<el-input
									v-model="item.lagTimeInterval"
									class="item-input"
									size="mini"
									onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
									onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
								>
									<el-select
										v-model="item.lagTimeUtil"
										slot="append"
										placeholder="请选择"
										class="input-with-select"
									>
										<el-option label="hour" value="hour"></el-option>
										<el-option label="second" value="second"></el-option>
									</el-select>
								</el-input>
							</span>
							<span class="sort-label" v-if="item.noticeInterval && item.email">{{
								notificationMAP[item.noticeInterval]
							}}</span>
							<span v-if="item.label === 'CDCLagTime' && item.email">
								<el-input
									v-model="item.noticeIntervalInterval"
									class="item-input"
									size="mini"
									onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
									onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
								>
									<el-select
										v-model="item.noticeIntervalUtil"
										slot="append"
										placeholder="请选择"
										class="input-with-select"
									>
										<el-option label="hour" value="hour"></el-option>
										<el-option label="second" value="second"></el-option>
									</el-select>
								</el-input>
							</span>
							<span v-if="item.label === 'jobEncounterError' && item.email">
								<el-input
									v-model="item.Interval"
									class="item-input"
									size="mini"
									onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
									onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
								>
									<el-select
										v-model="item.util"
										slot="append"
										placeholder="请选择"
										class="input-with-select"
									>
										<el-option label="hour" value="hour"></el-option>
										<el-option label="second" value="second"></el-option>
									</el-select>
								</el-input>
							</span>
						</li>
					</ul>
				</section>
				<section class="run-notification" v-show="systemNotification && systemNotification.length > 0">
					<span class="block"></span><span class="title">{{ $t('notification.systemSetting') }}</span>
					<ul>
						<li v-for="(item, index) in systemNotification" :key="index">
							<span class="label">{{ notificationMAP[item.label] }}</span>
							<el-checkbox class="notice" v-model="item.notice">{{
								$t('notification.systemNotice')
							}}</el-checkbox>
							<el-checkbox class="email" v-model="item.email">{{
								$t('notification.emailNotice')
							}}</el-checkbox>
						</li>
					</ul>
				</section>
				<section class="run-notification" v-show="agentNotification && agentNotification.length > 0">
					<span class="block"></span><span class="title">{{ $t('notification.agentNotice') }}</span>
					<ul>
						<li v-for="(item, index) in agentNotification" :key="index">
							<span class="label">{{ notificationMAP[item.label] }}</span>
							<el-checkbox class="notice" v-model="item.notice">{{
								$t('notification.systemNotice')
							}}</el-checkbox>
							<el-checkbox class="email" v-model="item.email">{{
								$t('notification.emailNotice')
							}}</el-checkbox>
						</li>
					</ul>
				</section>
				<el-button
					class="btn"
					@click="submit"
					size="mini"
					type="primary"
					:disabled="!runNotification || !systemNotification || !agentNotification"
					>保存设置</el-button
				>
			</div>
		</div>
	</div>
</template>

<script>
import factory from '../../api/factory';
const Setting = factory('Setting');
import { notificationMAP } from './tyepMap';
import subNav from '../../components/subNav';

export default {
	name: 'list',
	components: { subNav },
	data() {
		return {
			notificationMAP: notificationMAP,
			runNotification: [],
			systemNotification: [],
			agentNotification: [],
			loading: false
		};
	},
	created() {
		this.getData();
	},
	methods: {
		getData() {
			let where = {
				filter: {
					where: {
						id: '76'
					}
				}
			};
			this.loading = true;
			Setting.findOne(where)
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data.value) {
							let value = JSON.parse(res.data.value);
							this.runNotification = value.runNotification;
							this.systemNotification = value.systemNotification;
							this.agentNotification = value.agentNotification;
						}
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		submit() {
			let where = {
				id: '76'
			};
			let data = {
				value: JSON.stringify({
					runNotification: this.runNotification,
					systemNotification: this.systemNotification,
					agentNotification: this.agentNotification
				})
			};
			Setting.update(where, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.loading = false;
					this.$message.success('submit OK');
				} else {
					this.loading = false;
				}
			});
		}
	}
};
</script>

<style scoped lang="less">
@unreadColor: #ee5353;
.notification {
	height: 100%;
	font-size: 12px;
}
.btn {
	width: 100px;
	margin-top: 10px;
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
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		margin-left: 20px;
		.block {
			width: 11px;
			height: 14px;
			background: #48b6e2;
			display: inline-block;
			margin-right: 10px;
		}
		.run-notification {
			margin-top: 15px;
			.title {
				font-size: 16px;
				font-weight: bold;
				color: #333333;
				line-height: 32px;
			}
			ul {
				margin-left: 20px;
			}
			ul li {
				margin-bottom: 10px;
				.label {
					display: inline-block;
					width: 30%;
				}
				.sort-label {
					display: inline-block;
					width: 100px;
					margin-left: 40px;
				}
				.item-input {
					width: 200px;
				}
			}
			.input-with-select {
				width: 90px;
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
