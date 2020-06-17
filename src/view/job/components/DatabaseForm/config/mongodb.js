export default function(vm) {
	// let $t = vm.$t;
	return {
		defaultModel: {
			connection_type: 'source_and_target',
			isUrl: true,
			ssl: false,
			sslValidate: false
		},
		checkItems() {
			let vm = this;
			let isUrl = vm.model.isUrl;
			let ssl = vm.model.ssl;
			let sslValidate = vm.model.sslValidate;
			vm.$nextTick(() => {
				vm.config.items = vm.config.items.map(item => {
					if (item.showByUrl) {
						item.show = item.showByUrl === 1 ? isUrl : !isUrl;
					}
					if (item.showWhenSslTrue) {
						item.show = ssl;
					}
					if (item.showWhenSslValidateTrue) {
						item.show = sslValidate;
					}
					if (item.show === false) {
						vm.model[item.field] = item.type === 'switch' ? false : '';
					}
					return item;
				});
				vm.$refs.form.$forceUpdate();
			});
		},
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: '数据库权限',
				options: [
					{ label: '允许读写', value: 'source_and_target' },
					{ label: '仅限读取', value: 'source' },
					{ label: '仅限写入', value: 'target' }
				],
				required: true
			},
			{
				type: 'switch',
				field: 'isUrl',
				label: '是否使用URI',
				on: {
					change() {
						vm.checkItems();
					}
				}
			},
			{
				type: 'input',
				field: 'database_uri',
				label: '数据库 URI',
				domType: 'textarea',
				showByUrl: 1,
				required: true,
				tips: {
					label: '示例',
					content:
						`<b>MongoDB 數據庫連接 URI 示範:</b><br>` +
						`複製集: mongodb://192.168.0.100:27017/mydb?replicaSet=xxx<br>` +
						`啟用認證的複製集: mongodb://admin:password@192.168.0.100:27017/mydb?replicaSet=xxx&authSource=admin<br>` +
						`多節點複製集: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb?replicaSet=xxx<br>` +
						`分片集: mongodb://192.168.0.100:27017/mydb<br>` +
						`多個mongos: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb<br>`
				}
			},
			{
				type: 'input',
				field: 'database_host',
				label: '数据库地址',
				placeholder: '数据库地址(127.0.0.1/Domain:{端口},多个地址请用,分开)',
				showByUrl: 2,
				show: false,
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							if (!value || !value.trim()) {
								callback(new Error('数据库地址不能为空'));
							} else {
								callback();
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'database_name',
				label: '数据库名称',
				showByUrl: 2,
				show: false,
				required: true
			},
			{
				type: 'input',
				field: 'database_username',
				label: '账号',
				showByUrl: 2,
				show: false,
				required: true
			},
			{
				type: 'input',
				field: 'plain_password',
				label: '密码',
				domType: 'password',
				showByUrl: 2,
				show: false,
				showPassword: true
			},
			{
				type: 'input',
				field: 'additionalString',
				label: '其他连接串参数',
				showByUrl: 2,
				show: false
			},
			{
				type: 'switch',
				field: 'ssl',
				label: '使用 TLS/SSL 连接',
				on: {
					change() {
						vm.checkItems();
					}
				}
			},
			{
				type: 'file',
				field: 'sslKey',
				label: '客户端私钥',
				showWhenSslTrue: true,
				show: false,
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							let ssl = vm.model.ssl;
							if (ssl && (!value || !value.trim())) {
								callback(new Error('客户端私钥不能为空'));
							} else {
								callback();
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'sslPass',
				label: '私钥密码',
				show: false,
				showWhenSslTrue: true
			},
			{
				type: 'switch',
				field: 'sslValidate',
				label: '验证服务端证书',
				show: false,
				showWhenSslTrue: true,
				on: {
					change() {
						vm.checkItems();
					}
				}
			},
			{
				type: 'file',
				field: 'sslCA',
				label: '证书颁发机构',
				show: false,
				showWhenSslValidateTrue: true,
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							let ssl = vm.model.sslValidate;
							if (ssl && (!value || !value.trim())) {
								callback(new Error('证书颁发机构不能为空'));
							} else {
								callback();
							}
						}
					}
				]
			}
		]
	};
}
