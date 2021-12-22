# ADB PostgreSQL configuration help

## 1. ADB PostgreSQL installation instructions

Please follow the instructions below to ensure that the ADB PostgreSQL database is successfully added and used in Tapdata.

ADB PostgreSQL supports both the source and the target, and only supports full synchronization when used as the source.

## 2. Supported version

6.0

## 3. As a source

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

> **Note**: The above are just basic permissions settings, the actual scene may be more complicated

## 4. As a goal

```sql
GRANT INSERT,UPDATE,DELETE,TRUNCATE ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

> **Note**: The above are just basic permissions settings, the actual scene may be more complicated
