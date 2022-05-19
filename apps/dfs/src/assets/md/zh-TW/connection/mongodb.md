## **連接配置幫助**
###  **1. MONGODB安裝說明**
請遵循以下說明以確保在 Tapdata 中成功添加和使用MongoDB數據庫。
> **注意**：MongoDB 作為源端連接時，必須是副本集。
#### **2. 支持版本**
MongoDB 3.2、3.4、3.6、4.0、4.2

>**注意**：<br>
>由於 Tapdata 數據同步目前是基於 MongoDB 的 Change Stream 支持對多表合併的操作，而 MongoDB 官方是從 4.0 版本開始支持 Change Stream 的，因此，請盡量保證源端數據庫和目標端數據庫都是 4.0 及以上版本。

###  **3. 先決條件**
#### **3.1 作為源數據庫**
##### **3.1.1 基本配置**
- 源端 MongoDB 支持副本集和分片集群。
- 如果源端 MongoDB 只有一個節點，您可以將其配置為單成員的複制集，以開啟 oplog 功能。
- 您應該配置足夠的 oplog 空間。我們建議至少足以容納 24 小時的 oplog。

##### **3.1.2 帳戶權限**
如果源端 MongoDB 啟用了安全身份驗證，則 Tapdata 用於連接源端 MongoDB 的用戶帳戶必須具有以下內置角色：
```
clusterMonitor（讀取 oplog ）
readAnyDatabase
```
要創建具有上述權限的用戶，您可以參考以下示例：
```
 use admin
 db.createUser({
    "user" : "johndoe",
    "pwd"  : "my_password",
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
```
如果您不希望授予` readAnyDatabase `角色，則還可以向特定的數據庫以及 local 和 config 數據庫賦予讀取權限。例如：
```
use admin
db.createUser({
    "user" : "johndoe",
    "pwd"  : "my_password",
    "roles" : [
        {
            "role" : "clusterMonitor",
            "db" : "admin"
        },
        {
            "role" : "read",
            "db" : "my_db"
        }，
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
```
請注意，只有 MongoDB 版本 3.2 需要 local 數據庫的讀取權限。

> **重要事項**<br>
> 對於集群分片，您必須在每個分片主節點上創建適當的用戶權限。這是由於MongoDB的安全架構設計。
> 當登錄到每個單獨的分片時，分片服務器不會向config數據庫獲取用戶權限。相反，它將使用其本地用戶數據庫進行身份驗證和授權。

######  3.1.3 參考
[​MongoDB Documentation: 如何更改oplog的大小​](https://docs.mongodb.com/manual/tutorial/change-oplog-size/)<br>
[​MongoDB Documentation: 如何將單節點轉為複制集​](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)<br>

> **注意**<br>
> 如果 MongoDB URI 未設置 w=majority ，Tapdata 會使用默認的配置w=1，表示數據寫到 primary 節點後就返回了。
> 如果在數據從 primary 節點同步到 secondary 節點前，primary 節點發生異常宕機，此時就會發生數據丟失。因此建議使用 w=majority 配置。
> w=majority表示只有當數據寫到大多數節點後才會返回客戶端正確寫入。
#### **3.2. 作為目標數據庫**
#####  **3.2.1 基本配置**
- 目標端 MongoDB 支持副本集和分片集群。
- 如果您的目標端 MongoDB 只有一個節點，您可以將其配置為單成員的複制集，以開啟 oplog 功能。
- 確保為目標 MongoDB 配置了足夠的資源來處理源數據庫的工作負載。

#####  **3.2.2 帳戶權限**
如果目標 MongoDB 啟用了安全身份驗證，則 Tapdata 使用的用戶帳戶必須具有以下角色 / 權限：
- `clusterMonitor`（數據驗證功能需要使用）
- `readWrite`（作為目標數據庫需要擁有的角色）
  要創建具有以上權限的用戶，您可以參考以下示例：
```
> use admin
> db.createUser({
    "user" : "johndoe",
    "pwd"  : "my_password",
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
```
> **注意**：只有 MongoDB 版本 3.2 需要 local 數據庫的讀取權限。

### **4. 同步 MongoDB 集群**
當使用 MongoDB 集群作為源庫時，Tapdata 會為每個分片創建一個線程，以直接從分片主節點（或次節點）讀取數據。 <br>
為提高負載性能，我們認為有必要使用這種多線程並行的設計方案。但是需要注意的是，這種方法的副作用是可能會在源集群庫中產生孤立文檔。孤立文檔是當 MongoDB 發生自動數據遷移所導致的。 <br>
要解決此問題，建議在使用 MongoDB 集群作為源庫同步前，完成以下任務：<br>
- **停止平衡器**<br>
  有關停止平衡器的詳細說明，請參閱:<br>
  [​MongoDB Documentation: 如何停止平衡器​](https://docs.mongodb.com/manual/reference/method/sh.stopBalancer/)
- **使用cleanOrphan命令,請參閱**<br>
  [​MongoDB Documentation: 如何清理孤兒文檔​](https://docs.mongodb.com/manual/reference/command/cleanupOrphaned/)

### **5. MongoDB TLS/SSL配置**
- **啟用TLS/SSL**<br>
  請在左側配置頁的 “使用TLS/SSL連接”中選擇“是”項進行配置<br>
- **設置MongoDB PemKeyFile**<br>
  點擊“選擇文件”，選擇證書文件，若證書文件有密碼保護，則在“私鑰密碼”中填入密碼<br>
- **設置CAFile**<br>
  請在左側配置頁的 “驗證服務器證書”中選擇“是”<br>
  然後在下方的“認證授權”中點擊“選擇文件”<br>
