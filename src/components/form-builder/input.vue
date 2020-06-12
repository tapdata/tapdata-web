<script>
export default {
	name: "FbInput",
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
		return h("ElInput", {
			attrs: {
				placeholder: config.placeholder || `请输入${config.label}`
			},
			props: {
				value: self.value,
				type: config.domType,
				clearable: config.clearable,
				showPassword: config.showPassword
			},
			on: {
				input(val) {
					self.$emit("input", val);
				}
			}
		});
	}
};
</script>

<style></style>
