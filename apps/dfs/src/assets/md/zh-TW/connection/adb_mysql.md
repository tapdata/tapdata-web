# ADB MySQL配置幫助

## 1. ADB MySQL安裝說明

請遵循以下說明以確保在 Tapdata 中成功添加和使用ADB MySQL數據庫。

需要注意的是ADB MySQL暫僅支持作為源，且只能進行全量同步。

## 2. 支持版本

3.0

## 3. 作為源

對於某個數據庫賦於全部權限

```sql
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```

對於全局的權限

```sql
GRANT SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
