<script>
import mixins from './mixin';
export default {
	name: 'FbInput',
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
		return h('ElInput', {
			attrs: {
				placeholder: config.placeholder || `${self.$t('formBuilder.input.placeholderPrefix')}${config.label}`
			},
			props: {
				value: self.value,
				type: config.domType,
				clearable: config.clearable,
				showPassword: config.showPassword
			},
			on: this.on
		});
	}
};
</script>

<style></style>
