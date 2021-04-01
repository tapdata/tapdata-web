/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/12/9
 * @description
 */
export const getImgByType = function(type) {
	if (!type) {
		type = 'default';
	}
	return require(`../../../static/image/databaseType/${type.toLowerCase()}.png`);
};

export const verify = function(value) {
	var arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-'];
	for (var i = 0; i < arr.length; i++) {
		var str = '\\' + arr[i];
		value = value.replace(new RegExp(str, 'g'), '\\' + arr[i]);
	}
	return value;
};
//列表脱敏
export const desensitization = function(url) {
	let matchResult = url.match(/^mongodb(\+srv)?:\/\/(.+):(.+)@/);
	if (matchResult && matchResult[3]) {
		return url.replace(`:${matchResult[3]}@`, ':*********@');
	}
	return url;
};

export const handleProgress = function(data) {
	let count = 0;
	data.forEach(log => {
		if (log.status === 'passed') {
			count++;
		}
	});
	let len = (100 / data.length) * count;
	return Math.round(len) ? Math.round(len) : 0;
};

//支持的数据源
export const TYPEMAP = {
	mysql: 'MySQL',
	oracle: 'Oracle',
	mongodb: 'MongoDB',
	elasticsearch: 'Elasticsearch',
	redis: 'Redis',
	postgres: 'PostgreSQL',
	sqlserver: 'SQL Server',
	'gbase-8s': 'GBase 8s',
	'sybase ase': 'Sybase ASE',
	gaussdb200: 'GaussDB200',
	db2: 'IBM Db2',
	mem_cache: 'Memory Cache',
	file: 'File(s)',
	custom_connection: 'Custom connection',
	'rest api': 'REST API',
	'dummy db': 'Dummy DB',
	gridfs: 'GridFS',
	kafka: 'Kafka',
	mariadb: 'MariaDB',
	'mysql pxc': 'MySQL PXC'
};

//数据源基础字段
export const defaultModel = {
	default: {
		id: '',
		name: '',
		database_type: '',
		connection_type: '',
		database_host: '',
		database_port: '',
		database_name: '',
		database_username: '',
		database_password: '',
		plain_password: '',
		table_filter: '',
		additionalString: '',
		thin_type: '',
		database_owner: '',
		node_name: '',
		database_schema: '',
		plugin_name: '',
		pgsql_log_decorder_plugin_name: '',
		database_datetype_without_timezone: '',
		supportUpdatePk: false,
		isUrl: true,
		database_uri: '',
		ssl: false,
		sslKey: '',
		sslPass: '',
		schemaAutoUpdate: false,
		sslValidate: false,
		sslCA: '',
		sslCAFile: null,
		sslKeyFile: null,
		search_databaseType: ''
	},
	kafka: {
		id: '',
		name: '',
		database_type: '',
		connection_type: '',
		kafkaBootstrapServers: '',
		kafkaPatternTopics: '',
		kafkaIgnoreInvalidRecord: false,
		kafkaAcks: '',
		kafkaCompressionType: '',
		kafkaIgnorePushError: false
	},
	file: {
		name: '',
		database_type: '',
		connection_type: '',
		database_host: '',
		database_port: '',
		database_name: '',
		database_username: '',
		database_password: '',
		plain_password: '',
		database_uri: '',
		ftp_passive: true, // 连接方式
		connection_timeout_seconds: 60, //连接超时时间
		data_timeout_seconds: 60, //传输超时时间
		fileDefaultCharset: 'UTF8', // 编码格式
		file_upload_chunk_size: 261120, //文件上传文件块大小
		file_upload_mode: '', //文件上传模式
		overwriteSetting: '', //当同名文件存在时
		extendSourcePath: false, // 继承目录结构
		outputPath: '', // 文件输出绝对路径
		file_source_protocol: '', //协议类型
		vc_mode: '', // 版本管理
		file_sources: [
			{
				path: '',
				recursive: false,
				selectFileType: 'include',
				include_filename: '',
				exclude_filename: ''
			}
		]
	}
};
export const defaultCloudModel = {
	default: {
		name: '',
		database_type: '',
		connection_type: '',
		database_host: '',
		database_port: '',
		database_name: '',
		database_username: '',
		database_password: '',
		plain_password: '',
		database_owner: '',
		database_uri: '',
		isUrl: false,
		ssl: false,
		sslKey: '',
		sslPass: '',
		sslValidate: false,
		sslCA: '',
		sslCAFile: null,
		sslKeyFile: null,
		pgsql_log_decorder_plugin_name: '',
		database_datetype_without_timezone: '',
		additionalString: ''
	},
	drs: {
		s_zone: '',
		s_region: '',
		sourceType: 'rds',
		database_type: 'source_and_target',
		region: '',
		zone: '',
		vpc: '',
		checkedVpc: '',
		platformInfo: {
			region: '',
			zone: '',
			sourceType: '',
			DRS_region: '',
			DRS_zone: '',
			DRS_instances: '',
			IP_type: '',
			vpc: '',
			checkedVpc: false,
			isThrough: false
		}
	}
};
