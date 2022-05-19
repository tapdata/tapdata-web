## **連接配置幫助**
### **1. ORACLE 安裝說明**
請遵循以下說明以確保在 Tapdata 中成功添加和使用Oracle數據庫，注意：Oracle 實時同步基於Oracle Redo Log，因此需要提前執行某些配置。
### **2. 先決條件（作為源）**
#### **2.1 開啟 LogMiner**
- 以具有 DBA 權限的用戶身份登錄數據庫
- 查看數據庫的 logging mode :`select log_mode from v$database;`
- 如果返回的結果是 ARCHIVELOG , 您可以直接跳到 開啟 Supplemental Logging
- 如果返回的結果是 NOARCHIVELOG , 繼續按照以下步驟操作:
- 關閉數據庫: `shutdown immediate;`
- 啟動並掛載數據庫:` startup mount;`
- 開啟存檔並打開數據庫:<br>
```
alter database archivelog;
alter database open;
```

#### **2.2 開啟 Supplemental Logging**
##### **2.2.1 Oracle 9i**<br>
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
##### **2.2.2 Oracle 10g、11g**<br>
```
alter database add supplemental log data;
alter system switch logfile;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
##### **2.2.3 Oracle 12C 的特殊配置方法**<br>
使用以下命令，確認 supplemental logging 是否開啟<br>
```
SELECT supplemental_log_data_min, supplemental_log_data_pk, supplemental_log_data_all FROM v$database;
```
如果返回的三列都是 Yes 或者 Implicit ，則表示 identification key logging(標識鍵日誌)和 full supplemental logging（全補充日誌）已同時開啟，您可以跳到 創建用戶賬號<br>
如果返回的前兩列是 Yes 或者 Implicit ，則表示只開啟了 identification key logging(標識鍵日誌)。如果這個能滿足您的需求，則可以跳到創建用戶賬號<br>
##### **2.2.4 開啟 identification key(標識鍵日誌)**<br>
當使用 12c 的 PDB 時，最佳做法是為容器的表開啟日誌，而不是對整個數據庫開啟日誌。您可以先使用以下命令將更改應用於容器：<br>
```
ALTER SESSION SET CONTAINER=<pdb>;
```
為單個表開啟identification key(標識鍵日誌)：
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER TABLE <schema name>.<table name> ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
對所有表開啟identification key(標識鍵日誌)：
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
```
##### **2.2.5 開啟 full supplemental logging（全補充日誌）** <br>
單表開啟full supplemental logging（全補充日誌）：
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER TABLE <schema name>.<table name> ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
所有表開啟full supplemental logging（全補充日誌）：
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
```
提交更改的配置：
```
ALTER SYSTEM SWITCH LOGFILE;
```

#### **2.3 創建用戶賬號**
##### **2.3.1 Oracle 10g、11g**<br>
創建用戶帳戶並分配權限<br>
```
CREATE USER <user name> IDENTIFIED BY <password>;
GRANT create session, alter session, execute_catalog_role, select any dictionary, select any transaction, select any table, create any table, create any index, unlimited tablespace to <user name>;
```
##### **2.3.2 Oracle 12c multitenant databases**<br>
在 Oracle 12c 的多租戶環境下創建用戶，必須在 cdb 中創建，並且命名格式約定為：`c##<name>`<br>
以具有 DBA 權限的用戶身份登錄數據庫<br>
創建普通用戶:<br>
```
ALTER SESSION SET CONTAINER=cdb$root;
CREATE USER <user name> IDENTIFIED BY <password> CONTAINER=all;
GRANT create session, alter session, set container, select any dictionary, select any transaction, logmining, execute_catalog_role, create any table, create any index, unlimited tablespace TO <username> CONTAINER=all;
ALTER SESSION SET CONTAINER=<pdb>;
```
根據您對錶的權限需求，重複執行最後一個命令來賦予 select 權限。 <br>
當您配置的是源庫連接時，請使用此用戶來通過 JDBC 的身份驗證。注意必須使用整個用戶名（包括“c ##”）作為JDBC連接的用戶名。 <br>
##### **2.3.3 Oracle 12c standard databases**<br>
在 Oracle 12c 標準模式下，創建一個用戶所必須的權限：<br>
以具有DBA權限的用戶身份登錄數據庫<br>
創建普通用戶:<br>
```
CREATE USER <user name> IDENTIFIED BY <password>;
GRANT create session, alter session, select any dictionary, select any transaction, logmining, execute_catalog_role, create any table, create any index, unlimited tablespace TO <username>;
```
根據您對錶的權限需求，重複執行最後一個命令來賦予 select 權限。 <br>
#### **2.4 已知問題**
##### **Oracle 的 connection_time**
connect_time  參數將自動斷開超時的會話。默認情況下，它是無限的。
設置此設置後，Tapdata 的實時同步可能無法正常工作。要檢查設置的值，可以使用以下命令：
```
select resource_name, limit from dba_profiles where profile=( select profile from dba_users where username = '<username>');
```
