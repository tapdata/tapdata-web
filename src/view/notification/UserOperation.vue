<script>
export default {
	props: {
		record: {
			type: Object,
			required: true
		}
	},
	render(h) {
		let record = this.record;
		let activeTextStyle = 'color: #48b6e2';
		return h(
			'div',
			{
				class: 'user-operation-wrap'
			},
			[
				this.$t('notification.account'),
				h('span', { style: activeTextStyle }, record.username),
				this.$t('notification.operation.' + record.operation),
				this.$t('notification.modular.' + record.modular),
				h('span', { style: activeTextStyle }, record.parameter1)
			]
		);
	}
};
</script>

<style scoped lang="less">
.user-operation-wrap {
	display: inline-block;
}
</style>
