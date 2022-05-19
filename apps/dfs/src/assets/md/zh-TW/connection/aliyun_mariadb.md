## **連接配置幫助**

### **1. Aliyun RDS for MariaDB 安裝說明**

請遵循以下說明以確保在 Tapdata 中成功添加和使用MariaDB數據庫。

### **2. 支持版本**
MariaDB 10.x

### **3. 先決條件（作為源）**
#### **3.1 開啟 Binlog**
- 必須開啟 MariaDB 的 binlog ，Tapdata 才能正常完成同步工作。
- 級連刪除（CASCADE DELETE），這類由數據庫產生的刪除不會記錄在binlog內，所以不被支持。
  修改 `$MYSQL_HOME/mysql.cnf `, 例如:
```
server_id         = 223344
log_bin           = mysql-bin
expire_logs_days  = 1
binlog_format     = row
```
配置解釋：<br>
server-id: 對於 MariaDB 中的每個服務器和復制客戶端必須是唯一的<br>
binlog_format：必須設置為 row 或者 ROW<br>
expire_logs_days：二進制日誌文件保留的天數，到期會自動刪除<br>
log_bin：binlog 序列文件的基本名稱<br>

#### **3.2 重啟 MariaDB**

```
/etc/inint.d/mysqld restart
```
驗證 binlog 已啟用，請在 mysql shell 執行以下命令
```
show variables like 'binlog_format';
```
輸出的結果中，format value 應該是"ROW"

#### **3.3 創建MariaDB賬號**
##### **3.3.1 10.x版本**
```
create user 'username'@'localhost' identified by 'password';
```

#### **3.4 給 tapdata 賬號授權**
對於某個數據庫賦於select權限
```
GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```
對於全局的權限
```
GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT, SUPER ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
###  **4. 先決條件（作為目標）**
對於某個數據庫賦於全部權限
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```
對於全局的權限
```
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
