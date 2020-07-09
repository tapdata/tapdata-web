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
	data() {
		return {
			defaultConfig: {
				size: 'mini'
			},
			filterList: this.config.options || []
		};
	},
	watch: {
		'config.options'(data) {
			let list = data || [];
			this.filterList = list;
		}
	},
	render(h) {
		let self = this;
		let config = Object.assign(this.defaultConfig, self.config);
		return h(
			'ElSelect',
			{
				class: {
					'fb-select': true
				},
				props: {
					value: self.value,
					placeholder: config.placeholder,
					size: config.size,
					filterable: config.filterable && !config.loading,
					loading: config.loading,
					filterMethod: this.filterMethod,
					allowCreate: config.allowCreate,
					defaultFirstOption: config.defaultFirstOption,
					clearable: config.clearable
				},
				on: Object.assign(this.on, config.on)
			},
			this.filterList.map(opt => {
				return h('ElOption', {
					props: {
						label: opt.label,
						value: opt.value
					},
					key: opt.key || opt.value
				});
			})
		);
	},
	methods: {
		filterMethod(keyword) {
			let reg = new RegExp(keyword, 'ig');
			this.filterList = this.config.options
				.filter(d => d.label.match(reg))
				.sort((a, b) => {
					if (a.label === keyword) {
						return -1;
					} else if (b.label === keyword) {
						return 1;
					} else {
						return a.label <= b.label ? -1 : 1;
					}
				});
		}
	}
};
</script>

<style lang="less">
.fb-select {
	width: 100%;
}
</style>
