# ADB MySQL configuration help

## 1. ADB MySQL installation instructions

Please follow the instructions below to ensure that the ADB MySQL database is successfully added and used in Tapdata.

It should be noted that ADB MySQL only supports as a source for the time being, and can only perform full synchronization.

## 2. Supported version

3.0

## 3. As a source

Grant all permissions to a database

```sql
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO'tapdata' IDENTIFIED BY'password';
```

For global permissions

```sql
GRANT SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO'tapdata' IDENTIFIED BY'password';
```
