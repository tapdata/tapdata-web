## **Connection configuration help**
### **1. Aliyun MongoDB Installation Instructions**
Follow the instructions below to ensure successful addition and use of a MongoDB database in Tapdata.
> **Note**: When MongoDB is connected as a source, it must be a replica set.
#### **2. Supported Versions**
MongoDB 3.2, 3.4, 3.6, 4.0, 4.2

>**NOTE**:<br>
>Since Tapdata data synchronization is currently based on MongoDB's Change Stream, which supports the operation of merging multiple tables, and MongoDB officially supports Change Stream from version 4.0, please try to ensure that both the source database and the target database are 4.0 and above Version.

### **3. Prerequisites**
#### **3.1 as source database**
##### **3.1.1 Basic Configuration**
- The source MongoDB supports replica sets and sharded clusters.
- If the source MongoDB has only one node, you can configure it as a single-member replica set to enable the oplog function.
- You should configure enough oplog space. We recommend at least enough oplog for 24 hours.

##### **3.1.2 Account Privileges**
If the origin MongoDB has secure authentication enabled, the user account that Tapdata uses to connect to the origin MongoDB must have the following built-in roles:
````
clusterMonitor (read oplog )
readAnyDatabase
````
To create a user with the above permissions, you can refer to the following example:
````
 use admin
 db.createUser({
    "user" : "johndoe",
    "pwd" : "my_password",
    "roles" : [
        {
            "role" : "clusterMonitor",
            "db" : "admin"
        },
        {
            "role" : "readAnyDatabase",
            "db" : "admin"
        }
    ]
}
````
If you do not wish to grant the `readAnyDatabase` role, you can also grant read permissions to specific databases as well as the local and config databases. E.g:
````
use admin
db.createUser({
    "user" : "johndoe",
    "pwd" : "my_password",
    "roles" : [
        {
            "role" : "clusterMonitor",
            "db" : "admin"
        },
        {
            "role" : "read",
            "db" : "my_db"
        },
        {
            "role" : "read",
            "db" : "local"
        },
        {
            "role" : "read",
            "db" : "config"
        }
    ]
}
````
Note that only MongoDB version 3.2 requires read access to the local database.

> **IMPORTANT**<br>
> For cluster shards, you must create the appropriate user permissions on each shard master node. This is due to the security architecture design of MongoDB.
> When logging into each individual shard, the shard server does not obtain user permissions from the config database. Instead, it will use its local user database for authentication and authorization.

###### 3.1.3 References
[​MongoDB Documentation: How to Change the Oplog Size​](https://docs.mongodb.com/manual/tutorial/change-oplog-size/)<br>
[​MongoDB Documentation: How to Convert a Single Node to a Replica Set​](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)<br>

> **NOTE**<br>
> If the MongoDB URI does not set w=majority , Tapdata will use the default configuration w=1, which means that the data is returned after it is written to the primary node.
> If the primary node goes down abnormally before the data is synchronized from the primary node to the secondary node, data loss will occur. Therefore it is recommended to use the w=majority configuration.
> w=majority means that only when the data is written to most nodes will it return to the client to write correctly.
#### **3.2. As the target database**
##### **3.2.1 Basic Configuration**
- The target MongoDB supports replica sets and sharded clusters.
- If your target MongoDB has only one node, you can configure it as a single-member replica set to enable the oplog function.
- Make sure that the target MongoDB is configured with sufficient resources to handle the workload of the source database.

##### **3.2.2 Account Privileges**
If the target MongoDB has secure authentication enabled, the user account used by Tapdata must have the following roles/permissions:
- `clusterMonitor` (required for data validation)
- `readWrite` (required role as the target database)
  To create a user with the above permissions, you can refer to the following example:
````
> use admin
> db.createUser({
    "user" : "johndoe",
    "pwd" : "my_password",
    "roles" : [
        {
            "role" : "clusterMonitor",
            "db" : "admin"
        },
        {
            "role" : "readWrite",
            "db" : "my_db"
        },
        {
            "role" : "read",
            "db" : "local"
        }
    ]
}
````
> **Note**: Only MongoDB version 3.2 requires read access to the local database.

### **4. Sync MongoDB cluster**
When using a MongoDB cluster as the source repository, Tapdata creates a thread per shard to read data directly from the shard primary (or secondary). <br>
To improve load performance, we believe it is necessary to use this multi-threaded parallel design. Note, however, that a side effect of this approach is the possibility of orphaned documents in the source cluster repository. Orphaned documents are caused when MongoDB undergoes automatic data migration. <br>
To resolve this issue, it is recommended to complete the following tasks before using a MongoDB cluster as the source for synchronization:<br>
- **Stop Balancer**<br>
  For detailed instructions on stopping the balancer, see:<br>
  [​MongoDB Documentation: How to Stop the Balancer​](https://docs.mongodb.com/manual/reference/method/sh.stopBalancer/)
- **Use the cleanOrphan command, see **<br>
  [​MongoDB Documentation: How to Cleanup Orphaned Documents​](https://docs.mongodb.com/manual/reference/command/cleanupOrphaned/)

### **5. MongoDB TLS/SSL Configuration**
- **Enable TLS/SSL**<br>
  Please select "Yes" in "Use TLS/SSL connection" on the left configuration page to configure<br>
- **Set MongoDB PemKeyFile**<br>
  Click "Select File", select the certificate file, if the certificate file is password protected, fill in the password in "Private key password"<br>
- **SET CAFile**<br>
  Please select "Yes" in "Verify Server Certificate" on the left configuration page<br>
  Then click "Select File" in "Authentication and Authorization" below<br>
