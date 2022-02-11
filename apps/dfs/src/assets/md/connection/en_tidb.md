## **Connection configuration help**

### **1. TiDB Installation Notes**

Please follow the instructions below to ensure that the TiDB database is successfully added and used in Tapdata.

### **2. Supported version**
TiDB 5.x

### **3. Prerequisites (as source)**
Assign select permission to a database
```
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';
```
For global permissions
```
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'user' IDENTIFIED BY 'password';
```
###  **4. Prerequisites (as a goal)**
Grant all permissions to a database
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';
```
For global permissions
```
GRANT PROCESS ON *.* TO 'user' IDENTIFIED BY 'password';
```
