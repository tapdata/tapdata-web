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
	custom_connection: 'SQL Server',
	'rest api': 'REST API',
	'dummy db': 'Dummy DB',
	gridfs: 'GridFS'
};
