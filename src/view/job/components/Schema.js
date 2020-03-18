/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/13/20
 * @description
 */
import _ from 'lodash';
export const allColorList = [
	'#00796B', '#536DFE',
	'#303F9F', '#00BCD4',
	'#FFA000', '#795548',
	'#D32F2F', '#B2DFDB',
	'#607D8B', '#CDDC39',
];

let tableCounter = 0;

export const

	/**
	 * convert schema to Entity tree data
	 * @param schema {{table_name: '', meta_type: 'collection|table', fields: [{field_name: '', data_type: '', javaType: '', ...}, ...]}}
	 * @param color
	 * @returns {{
					name: 'Order',
					type: 'collection',
					fields: [{
						id: 1,
						label: 'id',
						type: 'int',
						color: '#c325c8',
						children: [{
							...
						}]
					}, {}... ]
				}}
	 */
	convertSchemaToTreeData = function(schema, color = '#dddddd') {

		if( schema ){
			let entityData = {
				name: schema.table_name || `Table${tableCounter++}`,
				type: schema.meta_type || 'table',
				fields: []
			};

			let root = {};
			let fields = schema.fields || [];
			for (let i = 0; i < fields.length; i++) {
				let field = fields[i];
				if( field && field.field_name){
					let jsonPath = field.field_name.split('.');
					let treeItem = {
						id: `${field.table_name}${field.original_field_name ? ('_' + field.original_field_name) : ''}`.replace(/\./g, '_'),
						label: jsonPath[jsonPath.length - 1],
						type: field.javaType,
						color: color
					};
					_.set(root, 'children.' + jsonPath.join('.children.'), treeItem);
				}
			}
			let re = function(field){
				if( field && field.children ){
					field.children = Object.values(field.children);
					field.children.forEach(re);
				}
			};
			re(root);
			entityData.fields = root.children;
			return entityData;
		} else {
			return null;
		}
	},

	/**
	 * merge schema by joinType
	 * @param targetSchema {{table_name: '', meta_type: 'collection|table', fields: [{field_name: '', data_type: '', javaType: '', ...}, ...]}}
	 * @param sourceSchema {{}}
	 * @param mergeOpts: { {jointType: 'append|upsert|update|merge_embed', joinPath: '' }}
	 * @return
	 */
	mergeSchema = function(targetSchema, sourceSchema, mergeOpts){

		if( !sourceSchema || !sourceSchema.table_name || !sourceSchema.fields || sourceSchema.fields.length === 0 )
			return targetSchema;

		targetSchema = targetSchema || {};
		mergeOpts = mergeOpts || {};

		let joinType = mergeOpts.joinType || 'upsert';
		let joinPath = mergeOpts.joinPath || sourceSchema.table_name || '';

		targetSchema.table_name = targetSchema.table_name || sourceSchema.table_name || '';
		targetSchema.fields = targetSchema.fields || [];

		let sourceSchemaFields = _.cloneDeep(sourceSchema.fields) || [];
		if( joinType === 'append' || targetSchema.meta_type === 'table') {
			targetSchema.fields.push(...sourceSchemaFields);
		} else {
			joinPath.split('.').forEach(fieldName => {
				targetSchema.fields.push({
					field_name: fieldName,
					javaType: joinType === 'merge_embed' ? 'Array' : 'Map',
					data_type: joinType === 'merge_embed' ? 'ARRAY' : 'DOCUMENT',
					table_name: sourceSchema.table_name
				});
			});
			sourceSchemaFields.forEach((field) => {
				if( field ) {
					targetSchema.fields.push(Object.assign(field, {
						field_name: joinPath + '.' + field.field_name,
						javaType: field.javaType,
						data_type: field.data_type
					}));
				}
			});
		}

		return targetSchema;
	},

	/**
	 * merge multiple source schema to on schema
	 * @param sourceSchemas {[{table_name: '', meta_type: 'collection|table', fields: [{field_name: '', data_type: '', javaType: '', ...}, ...]}]}
	 * @return {*}
	 */
	mergeSourceSchema = function(sourceSchemas){
		let source = null;

		sourceSchemas = Array.isArray(sourceSchemas) ? sourceSchemas : [sourceSchemas];

		sourceSchemas.forEach((schema) => {

			if( !schema ) return;

			if( !source){
				source = schema;
			} else {
				mergeSchema(source, schema, {
					joinType: 'upsert',
					joinPath: schema.table_name
				});
			}
		});

		return source;
	},

	/**
	 * merge all joinTables to target schema
	 * @param targetSchema
	 * @param joinTables
	 * @return {*}
	 */
	mergeJoinTablesToTargetSchema = function(targetSchema, joinTables){
		let mergedTargetSchema = targetSchema || {};
		const mergeTargetSchema = function(jt){
			if( jt && jt.sourceSchemas ){
				mergeSchema(mergedTargetSchema, mergeSourceSchema(jt.sourceSchemas), jt);
			}
		};
		joinTables.forEach( mergeTargetSchema );
		return targetSchema;
	}
;
