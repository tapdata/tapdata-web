## **連接配置幫助**

### **1. 維格表 限制**
發送API請求時，你需要注意一下兩種限制：頻率限制和用量限制

請遵循以下限制以確保在 Tapdata 中成功添加和使用維格表。

### **1.1 頻率限制**
同一個用戶對同一張表的API請求頻率上線為 5 次/秒

請求頻率超過限制時，會提示錯誤操作太頻繁（錯誤狀態碼 429 ）

### **1.2 用量限制**
用量限制包含兩種：一是API用量的限制；二是空間站資源用量的限制

青銅級和白銀級空間站每月可免費調用 10000 次API，累計用量每月賬單日清零

公測階段，你可以創建做多 1000 張維格表。單個維格表做多支持創建 50000 行記錄、200個字段、30個視圖

單個空間站上傳附件的容量上限為 1 GB