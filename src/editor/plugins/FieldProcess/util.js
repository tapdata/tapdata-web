/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/11/27
 * @description
 */
export const getFieldsIds = function(fields) {
	let fieldIds = [];
	if (fields) {
		fieldIds = fields.map(field => field.id);
	}
	return fieldIds;
};

export const getFieldsNames = function(fields) {
	let fieldNames = [];
	if (fields) {
		fieldNames = fields.map(field => field.field_name);
	}
	return fieldNames;
};

export const fieldsNamesMap = function(fields) {
	let fieldsNamesMap = {};
	if (fields) {
		fields.map(s => (fieldsNamesMap[s.field_name] = s.id));
	}
	return fieldsNamesMap;
};

export const fieldIsDeleted = function(fields) {
	let fieldIsDeleted = [];
	if (fields) {
		fieldIsDeleted = fields.filter(field => field.is_deleted).map(n => n.id);
	}
	return fieldIsDeleted;
};

export const fieldNameIndex = function(name) {
	let fieldNameIndex = '';
	if (name) {
		fieldNameIndex = name.indexOf('.');
	}
	return fieldNameIndex;
};

export const handleOperation = function(fields, operations) {
	//查找是否有被删除的字段且operation有操作
	let fieldOriginalIds = getFieldsIds(fields);
	let fieldOriginalIsDeleted = fieldIsDeleted(fields);
	let fieldOriginalNames = getFieldsNames(fields);
	let temporary = operations;
	if (temporary.length > 0) {
		for (let i = 0; i < temporary.length; i++) {
			let indexOf = fieldNameIndex(temporary[i].field) || -1;
			if (fieldOriginalIsDeleted.includes(temporary[i].id) && !temporary[i]['keep']) {
				temporary.splice(i, 1);
				i--;
				continue;
			} else if (
				temporary[i].op === 'CREATE' &&
				(fieldOriginalNames.includes(temporary[i].field) ||
					(!fieldOriginalIds.includes(temporary[i].triggerFieldId) && indexOf > -1))
			) {
				temporary.splice(i, 1);
				i--;
				continue;
			}
		}
	}
	return temporary;
};

export const isValidate = function(operations, schema) {
	//字段处理器是否校验通过
	let operation = operations || [];
	let isValidate = true;
	let errorList = [];
	if (operation.length > 0) {
		//data.operation id不匹配的字段验证 跟当前schema进行比较operation.id
		let originalSchema = schema || {};
		let fieldOriginalIds = getFieldsIds(originalSchema.fields);
		let fieldDeleted = fieldIsDeleted(originalSchema.fields);
		let fieldOriginalNames = getFieldsNames(originalSchema.fields);
		for (let i = 0; i < operation.length; i++) {
			// isType 1表示id name 都不匹配 2表示name匹配 3表示该字段被标记为删除且id匹配 4 新建字段处理 5 脚本处理
			let indexOf = fieldNameIndex(operation[i].field) || -1;
			let node = {};
			if (operation[i].op === 'CREATE') {
				node = {
					id: operation[i].id,
					isType: 4,
					keep: false,
					action: operation[i].action,
					op: operation[i].op,
					field: operation[i].field,
					javaType: operation[i].javaType,
					level: operation[i].level,
					tableName: operation[i].tableName,
					triggerFieldId: operation[i].triggerFieldId
				};
			} else {
				node = {
					id: operation[i].id,
					color: operation[i].color,
					field: operation[i].field,
					isType: 1,
					keep: false,
					label: operation[i].label,
					op: operation[i].op,
					operand: operation[i].operand,
					originalDataType: operation[i].originalDataType || operation[i].type,
					primary_key_position: operation[i].primary_key_position,
					table_name: operation[i].table_name,
					type: operation[i].type
				};
			}
			if (
				operation[i].op === 'CREATE' &&
				(fieldOriginalNames.includes(operation[i].field) ||
					(!fieldOriginalIds.includes(operation[i].triggerFieldId) && indexOf > -1))
			) {
				errorList.push(node);
				isValidate = false;
			} else if (
				!fieldOriginalIds.includes(operation[i].id) &&
				!fieldOriginalNames.includes(operation[i].field) &&
				operation[i].op !== 'CREATE'
			) {
				node.isType = 1;
				node.keep = false;
				errorList.push(node);
				isValidate = false;
			} else if (
				!fieldOriginalIds.includes(operation[i].id) &&
				fieldOriginalNames.includes(operation[i].field) &&
				operation[i].op !== 'CREATE'
			) {
				node.isType = 2;
				node.keep = true;
				errorList.push(node);
				isValidate = false;
			} else if (fieldDeleted.includes(operation[i].id)) {
				node.isType = 3;
				node.keep = true;
				errorList.push(node);
				isValidate = false;
			}
		}
	}
	return {
		isValidate: isValidate,
		errorList: errorList
	};
};
export const isScript = function(operations, scripts) {
	let fieldIds = [];
	let errorList = [];
	if (operations) {
		fieldIds = operations.map(field => field.id);
	}
	if (scripts) {
		for (let i = 0; i < scripts.length; i++) {
			if (!fieldIds.includes(scripts[i].id)) {
				let node = {
					isType: 5,
					keep: false,
					color: scripts[i].color,
					field: scripts[i].field,
					id: scripts[i].id,
					label: scripts[i].label,
					primary_key_position: scripts[i].primary_key_position,
					script: scripts[i].script,
					scriptType: scripts[i].scriptType,
					tableName: scripts[i].tableName,
					type: scripts[i].type
				};
				errorList.push(node);
			}
		}
	}
	return errorList;
};

export const getUrlSearch = function(name) {
	// 未传参，返回空
	if (!name) return null;
	// 查询参数：先通过search取值，如果取不到就通过hash来取
	var after = window.location.search;
	after = after.substr(1) || window.location.hash.split('?')[1];
	// 地址栏URL没有查询参数，返回空
	if (!after) return null;
	// 如果查询参数中没有"name"，返回空
	if (after.indexOf(name) === -1) return null;
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
	// 当地址栏参数存在中文时，需要解码，不然会乱码
	var r = decodeURI(after).match(reg);
	// 如果url中"name"没有值，返回空
	if (!r) return null;
	return r[2];
};
