## **連接配置幫助**

### **1. TiDB 安裝說明**

請遵循以下說明以確保在 Tapdata 中成功添加和使用 TiDB 數據庫。

### **2. 支持版本**
TiDB 5.x

### **3. 先決條件（作為源）**
對於某個數據庫賦於select權限
```
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';
```
對於全局的權限
```
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'user' IDENTIFIED BY 'password';
```
###  **4. 先決條件（作為目標）**
對於某個數據庫賦於全部權限
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';
```
對於全局的權限
```
GRANT PROCESS ON *.* TO 'user' IDENTIFIED BY 'password';
```
