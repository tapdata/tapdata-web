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
	sqlserver: 'SQL Server'
};
