## **連接配置幫助**

### **1. Doris 安裝說明**

請遵循以下說明以確保在 Tapdata 中成功添加和使用Doris數據庫。

### **2. 支持版本**
Doris 0.15.0 \
暫時不支持無主鍵同步

###  **3. 先決條件（作為目標）**
對於某個數據庫賦於全部權限
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```
對於全局的權限
```
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
