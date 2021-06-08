<template>
	<div v-if="headerType === 'drs'">
		<orderHeader v-if="$route.meta.isPurchase" :env="env" />
		<consoleHeader v-else class="console-header" :env="env"></consoleHeader>
	</div>
	<Header v-else ref="dfsHeader"></Header>
</template>

<script>
import Header from './Header'
export default {
	name: 'TheHeader',
	components: { Header },
	data() {
		return {
			headerType: process.env.VUE_APP_HEADER,
			env: process.env.VUE_APP_ENV
		}
	},
	methods: {
		showGuide(key) {
			this.$nextTick(() => {
				this.$refs.dfsHeader?.showGuide?.(key)
			})
		},
		createTask() {
			this.$refs.dfsHeader?.createTask?.()
		}
	}
}
</script>
