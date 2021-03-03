##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
```javascript
function validate(sourceRow){
	// 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
	// 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
		// 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
		return {result: 'failed',message: "记录不一致",data: targetRow}
	}
}
```
