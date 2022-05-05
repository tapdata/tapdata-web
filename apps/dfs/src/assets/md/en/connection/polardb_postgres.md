## **Connection configuration help**
### **1. PolarDB Postgres Installation Instructions**
Follow the instructions below to ensure successful addition and use of the PolarDB Postgres database in Tapdata.
### **2. Supported Versions**
PolarDB Postgres 11

### **3. Prerequisites**
#### **3.1 Permissions**
##### **3.1.1 as source**
- **Initialization**<br>
````
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
````

##### **3.1.2 as target**
````
GRANT INSERT,UPDATE,DELETE,TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
````
> **Note**: The above is only the basic permission settings, the actual scene may be more complicated
