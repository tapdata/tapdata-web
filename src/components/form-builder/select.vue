<script>
import mixins from './mixin';
export default {
	name: 'FbSelect',
	mixins: [mixins],
	props: {
		value: [String, Number],
		config: {
			require: true,
			type: Object
		}
	},
	render(h) {
		let self = this;
		let config = self.config;
		return h(
			'ElSelect',
			{
				class: {
					'fb-select': true
				},
				props: {
					value: self.value,
					placeHolder: config.placeHolder
				},
				on: this.on
			},
			config.options.map(opt => {
				return h('ElOption', {
					props: opt
				});
			})
		);
	}
};
</script>

<style lang="less">
.fb-select {
	width: 100%;
}
</style>
