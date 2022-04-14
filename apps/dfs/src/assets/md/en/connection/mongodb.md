## **Connection configuration help**
### **1. MONGODB installation instructions**
Please follow the instructions below to ensure that the MongoDB database is successfully added and used in Tapdata.
> **Note**: When MongoDB is connected as the source, it must be a replica set.
#### **2. Supported version**
MongoDB 3.2, 3.4, 3.6, 4.0, 4.2

>**Note**:<br>
>Since Tapdata data synchronization is currently based on MongoDB's Change Stream to support multi-table merging operations, and MongoDB officially supports Change Stream from version 4.0, please try to ensure that the source and target databases are both 4.0 and above Version.

### **3. Prerequisites**
#### **3.1 As the source database**
##### **3.1.1 Basic Configuration**
- The source MongoDB supports replica sets and sharded clusters.
- If the source MongoDB has only one node, you can configure it as a single-member replica set to enable the oplog function.
- You should configure enough oplog space. We recommend at least enough oplog for 24 hours.

##### **3.1.2 Account permissions**
If the source MongoDB has secure authentication enabled, the user account used by Tapdata to connect to the source MongoDB must have the following built-in roles:
```
clusterMonitor (read oplog)
readAnyDatabase
```
To create a user with the above permissions, you can refer to the following example:
```
 use admin
 db.createUser({
    "user": "johndoe",
    "pwd": "my_password",
    "roles": [
        {
            "role": "clusterMonitor",
            "db": "admin"
        },
        {
            "role": "readAnyDatabase",
            "db": "admin"
        }
    ]
}
```
If you don't want to grant the `readAnyDatabase` role, you can also grant read permissions to specific databases and local and config databases. For example:
```
use admin
db.createUser({
    "user": "johndoe",
    "pwd": "my_password",
    "roles": [
        {
            "role": "clusterMonitor",
            "db": "admin"
        },
        {
            "role": "read",
            "db": "my_db"
        },
        {
            "role": "read",
            "db": "local"
        },
        {
            "role": "read",
            "db": "config"
        }
    ]
}
```
Please note that only MongoDB version 3.2 requires read access to the local database.

> **Important Items**<br>
> For cluster shards, you must create appropriate user permissions on the master node of each shard. This is due to the security architecture design of MongoDB.
> When logging in to each individual shard, the shard server will not obtain user permissions from the config database. Instead, it will use its local user database for authentication and authorization.

###### 3.1.3 Reference
[​MongoDB Documentation: How to change the size of oplog​](https://docs.mongodb.com/manual/tutorial/change-oplog-size/)<br>
[​MongoDB Documentation: How to convert a single node to a replica set​](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)<br>

> **Attention**<br>
> If the MongoDB URI does not set w=majority, Tapdata will use the default configuration w=1, which means that the data will be returned after being written to the primary node.
> If the primary node fails abnormally before the data is synchronized from the primary node to the secondary node, data loss will occur at this time. Therefore, it is recommended to use w=majority configuration.
> w=majority means that only when the data is written to most nodes will it be returned to the client for correct writing.
#### **3.2. As the target database**
##### **3.2.1 Basic Configuration**
- The target MongoDB supports replica sets and sharded clusters.
- If your target MongoDB has only one node, you can configure it as a single-member replica set to enable the oplog function.
- Ensure that sufficient resources are configured for the target MongoDB to handle the workload of the source database.

##### **3.2.2 Account permissions**
If the target MongoDB has secure authentication enabled, the user account used by Tapdata must have the following roles/privileges:
- `clusterMonitor` (required for data verification function)
- `readWrite` (a role that the target database needs to have)
To create a user with the above permissions, you can refer to the following example:
```
> use admin
> db.createUser({
    "user": "johndoe",
    "pwd": "my_password",
    "roles": [
        {
            "role": "clusterMonitor",
            "db": "admin"
        },
        {
            "role": "readWrite",
            "db": "my_db"
        },
        {
            "role": "read",
            "db": "local"
        }
    ]
}
```
> **Note**: Only MongoDB version 3.2 requires the read permission of the local database.

### **4. Synchronize MongoDB cluster**
When using a MongoDB cluster as the source library, Tapdata will create a thread for each shard to directly read data from the shard primary node (or secondary node). <br>
In order to improve load performance, we think it is necessary to use this multi-threaded parallel design. However, it should be noted that the side effect of this method is that orphaned documents may be generated in the source cluster library. Orphaned documents are caused by automatic data migration in MongoDB. <br>
To solve this problem, it is recommended to complete the following tasks before using the MongoDB cluster as the source database for synchronization:<br>
- **Stop balancer**<br>
For detailed instructions on stopping the balancer, please refer to:<br>
[​MongoDB Documentation: How to Stop the Balancer​](https://docs.mongodb.com/manual/reference/method/sh.stopBalancer/)
- **Use the cleanOrphan command, please refer to **<br>
[​MongoDB Documentation: How to Clean Up Orphaned Documents​](https://docs.mongodb.com/manual/reference/command/cleanupOrphaned/)

### **5. MongoDB TLS/SSL configuration**
- **Enable TLS/SSL**<br>
Please select "Yes" in the "Use TLS/SSL connection" on the left configuration page to configure<br>
- **Set MongoDB PemKeyFile**<br>
Click "Select File", select the certificate file, if the certificate file is password protected, fill in the password in the "Private Key Password"<br>
- **Set CAFile**<br>
Please select "Yes" in "Verify Server Certificate" on the left configuration page<br>
Then click "Choose File" in the "Authentication and Authorization" below<br>
