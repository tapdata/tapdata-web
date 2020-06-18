<script>
import mixins from './mixin';
export default {
	name: 'FbFile',
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
			fileName: ''
		};
	},
	render(h) {
		let self = this;
		let config = self.config;
		return h(
			'ElInput',
			{
				attrs: {
					placeholder: config.placeholder || self.$t('formBuilder.file.placeholder')
				},
				props: {
					value: self.fileName,
					clearable: config.clearable
				}
			},
			[
				h(
					'ElUpload',
					{
						props: {
							action: '',
							limit: 1,
							autoUpload: false,
							accept: config.accept,
							showFileList: false,
							onChange: file => {
								let reader = new FileReader();
								reader.readAsText(file.raw);
								reader.onload = () => {
									let text = reader.result;
									self.fileName = config.field + 'File';
									self.$emit('input', text);
									self.$emit('change', text);
								};
							}
						},
						slot: 'append'
					},
					[h('ElButton', self.$t('formBuilder.file.button'))]
				)
			]
		);
	}
};
</script>

<style></style>
