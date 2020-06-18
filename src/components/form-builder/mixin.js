export default {
	data() {
		let self = this;
		return {
			on: {
				input: (...args) => {
					self.$emit('input', ...args);
				},
				change: (...args) => {
					self.$emit('change', ...args);
				}
			}
		};
	}
};
