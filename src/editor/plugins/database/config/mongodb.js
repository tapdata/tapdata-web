export default function(vm) {
	// let $t = vm.$t;
	return {
		defaultModel: {
			connection_type: 'source_and_target'
		},
		items: [
			{
				type: 'radio',
				field: 'isUrl',
				label: '数据库权限'
			},
			{
				type: 'input',
				field: 'database_host',
				label: '数据库地址',
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							let port = vm.model['database_port'];
							if (!value || !value.trim()) {
								callback(new Error('数据库地址不能为空'));
							} else if (!port || !port.trim()) {
								callback(new Error('端口不能为空'));
							} else if (!/\d+/.test(port)) {
								callback(new Error('端口必须为数字'));
							} else if (port < 1 || port > 65535) {
								callback(new Error('端口号取值范围 1 ~ 65535'));
							} else {
								callback();
							}
						}
					}
				],
				appendSlot: h => {
					return h('FbInput', {
						props: {
							value: vm.model['database_port'],
							config: {
								placeholder: '端口'
							}
						},
						on: {
							input(val) {
								vm.model['database_port'] = val;
							}
						}
					});
				}
			},
			{
				type: 'input',
				field: 'database_name',
				label: '数据库名称',
				required: true
			},
			{
				type: 'input',
				field: 'database_username',
				label: '账号',
				required: true
			},
			{
				type: 'input',
				field: 'plain_password',
				label: '密码',
				domType: 'password',
				showPassword: true
			},
			{
				type: 'input',
				field: 'table_filter',
				label: '包含表',
				tips: '逗号分割的表达式列表，使用 * 代表任意长度任意字符',
				rules: [{ max: 100, message: '长度在100个字符以内' }]
			},
			{
				type: 'input',
				field: 'additionalString',
				label: '其他连接串参数'
			}
		]
	};
}
