<script>
import mixins from './mixin';
export default {
	name: 'FbSwitch',
	mixins: [mixins],
	props: {
		value: [Boolean, String, Number],
		config: {
			require: true,
			type: Object
		}
	},
	render(h) {
		let self = this;
		return h('ElSwitch', {
			props: {
				value: self.value
			},
			on: this.on
		});
	}
};
</script>

<style></style>
