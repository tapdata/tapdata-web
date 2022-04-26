# KunDB configuration help

## 1. KunDB installation instructions

Please follow the instructions below to ensure that the KunDB database is successfully added and used in Tapdata.

## 2. Supported version

2.x

## 3. As a source

When KunDB is used as the source, only full synchronization is supported temporarily

**Create User**

```sql
// Create user
create user'username'@'localhost' identified with mysql_native_password by'password';
// change Password
alter user'username'@'localhost' identified with mysql_native_password by'password';
```

**Authorize users**

Assign select permission to a database

```sql
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO'tapdata' IDENTIFIED BY'password';
```

For global permissions

```sql
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO'tapdata' IDENTIFIED BY'password';
```

## 4. As a goal

Grant all permissions to a database

```sql
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO'tapdata' IDENTIFIED BY'password';
```

For global permissions

```sql
GRANT PROCESS ON *.* TO'tapdata' IDENTIFIED BY'password';
```
