## **Connection configuration help**
### **1. TencentDB for SQLServer installation instructions**
Please follow the instructions below to ensure successful addition and use of a SQL Server database in Tapdata. By default, SQL Server incremental replication is not enabled. In order to perform change data capture on SQL Server, incremental replication must be explicitly enabled by the administrator beforehand.
> **NOTE**: <br>
> You must be logged in to SQLServer Management Studio or sqlcmd as a member of sysadmin.
> Incremental replication is a supported feature of SQL Server 2008 and later.
> Make sure the SQL Agent task is started (in the bottom left corner of SQLServer Management Studio)
### **2. Supported Versions**
SQL Server 2005, 2008, 2008 R2, 2012, 2014, 2016, 2017
### **3. Prerequisites**
#### **3.1 Enable Sql Server Database Agent Service**
- **Look for the mssql-conf tool**
````
find / -name mssql-conf
````
- **Enable proxy service**
````
mssql-conf set sqlagent.enabled true
````

#### **3.2 Enable database incremental replication**
- **Database Enable Incremental Replication**<br>
````
use [database name]
go
EXEC sys.sp_cdc_enable_db
go
````
where `[database name]` is the database for which incremental replication is to be enabled. <br>
- **Check if the database is enabled for incremental replication**<br>
````
SELECT [name], database_id, is_cdc_enabled
FROM sys.databases
WHERE [name] = N'[database name]'
go
````
where `[database name]` is the database you want to replicate. <br>

#### **3.3 Table enable incremental replication**
- **Enable incremental replication**
````
use<database name>
go
EXEC sys.sp_cdc_enable_table
@source_schema = N'[Schema]',
@source_name = N'[Table]',
@role_name = N'[Role]'
go
````
illustrate:
- `<Schema>` like `dbo`.
- `<Table>` is the name of the data table (without schema ).
- `<Role>` is the role that can access the changed data. Set it to `NULL` if you don't want to use the gated role.
> **NOTE**:
> If "\" is specified when enabling incremental replication, you must ensure that the database username provided to Tapdata has the appropriate role so that Tapdata can access the incremental replication tables.
- Check if incremental replication is enabled for the table<br>
````
use <database name>
go
SELECT [name],is_tracked_by_cdc
FROM sys.tables
WHERE [name] = N'[table]'
go
````
- **CDC table after executing DDL**<br>
  If the CDC table performs DDL operations of adding, deleting, and modifying fields, the following operations must be performed. Otherwise, during the incremental synchronization process, data may be out of synchronization or an error may occur<br>
  **- need to disable CDC for this table**<br>
```use<database name>
go
EXEC sys.sp_cdc_disable_table
@source_schema = N'[Schema]',
@source_name = N'[Table]',
@capture_instance = N'[Schema_Table]'
go
// capture_instance is generally spliced ​​in the format of schema_table. You can query the actual value through the following command
exec sys.sp_cdc_help_change_data_capture
@source_schema = N'[Schema]',
@source_name = N'[Table]';
````
**- Re-enable CDC**<br>
````
use<database name>
go
EXEC sys.sp_cdc_enable_table
@source_schema = N'[Schema]',
@source_name = N'[Table]',
@role_name = N'[Role]'
go
````

#### **3.4 CDC prior to 2008**
MSSQL provides CDC support starting with SQLServer 2008. For earlier versions, the "**custom sql**" feature had to be used to simulate change data capture. Here are a few things to consider when copying data from older versions:<br>
- The source table must have a change tracking column, such as `LAST_UPDATED_TIME`, which is updated every time a record is inserted or updated. <br>
- In the task setting interface<br>
>Make sure to select only **INITIAL_SYNC** as **CDC** is not supported<br>
> Set "**Repeatedly run custom SQL**" to **True**. This will result in repeated execution of custom SQL. <br>
- Provide proper custom SQL on mapping design<br>
