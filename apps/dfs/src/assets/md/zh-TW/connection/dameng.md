# DM數據庫連接配置幫助



### 1.DM配置說明

請遵循以下說明以確保在 Tapdata 中成功添加和使用 DM 數據庫。

### 2.支持版本

DM7、DM8

### 3.先決條件

#### 3.1作為目標

```sql
#創建用戶
create user <username> identified by "password" limit password_life_time unlimited default tablespace <tablespace>;
#給用戶授權
grant select any table,insert any table,delete any table,update any table,create any table, create any index to <username>;
```

> **注意**：以上只是基本權限的設置，實際場景可能更加複雜
