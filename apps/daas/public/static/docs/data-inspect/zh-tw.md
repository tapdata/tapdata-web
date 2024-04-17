## TimeUpdate

### $dynamicDate

#### 函數說明

校驗任務過濾條件中時間參數自動根據配寘做值更新，現時該函數僅支持 Mongo。 改内容包含的參數有：

- customFormat: 字串類型，非必填項，需要自動轉換的時間格式字串，可動態使用預留位置組合，時間格式需要時標準的日期格式：yyyy-MM-dd HH:mm:ss.SSS ，默認為任務運行當前時間
- subtract: 整數類型（組織毫秒），非必填項，正數表示基於 format 值减少的時間毫秒數
- toStringFormat: 字串類型，時間輸出格式，非必填項，語義為是否將最終結果輸出為時間格式字串，例如：值為：yyyy-MM-dd hh:mm:ss, 則按此格式輸出時間字串，值為 null 或不填表示輸出為時日期對象等價於 $date

#### 案例參考

1. 固定時間

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

以上過濾條件的含義為：査詢所有欄位 field 時間大於“2023-03-19 04:00:00”的記錄，配寘中時間為“2023-03-19 05:00:00”，時間减少的跨度為 3600000

2. 動態天數

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

以上過濾條件的含義為：每次任務啟動時査詢一天前所有欄位 field 時間 0 點以後的記錄，配寘中時間為“yyyy-MM-dd 00:00:00”，時間减少的跨度為 86400000。 yyyy 為年份預留位置，使用任務啟動時間的年份。 MM 為月份預留位置，使用任務啟動的月份，依次類推，還支持的預留位置有 dd，hh，mm，ss，SSS

3.  輸出字串格式
  如果 field 在您的錶中欄位類型為字串，您需要每天査詢 field 欄位大於一天前的的數據，您可以使用如下過濾條件：

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
