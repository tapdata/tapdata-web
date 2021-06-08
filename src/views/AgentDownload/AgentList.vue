<template>
	<section class="down-list-page down-page">
		<main class="page-main block">
			<div class="title">Agent 本地目录结构及功能</div>
			<p class="title-text pt-10">
				在完成 tapdata agent 的部署及启动后，agent会自动在当前目录下生成其运行所需目录
				这些目录主要用于任务及日志信息的记录：
			</p>
			<div class="box mt-20">
				<p class="pt-5">~/.tapdata/cert/</p>
				<p>#如果中间库存在证书，那么此目录将用来存放证书相关文件</p>
				<p class="pt-5">~/.tapdata/logs/</p>
				<p>#此目录用来存放日志相关文件</p>
				<p class="pt-5">~/.tapdata/os-monitor/</p>
				<p>#此目录用来存放os-monitor的配置文件</p>
				<p class="pt-5">~/.tapdata/application.yml /</p>
				<p>#该文件为tapdata agent配置文件</p>
				<p class="pt-5">~/.tapdata/tapdata.conf/</p>
				<p>#改文件为老版本tapdata agent配置文件</p>
				<p class="pt-5">~/.tapdata/os-monitor/</p>
				<p>#该文件为engine配置文件</p>
			</div>
			<p class="title-text pt-10">
				以上目录并不会占用太多磁盘空间，为了确保 tapdata agent 的稳定运行以及在你遇到问题 时 tapdata
				技术客服能够协助你快速定位问题根因，请勿删除这些目录。
			</p>
		</main>
		<footer class="footer">
			<ElButton @click="handlePrevious()">上一步</ElButton>
			<ElButton type="primary" @click="handleNextSetp()">完成</ElButton>
		</footer>
	</section>
</template>
<script>
export default {
	name: 'AgentList',
	props: {
		downLoadType: {
			type: String
		}
	},
	data() {
		return {
			type: this.downLoadType || ''
		}
	},

	methods: {
		// 上一步
		handlePrevious() {
			this.$emit('nextStep', 'previousList', this.type)
		},

		// 下一步
		handleNextSetp() {
			this.$emit('nextStep', 'listPage', this.type)
		}
	}
}
</script>
<style lang="scss" scoped>
.down-list-page {
	.box {
		padding: 10px 20px;
		background-color: #fafafa;
	}
}
</style>
