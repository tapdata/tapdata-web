<script>
import mixins from './mixin';
import TYPE_MAPPING from './constant';

export default {
	name: 'FbArray',
	mixins: [mixins],
	props: {
		value: [String, Array],
		config: {
			require: true,
			type: Object
		}
	},
	render(h) {
		let self = this;
		let config = self.config.itemConfig;

		let items = this.value;
		if (!items || !items.length) {
			items = [''];
		}
		return h(
			'div',
			{
				class: 'fb-array'
			},
			[
				...items.map((it, index) => {
					return h(
						'div',
						{
							style: 'display:flex;'
						},
						[
							h(TYPE_MAPPING[config.type], {
								class: 'fb-array-item',
								props: {
									value: it,
									config
								},
								on: {
									input: val => {
										this.$set(items, index, val);
										let value = items;
										self.$emit('input', value);
										self.config.on && self.config.on.change && self.config.on.input(value);
									}
								}
							}),
							h('ElButton', {
								style: {
									height: '28px',
									padding: '7px',
									marginLeft: '10px'
								},
								props: {
									icon: 'el-icon-close',
									size: 'mini'
								},
								on: {
									click: () => {
										items.splice(index, 1);
										self.$emit('input', items);
									}
								}
							})
						]
					);
				}),
				h('ElButton', {
					style: {
						height: '28px',
						padding: '7px'
					},
					props: {
						icon: 'el-icon-plus'
					},
					on: {
						click: () => {
							items.push('');
							self.$emit('input', items);
						}
					}
				})
			]
		);
	}
};
</script>

<style lang="less">
.fb-array {
	.fb-array-item {
		margin-bottom: 5px;
	}
}
</style>
