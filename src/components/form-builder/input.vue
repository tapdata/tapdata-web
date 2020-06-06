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
			props: {
				value: self.value,
				placeHolder: config.placeHolder
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
