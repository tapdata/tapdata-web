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
		return h('div', { class: 'fb-select' }, [
			h(
				'ElSelect',
				{
					domProps: {
						readonly: true
					},
					props: {
						value: self.value,
						placeholder: config.placeholder,
						size: config.size,
						filterable: config.filterable,
						filterMethod: this.filterMethod,
						allowCreate: config.allowCreate,
						defaultFirstOption: config.defaultFirstOption,
						clearable: config.clearable
					},
					on: Object.assign(this.on, config.on, {
						'visible-change'(value) {
							if (value) {
								self.filterMethod('');
							}
						}
					}),
					ref: 'select'
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
			),
			h(
				'div',
				{
					class: {
						'fb-select-mask': true,
						'is-show': config.loading
					}
				},
				[h('i', { class: 'el-icon-loading' })]
			)
		]);
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
	position: relative;
	width: 100%;
	.fb-select-mask {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		display: none;
		text-align: right;
		padding-right: 30px;
		box-sizing: border-box;
		background: rgba(0, 0, 0, 0.1);
		&.is-show {
			display: block;
		}
	}
}
</style>
