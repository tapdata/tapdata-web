<template>
	<section class="agent-details-wrap" v-loading="loading">
		<template v-if="agent">
			<div class="panel header">
				<InlineInput class="agent-name" :value="agent.name" @save="updateName($event, $route.params.id)"></InlineInput>
				<div class="agent-status" style="margin-top: 10px">
					<StatusTag :status="agent.status"></StatusTag>
					<span class="lignt" style="margin-left: 5px">同步任务数：</span>
					<span>{{ agent.metric ? agent.metric.runningTaskNum : 0 }}</span>
					<!-- <ElLink class="ml-2" type="primary" @click="toDataflow">查看任务</ElLink> -->
				</div>
			</div>
			<div class="panel mt-5">
				<div class="title">
					<i class="el-icon-notebook-2"></i>
					<span style="margin-left: 1px">实例信息</span>
				</div>
				<ul class="info">
					<li class="info-item">
						<div class="label">实例ID</div>
						<div class="value">{{ agent.id }}</div>
					</li>
					<li class="info-item">
						<div class="label">地域及可用区</div>
						<div class="value">
							{{ agent.regionFmt }}
						</div>
					</li>
					<li class="info-item">
						<div class="label">同步拓扑</div>
						<div class="value">{{ agent.topology }}</div>
					</li>
					<li class="info-item">
						<div class="label">实例规格</div>
						<div class="value">
							{{ comSpecType }}
						</div>
					</li>
					<li class="info-item">
						<div class="label">版本</div>
						<div class="value">
							{{ agent.spec ? agent.spec.version : '' }}
						</div>
					</li>
				</ul>
			</div>
			<div class="panel mt-20">
				<div class="title">
					<i class="el-icon-money"></i>
					<span style="margin-left: 1px">计费信息</span>
				</div>
				<ul class="info">
					<li class="info-item">
						<div class="label">计费模式</div>
						<div class="value">
							{{ chargeMap[agent.orderInfo.chargingMode + ',' + agent.orderInfo.periodType] }}
						</div>
					</li>
					<li class="info-item" v-if="isMonth">
						<div class="label">订购时长</div>
						<div class="value">{{ agent.orderInfo.duration }}个月</div>
					</li>
					<li class="info-item">
						<div class="label">创建时间</div>
						<div class="value">
							{{ $moment(agent.createAt).format('YYYY-MM-DD HH:mm:ss') }}
						</div>
					</li>
					<li class="info-item" v-if="isInternet && isMonth">
						<div class="label">到期时间</div>
						<div class="value">
							{{ agent.endTimeStr }}
						</div>
					</li>
				</ul>
			</div>
			<ChangeInstance :region="agent.region" :zone="agent.zone" :dialogVisible.sync="dialogVisible"></ChangeInstance>
		</template>
	</section>
</template>

<script>
import { SPEC_MAP, CHARGE_MAP } from '../../const'
import { formatAgent } from '../../util'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import ChangeInstance from '../../components/ChangeInstance'
export default {
	components: {
		InlineInput,
		StatusTag,
		ChangeInstance
	},
	data() {
		return {
			isInternet: window.__USER_INFO__.isInternet,
			agent: null,
			specMap: SPEC_MAP,
			chargeMap: CHARGE_MAP,
			loading: false,
			dialogVisible: false
		}
	},
	computed: {
		isMonth() {
			return this.agent.orderInfo.periodType === 'month'
		},
		comSpecType() {
			return this.specMap[this.agent?.spec?.specType]
		}
	},
	created() {
		this.fetch()
	},
	methods: {
		fetch() {
			this.loading = true
			this.$axios
				.get('api/tcm/agent/' + this.$route.params.id)
				.then(data => {
					this.agent = formatAgent(data)
				})
				.finally(() => {
					this.loading = false
				})
		},
		updateName(val, id) {
			this.$axios
				.post('api/tcm/agent', {
					id,
					name: val
				})
				.then(data => {
					this.$message.success('修改成功')
					this.fetch()
				})
		},
		toModify() {
			let item = this.agent
			if (item.modifyTips) {
				return this.$alert(item.modifyTips, {
					type: 'warning',
					customClass: 'el-message-box--alert'
				})
			}
			location.href = process.env.VUE_APP_BASE_URL + '/#/modify/' + item.id
		},
		//打开切换版本
		handleOpen() {
			this.dialogVisible = true
		}
		// toDataflow() {
		// 	this.$router.push({
		// 		name: 'Dataflow'
		// 	});
		// }
	}
}
</script>

<style lang="scss" scoped>
.agent-details-wrap {
	height: 100%;
	.panel {
		position: relative;
		background: #fff;
		border-radius: 2px;
		padding: 20px;
		.title {
			font-size: 14px;
		}
		.changeAgent {
			float: right;
			margin-right: 10px;
		}
		.info {
			display: flex;
			flex-wrap: wrap;
			.info-item {
				margin-top: 20px;
				display: flex;
				width: 30%;
				.label {
					width: 75px;
					text-align: right;
					color: map-get($fontColor, slight);
				}
				.value {
					margin-left: 20px;
				}
			}
		}
	}
	.header {
		border-left: 3px solid map-get($color, primary);
		.lignt {
			color: map-get($fontColor, slight);
		}
		.agent-name {
			display: block;
			font-size: 20px;
			font-weight: 650;
		}
		.agent-status {
			display: flex;
			align-items: center;
		}
	}
	.btn-create,
	.btn-change {
		position: absolute;
		right: 20px;
		top: 20px;
	}
}
</style>
