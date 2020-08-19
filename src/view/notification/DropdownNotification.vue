<template>
	<ul class="cuk-list clearfix cuk-list-type-block">
		<li class="item-head">
			<span>{{ $t('notification.notice') }}</span>
			<span>{{ $t('notification.viewMore') }}</span>
		</li>
		<li class="list-item">
			<div class="list-item-content">
				<div class="unread-1zPaAXtSu"></div>
				<div class="list-item-desc">
					<span>error</span>
					<span>任务</span>
					<span>反反复复</span>
					<span>ㄸ</span>
				</div>
				<div class="list-item-time">
					<span>2003/3/3</span>
				</div>
			</div>
		</li>
		<li class="list-item">
			<div class="list-item-content">
				<div class="unread-1zPaAXtSu"></div>
				<div class="list-item-desc">
					<span>error</span>
					<span>任务</span>
					<span>反反复复</span>
					<span>ㄸ</span>
				</div>
				<div class="list-item-time">
					<span>2003/3/3</span>
				</div>
			</div>
		</li>
	</ul>
</template>

<script>
import ws from '../../api/ws';

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
					system: 'dataflow',
					read: false,
					time: '',
					msg: '停止',
					title: '',
					serverName: '111111111111',
					sourceId: ''
				}
			]
		};
	},
	mounted() {
		let msg = {
			type: 'notification',
			userId: ''
		};
		ws.on('notification', data => {
			this.listData.unshift(data.data);
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
