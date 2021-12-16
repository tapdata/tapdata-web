# DM database connection configuration help



### 1.DM configuration instructions

Please follow the instructions below to ensure that the DM database is successfully added and used in Tapdata.

### 2. Supported version

DM7, DM8

### 3. Prerequisites

#### 3.1 as a goal

```sql
#Create user
create user <username> identified by "password" limit password_life_time unlimited default tablespace <tablespace>;
#Authorize users
grant select any table,insert any table,delete any table,update any table,create any table, create any index to <username>;
```

> **Note**: The above are just basic permissions settings, the actual scene may be more complicated
