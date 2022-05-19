## **連接配置幫助**
### **1. PolarDB Postgres 安裝說明**
請遵循以下說明以確保在 Tapdata 中成功添加和使用 PolarDB Postgres 數據庫。
### **2. 支持版本**
PolarDB Postgres 11

### **3. 先決條件**
#### **3.1 權限**
##### **3.1.1 作為源**
- **初始化**<br>
```
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

##### **3.1.2 作為目標**
```
GRANT INSERT,UPDATE,DELETE,TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```
> **注意**：以上只是基本權限的設置，實際場景可能更加複雜
