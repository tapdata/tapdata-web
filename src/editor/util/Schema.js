/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/13/20
 * @description
 */
import _ from 'lodash';
import log from "../../log";
const allColorList = [
	'#990066', '#FFCC00',
	'#CC0033', '#006699',
	'#009999', '#FF9933',
	'#FFCCCC', '#FF6600',
	'#303F9F', '#795548',
	'#99CCFF', '#FFFFCC',
	'#0099CC', '#009966',
	'#CC9999', '#99CCFF',
	'#333300', '#33CC33',
];
const tableColors = {};
const getColor = function(tableName){
	let color = tableColors[tableName];
	if( color )
		return color;
	else {
		tableColors[tableName] = allColorList[Object.keys(tableColors).length%allColorList.length];
		return tableColors[tableName];
	}
};

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
	convertSchemaToTreeData = function(schema) {
		log('Schema.convertSchemaToTreeData', arguments);
		if( schema ){
			let entityData = {
				name: schema.table_name,
				type: schema.meta_type || 'table',
				fields: []
			};

			let root = {};
			let fields = schema.fields || [];
			for (let i = 0; i < fields.length; i++) {
				let field = fields[i];
				if( field && field.field_name && field.original_field_name){
					let jsonPath = field.original_field_name.split('.');
					let jsonPathForFieldName = field.field_name.split('.');
					let treeItem = {
						id: field.id || `${field.table_name}${field.original_field_name ? ('_' + field.original_field_name) : ''}`.replace(/\./g, '_'),
						label: jsonPathForFieldName[jsonPathForFieldName.length - 1],
						type: field.javaType,
						color: getColor(field.table_name)

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
      log('Schema.convertSchemaToTreeData.return', entityData);
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
		log('Schema.mergeSchema', arguments);

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
					//id: uuid(),
					field_name: fieldName,
					javaType: joinType === 'merge_embed' ? 'Array' : 'Map',
					data_type: joinType === 'merge_embed' ? 'ARRAY' : 'DOCUMENT',
					table_name: sourceSchema.table_name,
					original_field_name: fieldName,
				});
			});
			sourceSchemaFields.forEach((field) => {
				if( field ) {
					targetSchema.fields.push(Object.assign(field, {
						field_name: joinPath + '.' + field.field_name,
						original_field_name: joinPath + '.' + field.original_field_name,
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
		log('Schema.mergeSourceSchema', arguments);
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
			if( jt && (jt.sourceSchemas || jt.sourceSchema)){
				mergeSchema(mergedTargetSchema, mergeSourceSchema(jt.sourceSchemas || jt.sourceSchema), jt);
			}
		};
		if( joinTables )
			joinTables.forEach( mergeTargetSchema );

		log('Schema.mergeJoinTablesToTargetSchema', ...arguments, mergedTargetSchema);

		return mergedTargetSchema;
	},

	uuid = function() {

		// credit: http://stackoverflow.com/posts/2117523/revisions

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (Math.random() * 16) | 0;
			var v = (c === 'x') ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
;
