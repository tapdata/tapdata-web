<template>
	<ul class="cuk-list clearfix cuk-list-type-block">
		<li class="item-head">
			<span>{{ $t('notification.notice') }}</span>
			<span>{{ $t('notification.viewMore') }}</span>
		</li>
		<li class="list-item" v-for="item in listData" :key="item.level" @click="handleRead(item.id)">
			<div class="list-item-content">
				<div class="unread-1zPaAXtSu"></div>
				<div class="list-item-desc">
					<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
					<span>{{ item.system === 'dataFlow' ? '任务' : '管理端' }}</span>
					<span>
						<router-link to="/foo">
							<span style="color: #48B6E2">
								{{ item.serverName }}
							</span>
						</router-link>
					</span>
					<span>{{ item.msg }}</span>
				</div>
				<div class="list-item-time">
					<span>{{ item.time }}</span>
				</div>
			</div>
		</li>
	</ul>
</template>

<script>
import ws from '../../api/ws';
import * as moment from 'moment';

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
			listData: [
				{
					userName: '',
					email: '',
					level: 'error',
					system: 'dataFlow',
					read: false,
					time: '',
					msg: '停止',
					title: '',
					serverName: '111111111111',
					sourceId: ''
				}
			],
			colorMap: {
				error: 'red',
				warn: 'orangered',
				info: 'blue'
			}
		};
	},
	mounted() {
		let msg = {
			type: 'notification',
			userId: this.$cookie.get('user_id')
		};
		ws.on('notification', data => {
			//this.listData.unshift(data.data);
			this.listData = data.data;

			//格式化日期
			if (this.listData && this.listData.length > 0) {
				this.listData.map(item => {
					item['time'] = item.time ? moment(item.time).format('YYYY-MM-DD HH:mm:ss') : '';
				});
			}
		});
		let int = setInterval(() => {
			if (ws.ws.readyState == 1) {
				ws.send(msg);
				clearInterval(int);
			}
		}, 2000);
	}
};
</script>

<style scoped lang="less">
.cuk-list {
	width: 500px;
	height: 100%;
	.item-head {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		height: 40px;
		line-height: 40px;
		padding: 0 20px;
		/*background: rgba(241, 241, 241, 1);*/
		/*border: 1px solid rgba(222, 222, 228, 1);*/
	}
	.list-item {
		position: relative;
		background: #fff;
		border-bottom: 1px solid #f5f7fa;
		padding: 0 20px 10px 20px;
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
			top: -5px;
			left: 30px;
			right: 120px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			span {
				font-size: 12px;
			}
		}
		.list-item-time {
			margin: 20px;
			color: #202d40;
			font-size: 12px;
		}
	}
}
</style>
