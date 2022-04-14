# KunDB 配置帮助

## 1. KunDB安装说明

请遵循以下说明以确保在 Tapdata 中成功添加和使用KunDB数据库。

## 2. 支持版本

2.x

## 3. 作为源

KunDB作为源时暂只支持全量同步

**创建用户**

```sql
// 创建用户
create user 'username'@'localhost' identified with mysql_native_password by 'password';
// 修改密码
alter user 'username'@'localhost' identified with mysql_native_password by 'password';
```

**给用户授权**

对于某个数据库赋于select权限

```sql
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```

对于全局的权限

```sql
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```

## 4. 作为目标

对于某个数据库赋于全部权限

```sql
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```

对于全局的权限

```sql
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```

