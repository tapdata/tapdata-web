# ADB PostgreSQL配置幫助

## 1. ADB PostgreSQL安裝說明

請遵循以下說明以確保在 Tapdata 中成功添加和使用ADB PostgreSQL數據庫。

ADB PostgreSQL支持作為源和目標，作為源時僅支持全量同步。

## 2. 支持版本

6.0

## 3. 作為源

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

> **注意**：以上只是基本權限的設置，實際場景可能更加複雜

## 4. 作為目標

```sql
GRANT INSERT,UPDATE,DELETE,TRUNCATE ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

> **注意**：以上只是基本權限的設置，實際場景可能更加複雜
