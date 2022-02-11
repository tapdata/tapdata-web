# DM数据库连接配置帮助



### 1.DM配置说明

请遵循以下说明以确保在 Tapdata 中成功添加和使用 DM 数据库。

### 2.支持版本

DM7、DM8

### 3.先决条件

#### 3.1作为目标

```sql
#创建用户
create user <username> identified by "password" limit password_life_time unlimited default tablespace <tablespace>;
#给用户授权
grant select any table,insert any table,delete any table,update any table,create any table, create any index to <username>;
```

> **注意**：以上只是基本权限的设置，实际场景可能更加复杂

