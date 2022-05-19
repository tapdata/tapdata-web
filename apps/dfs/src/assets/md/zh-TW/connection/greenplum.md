## **連接配置幫助**
### **1. GREENPLUM安裝說明**
請遵循以下說明以確保在 Tapdata 中成功添加和使用Greenplum數據庫。
### **2. 支持版本**
Greenplum 6.x 版本

### **3. 先決條件**
#### **3.1 作為源**
- **初始化**<br>
```
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

#### **3.2 作為目標**
```
GRANT INSERT,UPDATE,DELETE,TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```
> **注意**：以上只是基本權限的設置，實際場景可能更加複雜
