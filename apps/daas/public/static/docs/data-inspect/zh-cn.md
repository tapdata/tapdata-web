## TimeUpdate

### $dynamicDate

#### 函数说明

校验任务过滤条件中时间参数自动根据配置做值更新，目前该函数仅支持 Mongo。改属性包含的参数有：

- customFormat: 字符串类型，非必填项，需要自动转换的时间格式字符串，可动态使用占位符组合，时间格式需要时标准的日期格式：yyyy-MM-dd HH:mm:ss.SSS ，默认为任务运行当前时间；
- subtract: 整数类型（单位毫秒），非必填项，正数表示基于 format 值减少的时间毫秒数;
- toStringFormat: 字符串类型，时间输出格式，非必填项，语义为是否将最终结果输出为时间格式字符串，例如：值为：yyyy-MM-dd hh:mm:ss, 则按此格式输出时间字符串, 值为 null 或不填表示输出为时日期对象等价于$date

#### 案例参考

1. 固定时间

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "2023-03-19 05:00:00.000",
        "subtract": 3600000
      }
    }
  }
}
```

以上过滤条件的含义为：查询所有字段 field 时间大于"2023-03-19 04:00:00"的记录，配置中时间为"2023-03-19 05:00:00",时间减少的跨度为 3600000

2. 动态天数

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "yyyy-MM-dd 00:00:00.000",
        "subtract": 86400000
      }
    }
  }
}
```

以上过滤条件的含义为：每次任务启动时查询一天前所有字段 field 时间 0 点以后的记录，配置中时间为"yyyy-MM-dd 00:00:00",时间减少的跨度为 86400000。yyyy 为年份占位符，使用任务启动时间的年份。MM 为月份占位符，使用任务启动的月份，依次类推，还支持的占位符有 dd, hh, mm, ss, SSS

3. 输出字符串格式
  如果 field 在您的表中字段类型为字符串，您需要每天查询 field 字段大于一天前的的数据，您可以使用如下过滤条件：

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "yyyy-MM-dd 00:00:00.000",
        "subtract": 86400000,
        "toStringFormat": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```
