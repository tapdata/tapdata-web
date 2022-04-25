## **连接配置帮助**
### **1. PolarDB Postgres 安装说明**
请遵循以下说明以确保在 Tapdata 中成功添加和使用 PolarDB Postgres 数据库。
### **2. 支持版本**
PolarDB Postgres 11

### **3. 先决条件**
#### **3.1 权限**
##### **3.1.1 作为源**
- **初始化**<br>
```
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

##### **3.1.2 作为目标**
```
GRANT INSERT,UPDATE,DELETE,TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```
> **注意**：以上只是基本权限的设置，实际场景可能更加复杂