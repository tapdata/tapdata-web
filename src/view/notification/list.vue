<template>
	<div class="notification">
		<div class="notification-head">
			<h3>系统通知</h3>
			<div>
				<el-input class="search"></el-input>
				<span>标记本页为已读</span>
				<span>标记全部为已读</span>
			</div>
		</div>
		<div class="notification-main">
			<div class="notification-left-sidebar">
				<h2>通知中心</h2>
				<ul>
					<li>
						<i class="iconfont icon-icon-lingdang"></i>
						<span>系统通知</span>
					</li>
				</ul>
			</div>
			<div class="notification-right-list">
				<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
					<el-tab-pane label="全部通知" name="first"></el-tab-pane>
					<el-tab-pane label="未读消息" name="second"></el-tab-pane>
				</el-tabs>
				<ul class="cuk-list clearfix cuk-list-type-block">
					<li class="list-item" v-for="item in listData" :key="item.level">
						<div class="list-item-content">
							<div class="unread-1zPaAXtSu"></div>
							<div class="list-item-desc">
								<span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
								<span>{{ item.serverName }}</span>
								<span>{{ item.msg }}</span>
							</div>
							<div class="list-item-time">
								<span>{{ item.time }}</span>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'list',
	data() {
		return {
			listData: [
				{
					userName: '',
					eamil: '',
					level: 'error',
					system: 'dataflow',
					read: false,
					time: '',
					msg: '停止',
					title: '',
					serverName: '111111111111',
					sourceId: ''
				}
			],
			colorMap: {
				error: 'orangered',
				server: 'blue'
			}
		};
	}
};
</script>

<style scoped lang="less">
.notification {
	height: 100%;
}
.notification-head {
	display: flex;
	justify-content: space-between;
	.search {
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
		width: 20%;
	}
	.notification-right-list {
		width: 80%;
		ul.cuk-list {
			list-style: none;
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
</style>
