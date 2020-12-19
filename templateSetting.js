let nodeConfig = [
	{
		"nodeConfig": {
			"name": "加前后缀",
			"tips": "对字段统一加前缀，如：AA_",
			"shapeImage": "static/editor/o-mysql.svg",
			"stencilImage": "static/editor/mysql.svg"
		},
		"formConfig": {
			"items": [
				{
					"type": "field",
					"field": "fields",
					"label": "操作字段",
					"required": true,
					"multiple": true,
					"showAllCheckbox": true
				},
				{
					"type": "select",
					"field": "type",
					"label": "前后缀",
					"required": true,
					"options": [
						{ "label": "前缀", "value": "before" },
						{ "label": "后缀", "value": "after" }
					]
				},
				{
					"type": "input",
					"field": "text",
					"label": "前后缀文本",
					"required": true
				}
			]
		},
		"scriptTemplate":
`function process(record) {
	//当前模型的字段列表，可全选，多选
	var selected_fields = \${fields};
	//前缀还是后缀 (单选按钮） 前缀：before，后缀：after;
	var beforeOrAfter = \${type};
	//字符串输入
	var text = \${text};

	// validations
	if(!text || !selected_fields) {
		// report error
		log.warn("Missing processing node configuration");
		return record;
	}
	//核心代码
	selected_fields.forEach(function(fieldName) {
		if(fieldName.indexOf('.') >= 0) {
			log.error("字段 "+ fieldName + " 加前后缀失败，暂不支持内嵌字段");
			return record;
		}
		var newFieldName = "";
		if(beforeOrAfter === "before") {
			newFieldName = text + fieldName;
		} else {
			newFieldName = fieldName + text;
		}
		if(newFieldName in record){
			log.error("Field "+ newFieldName + " already exists");
			return record;
		}
		record[newFieldName] = record[fieldName];
		record.remove(fieldName);
	})
	return record;
}`
	},
	{
		"nodeConfig": {
			"name": "时区调整",
			"tips": "对时区字段进行时区调整（+/- 小时）",
			"shapeImage": "static/editor/o-mysql.svg",
			"stencilImage": "static/editor/mysql.svg"
		},
		"formConfig": {
			"items": [
				{
					"type": "field",
					"field": "fields",
					"label": "操作字段",
					"required": true,
					"multiple": true,
					"showAllCheckbox": true
				},
				{
					"type": "input",
					"field": "timeArea",
					"domType": "number",
					"label": "时区调整值",
					"required": true
				}
			]
		},
		"scriptTemplate":
`function process(record) {
	//当前模型的字段列表，可选1个或多个
	var fields = \${fields};
	// 时区调整值, 单选数值 -12 到 + 12
	var timeArea = \${timeArea};
	//核心代码
	fields.forEach(function(key) {
		var value = record[key];
		if (Object.prototype.toString.call(value) == '[object java.util.Date]'){
			value = new Date(value.getTime() + timeArea * 60 * 60 * 1000);
		record[key] = value;
		} else {
			log.error('Column ' + key +
				' type is not Date, data flow will stop, please confirm this record: ' + record);
			// return null ? keep going ? interupt
		}

	})
	return record;
}`

	},
	{
		"nodeConfig": {
			"name": "字段掩盖",
			"tips": "敏感字段脱敏",
			"shapeImage": "static/editor/o-mysql.svg",
			"stencilImage": "static/editor/mysql.svg"
		},
		"formConfig": {
			"items": [
				{
					"type": "field",
					"field": "fields",
					"label": "选择需要脱敏的字段",
					"required": true,
					"multiple": true,
					"showAllCheckbox": true
				},
				{
					"type": "select",
					"field": "type",
					"label": "选择脱敏的方式",
					"required": true,
					"options": [
						{ "label": "长度", "value": "length" },
						{ "label": "regex", "value": "regex" }
					]
				},
				{
					"type": "input",
					"field": "charLength",
					"label": "显示字符数",
					"domType": "number",
					"required": true,
					"show": false,
					"dependOn": [
						{
							"triggerOptions": [
								{
									"field": "type",
									"value": "length"
								}
							],
							"triggerConfig": {
								"show": true
							}
						}
					]
				},
				{
					"type": "select",
					"field": "charPosition",
					"label": "显示字符位置",
					"options": [
						{ "label": "头部", "value": "head" },
						{ "label": "尾部", "value": "foot" }
					],
					"required": true,
					"show": false,
					"dependOn": [
						{
							"triggerOptions": [
								{
									"field": "type",
									"value": "length"
								}
							],
							"triggerConfig": {
								"show": true
							}
						}
					]
				},
				{
					"type": "input",
					"field": "regex",
					"label": "Regex表达式",
					"required": true,
					"show": false,
					"dependOn": [
						{
							"triggerOptions": [
								{
									"field": "type",
									"value": "regex"
								}
							],
							"triggerConfig": {
								"show": true
							}
						}
					]
				},
				{
					"type": "input",
					"field": "groups",
					"label": "要显示的组号(逗号分隔)",
					"required": true,
					"show": false,
					"dependOn": [
						{
							"triggerOptions": [
								{
									"field": "type",
									"value": "regex"
								}
							],
							"triggerConfig": {
								"show": true
							}
						}
					]
				}
			]
		},
		"scriptTemplate":
`function process(record) {
	//当前模型的字段列表，可选1个或多个
	var selected_fields = \${fields};
	var masking_method = \${type};  // length or regex
	var visible_length = \${charLength};
	var visible_position = \${charPosition}; // head or foot
	var visible_regex = \${regex}; // string regex
	var visible_regex_groups = \${groups}; // comma separated regex capturing group number
	visible_regex_groups = visible_regex_groups.split(',');
	// validations

	function maskByLength(value){
		if(visible_position == 'head'){
			// show first N letters, the rest to use ####
			return value.substr(0, visible_length) + " ###";
		}
		else{
			// show last N letters, the rest to use ####
			return "### "+ value.substr( 0 - visible_length, visible_length)
		}
	}
	function maskByRegex(value){
			var reg = new RegExp(visible_regex);
			var matches = reg.exec(value);
			if(!matches){
			//log.debug("No matching record");
			return value;
			}
			var replacement = "";
			for(var i =0 ;i< visible_regex_groups.length;i++){
			replacement += "$"+visible_regex_groups[i]
			if(i+1 < visible_regex_groups)
				replacement += " ### ";
			}
			return value.replace(reg, replacement);
	}

	//核心代码
	selected_fields.forEach(function(fieldName) {
		var value = record[fieldName];
		if(!value) return;
		if(masking_method == "length")
			value = maskByLength(value);
		else
			value = maskByRegex(value);
		record[fieldName] = value;
	})
	return record;
}`
	},
	{
		"nodeConfig": {
			"name": "字符串转数组",
			"tips": "逗号分割的字段值变为列名",
			"shapeImage": "static/editor/o-sybase.svg",
			"stencilImage": "static/editor/sybase.svg"
		},
		"formConfig": {
			"items": [
				{
					"type": "field",
					"field": "field",
					"label": "选择需要转换的字段",
					"required": true
				},
				{
					"type": "input",
					"field": "separator",
					"label": "输入分割符",
					"required": true
				},
				{
					"type": "input",
					"field": "text",
					"label": "输入新字段名",
					"required": true
				}
			]
		},
		"scriptTemplate":
`function process(record) {
	var selected_field  = \${field};
	//分隔符
	var delimiter = \${separator};
	//字符串输入
	var targetFieldName = \${text};

	// validations
	if(! targetFieldName || !selected_field) {
		// report error
		log.warn("Missing processing node configuration");
		return record;
	}

	//核心代码

	var value = record[selected_field];
	if(!value) return record;
	var values = value.split(delimiter);
	record[targetFieldName] = values;

	return record;
}`
	},
	{
		"nodeConfig": {
			"name": "字段值替换",
			"tips": "对某个字段的值，使用词典进行替换",
			"shapeImage": "static/editor/o-sybase.svg",
			"stencilImage": "static/editor/sybase.svg"
		},
		"formConfig": {
			"items": [
				{
					"type": "field",
					"field": "fields",
					"label": "选择需要转换的字段",
					"required": true,
					"multiple": true,
					"showAllCheckbox": true
				},
				{
					"type": "array",
					"field": "mappings",
					"label": "输入词典信息",
					"required": true,
					"itemConfig": {
						"type": "group",
						"items": [
							{ "type": "input" },
							{ "type": "input" }
						]
					}
				}
			]
		},
		"scriptTemplate":
`function process(record) {
	var selected_fields = \${fields};
	var mappings= \${mappings};
	// validations
	if(  ! selected_fields || !mappings) {
		// report error
		log.warn("Missing processing node configuration");
		return record;
	}

	//核心代码
	selected_fields.forEach(function(selected_field){
		var value = record[selected_field];
		if(!value) return record;
		for(var i =0; i <mappings.length; i++){
			var mapping = mappings[i];
			if(mapping[0] == value){
				record[selected_field] = mapping[1];
				break;
			}
		}
	});

	return record;
}`
	}
];
export default nodeConfig;
