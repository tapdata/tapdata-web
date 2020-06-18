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
		let selectFile = file => {
			let reader = new FileReader();
			reader.readAsText(file);
			reader.onload = () => {
				let text = reader.result;
				self.fileName = file.name;
				self.$emit('input', text);
				self.$emit('change', text);
			};
		};
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
								selectFile(file.raw);
							},
							onExceed: fileList => {
								selectFile(fileList[0]);
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
