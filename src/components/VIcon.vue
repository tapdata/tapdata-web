<script>
export default {
	name: 'VIcon',

	functional: true,

	props: {
		size: [String, Number],
		color: String,
		svg: {
			type: Boolean,
			default: true
		}
	},

	render(h, { data, props, children }) {
		let iconName = children?.[0]?.text?.trim()
		if (!iconName) {
			console.error('缺少图标名称!', '<VIcon>图标名称</VIcon>')
		}
		iconName = `icon-${iconName}`
		let dataObj = {
			class: 'iconfont',
			style: {
				fontSize: props.size + 'px',
				color: props.color
			},
			attrs: {
				'aria-hidden': true
			},
			...data
		}
		return props.svg
			? h('svg', dataObj, [
					h('use', {
						attrs: {
							'xlink:href': `#${iconName}`
						}
					})
			  ])
			: h('i', { ...dataObj, class: `iconfont ${iconName}` })
	}
}
</script>

<style scoped>
.iconfont {
	font-family: 'iconfont', sans-serif;
	font-size: 16px;
	font-style: normal;
	line-height: 1em;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
svg.iconfont {
	width: 1em !important;
	height: 1em !important;
	vertical-align: -0.15em !important;
	fill: currentColor;
	overflow: hidden;
	transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
}
</style>
