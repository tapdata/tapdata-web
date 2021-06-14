<template>
	<span class="td-status-tag">
		<ElTag :type="statusObj.type" v-if="type === 'tag'">{{ statusObj.text }}</ElTag>
		<span style="display:flex;align-items:center;" v-else>
			<VIcon v-if="statusObj.icon === 'loading'" style="font-size: 18px;margin: 0 4px;" color="#10C038">loading</VIcon>
			<i
				v-if="statusObj.icon === 'running'"
				class="iconfont td-status-tag__icon td-icon-yunhangzhong color-success"
			></i>
			<i v-if="statusObj.icon === 'warning'" class="iconfont td-status-tag__icon td-icon-yichang color-warning"></i>
			<i v-if="statusObj.icon === 'waiting'" class="iconfont td-status-tag__icon td-icon-daiqidong color-primary"></i>
			<span class="td-status-tag__text">{{ statusObj.text }}</span>
		</span>
	</span>
</template>

<script>
import VIcon from '@/components/VIcon'
import { INSTANCE_STATUS_MAP, TASK_STATUS_MAP } from '../const'
export default {
	components: { VIcon },
	props: {
		type: {
			type: String,
			default: 'tag'
		},
		status: {
			type: String
		},
		target: {
			type: String,
			default: 'instance'
		}
	},
	computed: {
		map() {
			return { instance: INSTANCE_STATUS_MAP, task: TASK_STATUS_MAP }[this.target]
		},
		statusObj() {
			return this.map[this.status]
		}
	}
}
</script>

<style lang="scss">
.td-status-tag {
	display: inline-block;
	vertical-align: middle;
}
.td-status-tag__icon {
	font-size: 14px;
	display: inline-block;
	width: 26px;
	height: 26px;
	line-height: 26px;
	text-align: center;
	&.td-icon-yunhangzhong {
		color: map-get($color, success);
	}
	&.td-icon-yichang {
		color: map-get($color, warning);
	}
}
.td-status-tag__text {
	display: inline-block;
	height: 26px;
	line-height: 26px;
}
</style>
