export default function(vm) {
	// let $t = vm.$t;
	return {
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: '数据库权限',
				border: true,
				options: [
					{ label: '允许读写', value: 'source_and_target' },
					{ label: '仅限读取', value: 'source' },
					{ label: '仅限写入', value: 'target' }
				],
				required: true
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
				field: 'database_password',
				label: '密码',
				required: true,
				domType: 'password',
				showPassword: true
			},
			{
				type: 'input',
				field: 'table_filter',
				label: '包含表',
				tips: '(逗号分割的表达式列表，使用 * 代表任意长度任意字符)',
				required: true
			},
			{
				type: 'input',
				field: 'additionalString',
				label: '其他连接串参数',
				required: true
			}
		]
	};
}
