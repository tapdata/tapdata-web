<template>
	<section class="dashbord-wrapper">
		<div v-for="item in regions" :key="item.poolId" class="agent-item">
			<div class="agent-item__title">
				<span>{{ item.poolName }}</span>
				<ElLink type="primary">
					<i class="el-icon-shopping-cart-2" @click="toPurchase()"></i>
				</ElLink>
			</div>
			<div v-for="zone in item.zones" :key="zone.id" class="agent-item__zone">
				<div class="agent-item__total">
					<div>{{ zone.name }}实例</div>
					<ElLink
						class="agent-item__total-num mt-1"
						type="primary"
						@click="toInstance({ region: item.poolId, zone: zone.id })"
						>{{ zone.total }}</ElLink
					>
				</div>
				<div class="agent-item__status">
					<span
						class="agent-item__status-item"
						style="margin-right: 10px"
						v-for="(value, key) in zone.statusMap"
						:key="key"
					>
						<span>{{ key }}：</span>
						<ElLink
							:class="['agent-item__status-num', { 'is-danger': ['Error', 'Freeze'].includes(key) }]"
							type="primary"
							@click="toInstance({ region: item.poolId, status: key, zone: zone.id })"
							>{{ value }}</ElLink
						>
					</span>
				</div>
			</div>
			<div v-if="!item.zones || !item.zones.length" class="agent-item__empty">
				<i class="el-icon-folder-opened"></i>
				暂无实例
			</div>
		</div>
		<!-- 兼容chrome瀑布流布局 请勿删除	-->
		<div></div>
	</section>
</template>

<script>
import { INSTANCE_STATUS_MAP } from '../../const'
export default {
	data() {
		return {
			loading: false,
			regions: null,
			statusMap: INSTANCE_STATUS_MAP
		}
	},
	created() {
		this.getRegionStatus()
	},
	methods: {
		getRegionStatus() {
			this.$axios.get('api/tcm/agent/regionZoneStatusCount').then(data => {
				this.getRegion(data)
			})
		},
		getRegion(regionMap) {
			let { poolList } = window.__REGION__
			let statusList = Object.keys(INSTANCE_STATUS_MAP)
			let list = []
			poolList.forEach(item => {
				let zoneMap = regionMap[item.poolId]
				if (zoneMap) {
					let zoneInfo = item.zoneInfo
					let zones = []
					zoneInfo.forEach(zone => {
						let statusMap = zoneMap[zone.zoneCode]
						if (statusMap) {
							let total = 0
							let map = {}
							statusList.forEach(s => {
								let num = statusMap[s] || 0
								total += num
								if (num) {
									let n = map[INSTANCE_STATUS_MAP[s].text] || 0
									map[INSTANCE_STATUS_MAP[s].text] = n + num
								}
							})
							zones.push({
								id: zone.zoneCode,
								name: zone.zoneName,
								total: total,
								statusMap: map
							})
						}
					})
					item.zones = zones
				}
				if (item.zones && item.zones.length) {
					list.unshift(item)
				} else {
					list.push(item)
				}
			})
			this.regions = list
		},
		toPurchase() {
			window.open(process.env.VUE_APP_BASE_URL + '/', '_blank')
		},
		toInstance(query) {
			let status = query.status
			if (status) {
				for (let key in INSTANCE_STATUS_MAP) {
					let item = INSTANCE_STATUS_MAP[key]
					if (item.text === status) {
						status = key
						break
					}
				}
			}
			this.$router.push({
				name: 'Instance',
				query: {
					region: query.region,
					zone: query.zone,
					status
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.dashbord-wrapper {
	width: 100%;
	columns: 2;
	column-gap: 10px;
	.agent-item {
		margin-bottom: 10px;
		padding: 12px;
		background: #fff;
		border-radius: 2px;
		break-inside: avoid;
		overflow: auto;
	}
	.agent-item__title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 10px;
		line-height: 40px;
		background: #f4f5f7;
		border-radius: 2px;
		.el-icon-shopping-cart-2 {
			font-size: 14px;
			color: map-get($color, primary);
		}
	}
	.agent-item__zone {
		padding: 20px;
		display: flex;
		text-align: center;
		border-bottom: 1px solid map-get($borderColor, normal);
		&:last-child {
			border: none;
		}
	}
	.agent-item__total {
		flex: 1;
		border-right: 1px solid map-get($borderColor, normal);
	}
	.agent-item__total-num {
		padding-bottom: 10px;
		line-height: 40px;
		font-size: 28px;
	}
	.agent-item__status {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.agent-item__status-item {
		display: flex;
		align-items: center;
	}
	.agent-item__status-num {
		color: map-get($color, primary);
	}
	.is-danger {
		color: map-get($color, danger);
	}
	.agent-item__empty {
		padding: 40px 0;
		text-align: center;
		color: map-get($fontColor, light);
	}
}
</style>
