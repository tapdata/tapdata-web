## **Connection configuration help**
### **1. Aliyun RDS for PG installation instructions**
Follow the instructions below to ensure successful addition and use of a PostgreSQL database with Tapdata.
### **2. Supported Versions**
PostgreSQL 9.4, 9.5, 9.6, 10.x, 11.x, 12 versions
### **3. CDC principle and support**
#### **3.1 CDC principle**
PostgreSQL's logical decoding feature, which first appeared in version 9.4, is a mechanism that allows to extract changes committed to the transaction log and process those changes in a user-friendly way via output plugins.
This output plugin must be installed before running the PostgreSQL server and enabled with a replication slot for clients to be able to use the changes.
#### **3.2 CDC Support**
- **Logical Decoding** (Logical Decoding): used to parse logical change events from the WAL log
- **Replication Protocol** (Replication Protocol): Provides a mechanism for consumers to subscribe (even synchronously subscribe) database changes in real time
- **snapshot export** (export snapshot): allows to export a consistent snapshot of the database (pg_export_snapshot)
- **Replication Slot** (Replication Slot): used to save consumer offsets and track subscriber progress.
  Therefore, according to the above, we need to install the logical decoder. The existing decoders are as follows:

decoder | pg version | tapdata support | output format
:------------: | :------------: |:------------:|:------- ----: |
decoderbufs|9.6+|Not supported|protobuf
wal2json|9.4+|support|json|
pgoutput|10.0+| does not support |pg log|
test_decoding|9.4+|Not supported |text|
decoder_raw|9.4+|Not supported |SQL|

### **4. Prerequisites**
#### **4.1 Modify REPLICA IDENTITY**
This property determines the fields of the log record when the data occurs `UPDATE, DELETE`
- **DEFAULT** - updates and deletes will contain the current value of the primary key column
- **NOTHING** - updates and deletes will not contain any previous values
- **FULL** - UPDATE and DELETE will contain previous values ​​of all columns
- **INDEX index name** - update and delete events will contain the previous value of the column contained in the index definition named index name
  If multiple tables are merged and synchronized, Tapdata needs to adjust this property to FULL
  Example
````
alter table '[schema]'.'[table name]' REPLICA IDENTITY FULL`
````

#### **4.2 Plugin Installation**
- [decorderbufs](https://github.com/debezium/postgres-decoderbufs)
- [Protobuf-c 1.2+](https://github.com/protobuf-c/protobuf-c)
- [protobuf ](https://blog.csdn.net/gumingyaotangwei/article/details/78936608)
- [PostGIS 2.1+](http://www.postgis.net/)
- [wal2json](https://github.com/eulerto/wal2json/blob/master/README.md)
- pgoutput (pg 10.0+)

**Installation steps**<br>
Take wal2json as an example, the installation steps are as follows<br>
Make sure "/bin" is included in the environment variable PATH<br>
````
export PATH=$PATH:<postgres installation path>/bin
````
**Install plugin**<br>
````
git clone https://github.com/eulerto/wal2json -b master --single-branch \
&& cd wal2json \
&& USE_PGXS=1 make \
&& USE_PGXS=1 make install \
&& cd .. \
&& rm -rf wal2json
````
Error message when installing plugin processing `make` command execution, encountered abnormal information similar to `fatal error: [xxx].h: No such file or directory `<br>
**reason**: missing postgresql-server-dev<br>
**Solution**: Install postgresql-server-dev, take debian system as an example<br>
````
// Version number such as: 9.4, 9.6, etc.
apt-get install -y postgresql-server-dev-<version number>
````
**Configuration file**<br>
If you are using a supported logic decoding plugin (not pgoutput ), and it is already installed, configure the server to load the plugin at startup:<br>
````
postgresql.conf
shared_preload_libraries = 'decoderbufs,wal2json'
````
Configure replication<br>
````
# REPLICATION
wal_level = logical
max_wal_senders = 1 # greater than 0 can
max_replication_slots = 1 # greater than 0
````

#### **4.3 Permissions**
##### **4.3.1 as source**
- **Initialization**<br>
````
GRANT SELECT ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
````
- **incremental**<br>
  The user needs to have the replication login permission. If the log increment function is not required, the replication permission can not be set.
````
CREATE ROLE <rolename> REPLICATION LOGIN;
CREATE USER <username> ROLE <rolename> PASSWORD '<password>';
// or
CREATE USER <username> WITH REPLICATION LOGIN PASSWORD '<password>';
````
The configuration file pg_hba.conf needs to add the following content:<br>
````
pg_hba.conf
local replication <youruser> trust
host replication <youruser> 0.0.0.0/32 md5
host replication <youruser> ::1/128 trust
````

##### **4.3.2 as target**
````
GRANT INSERT,UPDATE,DELETE,TRUNCATE
ON ALL TABLES IN SCHEMA <schemaname> TO <username>;
````
> **Note**: The above is only the basic permission settings, the actual scene may be more complicated

##### **4.4 Test Log Plugin**
> **Note**: The following operations are recommended to be performed in a POC environment
>Connect to the postgres database, switch to the database that needs to be synchronized, and create a test table
````
-- Assume that the database to be synchronized is postgres and the model is public
\c postgres

create table public.test_decode
(
  uid integer not null
      constraint users_pk
          primary key,
  name varchar(50),
  age integer,
  score decimal
)
````
You can create a test table according to your own situation<br>
- Create a slot connection, take the wal2json plugin as an example
````
select * from pg_create_logical_replication_slot('slot_test', 'wal2json')
````
- After the creation is successful, insert a piece of data into the test table<br>
- Monitor the log, check the return result, whether there is any information about the insert operation just now<br>
````
select * from pg_logical_slot_peek_changes('slot_test', null, null)
````
- After success, destroy the slot connection and delete the test table<br>
````
select * from pg_drop_replication_slot('slot_test')
drop table public.test_decode
````
#### **4.5 Exception Handling**
- **Slot cleanup**<br>
  If tapdata is interrupted due to uncontrollable exceptions (power failure, process crash, etc.), the slot connection will not be deleted from the pg master node correctly, and it will always occupy a slot connection quota. You need to manually log in to the master node and delete it.
  Query slot information
````
// Check if there is information about slot_name=tapdata
 TABLE pg_replication_slots;
````
- **delete slot node**<br>
````
select * from pg_drop_replication_slot('tapdata');
````
- **Delete operation**<br>
  When decoding with the wal2json plugin, if the source table does not have a primary key, the delete operation for incremental synchronization cannot be implemented

#### **4.6 Incremental synchronization using the last update timestamp**
##### **4.6.1 Glossary**
**schema**: Chinese is the model, pgsql has a total of 3 levels of directories, library->model->table, the <schema> character in the following command, need to fill in the model name where the table is located
##### **4.6.2 Pre-preparation (this step only needs to be done once)**
- **Create public function**
  In the database, execute the following command
````
CREATE OR REPLACE FUNCTION <schema>.update_lastmodified_column()
    RETURNS TRIGGER language plpgsql AS $$
    BEGIN
        NEW.last_update = now();
        RETURN NEW;
    END;
$$;
````
- **Create fields and triggers**
> **Note**: The following operations need to be performed once per table
Suppose the table name that needs to add last update is mytable
- **Create last_update field**
````
alter table <schema>.mytable add column last_udpate timestamp default now();
````
- **Create trigger**
````
create trigger trg_uptime before update on <schema>.mytable for each row execute procedure
    update_lastmodified_column();
````
