## **Connection configuration help**

### **1. ClickHouse Installation Instructions**

Please follow the instructions below to ensure that the ClickHouse database is successfully added and used in Tapdata.

### **2. Supported version**
ClickHouse v21.x

### **3. Field description is not supported**
ClickHouse does not support binary related field types. If there are related fields in your source table, you can delete them in the field mapping settings, otherwise the task may not run normally.
