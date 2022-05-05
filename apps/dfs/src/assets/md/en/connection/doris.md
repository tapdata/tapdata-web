## **Connection configuration help**

### **1. Doris Installation Instructions**

Please follow the instructions below to ensure successful addition and use of the Doris database in Tapdata.

### **2. Supported Versions**
Doris 0.15.0

### **3. Prerequisites (as goals)**
Grant full permissions to a database
````
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
````
global permissions
````
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
````
