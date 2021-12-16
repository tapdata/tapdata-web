## **Connection configuration help**
### **1. GREENPLUM Installation Instructions**
Please follow the instructions below to ensure that Greenplum Database is successfully added and used in Tapdata.
### **2. Supported version**
Greenplum 6.x version

### **3. Prerequisites**
#### **3.1 as source**
- **Initialization**<br>
```
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```

#### **3.2 as a goal**
```
GRANT INSERT, UPDATE, DELETE, TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
```
> **Note**: The above are just basic permissions settings, the actual scene may be more complicated
