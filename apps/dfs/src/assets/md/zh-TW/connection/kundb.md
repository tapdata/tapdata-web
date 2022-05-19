# KunDB 配置幫助

## 1. KunDB安裝說明

請遵循以下說明以確保在 Tapdata 中成功添加和使用KunDB數據庫。

## 2. 支持版本

2.x

## 3. 作為源

KunDB作為源時暫只支持全量同步

**創建用戶**

```sql
// 創建用戶
create user 'username'@'localhost' identified with mysql_native_password by 'password';
// 修改密碼
alter user 'username'@'localhost' identified with mysql_native_password by 'password';
```

**給用戶授權**

對於某個數據庫賦於select權限

```sql
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```

對於全局的權限

```sql
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```

## 4. 作為目標

對於某個數據庫賦於全部權限

```sql
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```

對於全局的權限

```sql
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
