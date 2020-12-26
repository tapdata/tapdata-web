<template>
	<section class="milestone-wrap">
		<ul class="milestone-list">
			<li class="milestone-item" v-for="(item, index) in list" :key="index">
				<div class="label">{{ item.label }}</div>
				<div :class="'status ' + item.status">
					<i class="milestone-icon el-icon-success"></i>
					<i class="milestone-icon el-icon-error"></i>
					<i class="milestone-icon el-icon-loading"></i>
					<span>{{ statusMap[item.status] }}</span>
				</div>
				<div class="from-now">{{ item.fromNow }}</div>
			</li>
		</ul>
	</section>
</template>

<script>
// import factory from '../../api/factory';
// const dataFlowsAPI = factory('DataFlows');

export default {
	props: {
		dataFlow: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			list: [],
			map: {
				INIT_DATAFLOW: '【前期准备】解析DAG路径创建子任务',
				CONNECT_TO_SOURCE: '【前期准备】连接源端数据库',
				CONNECT_TO_TARGET: '【前期准备】连接目标端数据库',
				INIT_CONNECTOR: '【前期准备】扫描源端信息，初始化配置数据',
				INIT_TRANSFORMER: '【前期准备】初始化源端处理器',
				READ_SOURCE_DDL: '【前期准备】读取源端DDL信息（数据迁移）',
				DROP_TARGET_TABLE: '【前期准备】删除目标端数据表（任务第一次执行或者重置后执行）',
				CLEAR_TARGET_DATA: '【前期准备】清空目标表数据（任务第一次执行或者重置后执行）',
				CREATE_TARGET_TABLE: '【前期准备】自动创建目标表 （任务第一次执行或者重置后执行）',
				CREATE_TARGET_INDEX: '【前期准备】创建目标表索引（任务第一次执行或者重置后执行）',
				CREATE_TARGET_VIEW: '【前期准备】自动创建目标端视图（任务第一次执行或者重置后执行）',
				CREATE_TARGET_FUNCTION: '【前期准备】自动创建目标端函数（任务第一次执行或者重置后执行）',
				CREATE_TARGET_PROCEDURE: '【前期准备】自动创建目标端存储过程（任务第一次执行或者重置后执行）',
				READ_SNAPSHOT: '【数据传输】全量读取源端数据快照（初始化，初始化+增量）',
				WRITE_SNAPSHOT: '【数据传输】目标端全量写入数据快照（初始化，初始化+增量）',
				READ_CDC_EVENT: '【数据传输】源端进入增量读取模式（增量，初始化+增量）',
				WRITE_CDC_EVENT: '【数据传输】任务进入增量写入模式（增量，初始化+增量）'
			},
			statusMap: {
				waiting: '待执行',
				running: '进行中',
				error: '错误',
				finish: '已完成'
			}
		};
	},
	created() {
		this.getData();
	},
	methods: {
		getData() {
			let milestones = this.dataFlow.milestones;
			if (milestones && milestones.length) {
				this.list = milestones.map(m => {
					let time = m.status === 'running' ? m.start : m.end;
					if (time) {
						time = this.$moment(time)
							.locale('zh-cn')
							.fromNow();
					}
					return {
						label: this.map[m.code],
						status: m.status,
						fromNow: time || '-'
					};
				});
			}
		}
	}
};
</script>

<style lang="less" scoped>
.milestone-wrap {
	.milestone-list {
		padding: 7px 0;
		display: flex;
		flex-direction: column;
		.milestone-item {
			margin: 4px 13px;
			display: flex;
			align-items: center;
			height: 40px;
			line-height: 40px;
			background: #f2f2f2;
			border-radius: 3px;
			color: #666;
			font-size: 12px;
			.label {
				flex: 1;
			}
			.status,
			.from-now {
				width: 100px;
				color: #999;
			}
			.status {
				position: relative;
				.milestone-icon {
					position: absolute;
					left: 10px;
					left: -21px;
					top: 50%;
					transform: translate(0, -50%);

					display: none;
				}
				&.running {
					color: #48b6e2;
					.el-icon-loading {
						display: inline-block;
					}
				}
				&.error {
					color: #f56c6c;
					.el-icon-error {
						display: inline-block;
					}
				}
				&.finish {
					color: #67c23a;
					.el-icon-success {
						display: inline-block;
					}
				}
			}
		}
	}
}
</style>
