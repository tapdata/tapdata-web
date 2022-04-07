自定义节点
========

```javascript
{
	//自定节点配置节点配置
	nodeConfig: {
		//显示在编排左侧节点列表的名称
		name: "节点名称",
		//鼠标移动到节点上的tip
		tips: "节点描述提示",
		//节点拖到画布后的图标
		shapeImage: "static/editor/o-mysql.svg",
		//节点在节点列表里的图标
		stencilImage: "static/editor/mysql.svg"
	},
	//表单生成器配置, 具体配置见下文
	formConfig: {},
	/**
	 * js脚本
	 *
	 * 变量使用${xxx}的形式标识，
	 * 且需要与表单生成器中的field配置对应
	 **/
	scriptTemplate: ''
}
```

 </br>
 </br>

表单生成器配置
===========

表单生成器依赖 **ElementUI 2.13** 和 **Vue 2.0** 以上

<br/>

## 表单配置


```js
	{
		//表单整体配置
		form: {
			...
		},
		//表单项配置
		items: [
			{
				type: 'input',
				label: 'xxx',
				field: 'xxx'
			}
		]
	}
```

## 表单整体配置 form

>### Form Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>|  ----  | ----  | ---- | ---- | ----
>| rules | 表单验证规则 | object | — | —
>| inline | 行内表单模式 | boolean | — | false
>| labelPosition | 表单域标签的位置，如果值为 left 或者 right 时，则需要设置 label-width | string | right/left/top | right
>| labelWidth |	表单域标签的宽度，例如 '50px'。作为 Form 直接子元素的 form-item 会继承该值。支持 auto。 | 	string | — | —
>| showMessage | 是否显示校验错误信息 | boolean | —	| true
>| statusIcon |	是否在输入框中显示校验结果反馈图标 | boolean | — | false
>| validateOnRuleChange | 是否在 rules 属性改变后立即触发一次验证 | boolean | — |	true
>| size | 用于控制该表单内组件的尺寸 |	string |	medium / small / mini |	—
>| disabled | 是否禁用该表单内的所有组件。若设置为 true，则表单内组件上的 disabled 属性不再生效 |	boolean |	— |	false

<br/>
<br/>
<br/>

## 表单项配置 - item

>### Form Item Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| type | 类型，具体配置见下文，必填项 | String | input / select / radio / switch / file / field / array / group | input
>| field | 字段名称 | String | - | -
>| show | 是否显示 | Boolean | - | true
>| label | 标签文本 | String | - | -
>| required | 是否必填，如不设置，则会根据校验规则自动生成 | Boolean | - | false
>| rules | 表单验证规则 | Object | - | -
>| dependOn | 依赖项，具体配置见下文 | Object | - | -
<br/>

#### dependOn 配置说明:
```js
{
	form: {},
	items: [
		{
			...
			dependOn: [
				//依赖项
				{
					/**
					 * 依赖的字段和值的列表，
					 * 当表单model中的键和值与triggerOptions列表中匹配上后，
					 * triggerConfig中的表单配置会生效
					 */
					triggerOptions: [
						{
							//依赖的字段
							field: "xxx",
							//依赖字段的值
							value: "xxx"
						}
					],
					//符合依赖条件后生效的配置
					triggerConfig: {
						show: true
					}
				}
				...
			]
		},
		...
	]
}
```

----

>### Input Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| domType | 类型 | String | input / number | -
>| placeholder | 输入框占位文本 | String | - | -
>| maxlength | 原生属性，最大输入长度 | Number | - | -
>| showPassword | 是否显示切换密码图标 | Boolean | - | false
>| showWordLimit | 是否显示输入字数统计，只在 type = "text" 或 type = "textarea" 时有效 | Boolean | - | false
>| clearable | 是否可清空 | Boolean | - | false

----

>### Select Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| options | 下拉框可选条目, 每个条目配置label和value，分别表示条目文本和值 | Array | - | -
>| placeholder | 输入框占位文本 | String | - | -
>| multiple | 是否多选 | Boolean | - | false
>| clearable | 是否可清空 | Boolean | - | false
>| default-first-option | 在输入框按下回车，选择第一个匹配项。需配合 filterable 或 remote 使用 | Boolean | - | false
>| filterable | 是否可搜索 | Boolean | - | false
>| filterMethod | 自定义搜索方法 | function | - | -
>| allowCreate | 是否允许用户创建新条目，需配合 filterable 使用 | Boolean | - | false
>| showAllCheckbox | 是否显示全选框，需配合 multiple 使用 | Boolean | - | false

----

>### Radio Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| border | 是否显示边框 | Boolean | - | false
>| button | 是否使用button样式 | Boolean | - | false

----

>### File Attributes
>
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| accept | 接收上传的文件类型（thumbnail-mode 模式下此参数无效） | string | - | -
>| placeholder | 输入框占位文本 | String | - | -
>| clearable | 是否可清空 | Boolean | - | false

----

>### Array Attributes
>该类型为动态表单类型，可动态增加表单个数，但只能是同一种类型的
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| itemConfig | 动态表单中的配置 | string | - | -

----

>### Group Attributes
>该类型为组合表单类型，即该表单项为多个类型的表单组合而成，items可配置多个不同类型的表单
>|  参数   | 说明   | 类型 | 可选值 | 默认值
>| ---- | ---- | ---- | ---- | ----
>| items | 同form配置中的items | string | - | -

---
<br/>
<br/>
<br/>
<br/>

## 自定义节点实例

```js
[
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
]
```


