/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/12/9
 * @description
 */
export const getImgByType = function(type) {
	if (!type) {
		type = 'mongodb';
	}
	return require(`../../../static/image/databaseType/${type.toLowerCase()}.png`);
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
