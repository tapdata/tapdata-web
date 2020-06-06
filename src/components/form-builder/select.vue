<script>
export default {
	name: "FbSelect",
	props: {
		value: [String, Number, Boolean],
		config: {
			require: true,
			type: Object
		}
	},
	data() {
		return {
			defaultConfig: {
				options: []
			}
		};
	},
	render(h) {
		let self = this;
		let config = Object.assign({}, this.defaultConfig, self.config);
		return h(
			"ElSelect",
			{
				props: {
					value: self.value,
					placeholder: config.placeholder
				},
				on: {
					input(val) {
						self.$emit("input", val);
					}
				}
			},
			config.options.map(opt => {
				return h("ElOption", {
					props: opt
				});
			})
		);
	}
};
</script>

<style></style>
