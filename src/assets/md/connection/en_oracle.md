## **Connection configuration help**
### **1. ORACLE Installation Instructions**
Please follow the instructions below to ensure that the Oracle database is successfully added and used in Tapdata. Note: Oracle real-time synchronization is based on Oracle Redo Log, so certain configurations need to be performed in advance.
### **2. Prerequisites (as source)**
#### **2.1 Open LogMiner**
- Log in to the database as a user with DBA authority
- View the logging mode of the database: `select log_mode from v$database;`
- If the returned result is ARCHIVELOG, you can skip directly to Enable Supplemental Logging
- If the returned result is NOARCHIVELOG, continue to follow the steps below:
- Shut down the database: `shutdown immediate;`
- Start and mount the database: `startup mount;`
- Open the archive and open the database:<br>
```
alter database archivelog;
alter database open;
```

#### **2.2 Enable Supplemental Logging**
##### **2.2.1 Oracle 9i**<br>
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
##### **2.2.2 Oracle 10g, 11g**<br>
```
alter database add supplemental log data;
alter system switch logfile;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
##### **2.2.3 Oracle 12C special configuration method**<br>
Use the following command to confirm whether supplemental logging is enabled<br>
```
SELECT supplemental_log_data_min, supplemental_log_data_pk, supplemental_log_data_all FROM v$database;
```
If the three returned columns are Yes or Implicit, it means that identification key logging and full supplemental logging have been enabled at the same time, and you can skip to Create User Account<br>
If the first two columns returned are Yes or Implicit, it means that only identification key logging is enabled. If this can meet your needs, you can skip to creating a user account<br>
##### **2.2.4 Enable identification key (identification key log)**<br>
When using a 12c PDB, the best practice is to enable logging for the container table, not for the entire database. You can first apply the changes to the container using the following command:<br>
```
ALTER SESSION SET CONTAINER=<pdb>;
```
Turn on the identification key (identification key log) for a single table:
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER TABLE <schema name>.<table name> ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
Open the identification key (identification key log) for all tables:
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
##### **2.2.5 Enable full supplemental logging** <br>
To enable full supplemental logging for a single table:
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER TABLE <schema name>.<table name> ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
Enable full supplemental logging for all tables:
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
Submit the changed configuration:
```
ALTER SYSTEM SWITCH LOGFILE;
```

#### **2.3 Create User Account**
##### **2.3.1 Oracle 10g, 11g**<br>
Create user accounts and assign permissions<br>
```
CREATE USER <user name> IDENTIFIED BY <password>;
GRANT create session, alter session, execute_catalog_role, select any dictionary, select any transaction, select any table, create any table, create any index, unlimited tablespace to <user name>;
```
##### **2.3.2 Oracle 12c multitenant databases**<br>
To create a user in the multi-tenant environment of Oracle 12c, it must be created in cdb, and the naming format convention is: `c##<name>`<br>
Log in to the database as a user with DBA authority<br>
Create a normal user:<br>
```
ALTER SESSION SET CONTAINER=cdb$root;
CREATE USER <user name> IDENTIFIED BY <password> CONTAINER=all;
GRANT create session, alter session, set container, select any dictionary, select any transaction, logmining, execute_catalog_role, create any table, create any index, unlimited tablespace TO <username> CONTAINER=all;
ALTER SESSION SET CONTAINER=<pdb>;
```
According to your permission requirements for the table, repeat the last command to grant select permission. <br>
When you configure the source library connection, please use this user to pass JDBC authentication. Note that the entire user name (including "c ##") must be used as the user name for the JDBC connection. <br>
##### **2.3.3 Oracle 12c standard databases**<br>
In Oracle 12c standard mode, the permissions necessary to create a user:<br>
Log in to the database as a user with DBA authority<br>
Create a normal user:<br>
```
CREATE USER <user name> IDENTIFIED BY <password>;
GRANT create session, alter session, select any dictionary, select any transaction, logmining, execute_catalog_role, create any table, create any index, unlimited tablespace TO <username>;
```
According to your permission requirements for the table, repeat the last command to grant select permission. <br>
#### **2.4 Known Issues**
##### **Oracle's connection_time**
The connect_time parameter will automatically disconnect the timeout session. By default, it is unlimited.
After setting this setting, real-time synchronization of Tapdata may not work properly. To check the set value, you can use the following command:
```
select resource_name, limit from dba_profiles where profile=( select profile from dba_users where username ='<username>');
```
