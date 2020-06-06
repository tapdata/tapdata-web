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
	data() {
		return {
			defaultConfig: {}
		};
	},
	render(h) {
		let self = this;
		let config = Object.assign({}, this.defaultConfig, self.config);
		return h("ElInput", {
			attrs: {
				placeholder: config.placeholder
			},
			props: {
				value: self.value
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
