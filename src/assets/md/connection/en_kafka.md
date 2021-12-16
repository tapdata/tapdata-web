## **Connection configuration instructions**

### **1. KAFKA Installation Instructions**
Please follow the instructions below to ensure that the Kafka database is successfully added and used in Tapdata.

### **2. Restrictions on use**
>- Only the message format of JSON Object string is supported (e.g. `{"id":1, "name": "张三"}`)
>- Create a theme in advance
>- Kafka version 2.3.x
>- If you choose to ignore consumption or push exceptions, the `offset` of these messages will still be recorded, that is, these messages will not be pushed later, and there is a risk of data loss
>- The message push is implemented as `At least once`, and the corresponding consumer must do an idempotent operation

#### **2.1 Sync Mode**

##### **Only full amount**
> In this mode, Source will start subscription consumption from each partition of the topic `earliest offset`. If there is a message consumption record before, it will be restored to the previous `offset` to start consumption

##### **Incremental only**
> In this mode, Source will start subscription consumption from each partition of the topic `latest offset`. If there is a message consumption record before, it will be restored to the previous `offset` to start consumption

##### **Full amount + Increment**
> In this mode, Source will skip the full synchronization phase and start from the incremental phase.
> 1. If you have not fully synchronized, you will start subscription consumption from each partition of the topic `earliest offset`
> 2. Otherwise, start subscription consumption from each partition of the topic `latest offset`.
> 3. If there is a message consumption record before, it will be restored to the previous `offset` to start consumption

#### **2.2 Node Connection**
| source | target | Is linkable |
| ------------- | ------------- | ---------- |
| kafka | elasticsearch | yes |
| kafka | redis | yes |
| kafka | table | is |
| kafka | collection | is |
| kafka | memory | yes |
| elasticsearch | kafka | yes |
| table | kafka | yes |
| redis | kafka | yes |
| collection | kafka | is |
| memory | kafka | yes |



##### **2.3 Data Migration**
| source | target | Is linkable |
| ---------- | ---------- | ---------- |
| kafka | mysql | yes |
| kafka | oracle | yes |
| kafka | mongodb | yes |
| kafka | db2 | yes |
| kafka | postgres | yes |
| kafka | mssql | yes |
| kafka | Base 8s | Yes |
| kafka | Sybase ASE | yes |
| mysql | kafka | yes |
| oracle | kafka | yes |
| mongodb | kafka | yes |
| db2 | kafka | yes |
| postgres | kafka | yes |
| Sybase ASE | kafka | Yes |
| Base 8s | kafka | Yes |
| mssql | kafka | yes |


### **3. Configuration**

##### **3.1 Common Configuration**
| Field name (UI form parameter name) | Type | Is it required | Remarks | Default value | Verification | UI form field name | UI form field component |
| --------------------- | ------ | -------- | ----------- -------- | ------ | ---------------------------------- -------------------------- | ----------------- | ----- -------------------- |
| kafkaBootstrapServers | String | Yes | Borker address list |-| host1:port,host2:port,host3:port (e.g. 192.168.1.1:9092,192.168.1.2:9092,192.168.1.3:9092) | host list | `< input type="text" />` |
| databaseType | String | Yes | Database type |-| Fixed value: kafka | None | `<input type="hidden" />` |
| connection_type | String | Yes | Link type |-| Enumeration value: source \| target \| source_and_target | Link type | `<select />` |
| kafkaPatternTopics | String | yes | topic name regular expression, |-| text length greater than 0, less than 256 | topic regular expression | `<input type="text" />` |


##### **3.2 Source (Kafka Consumer)**
| Field name (UI form parameter name) | Type | Is it required | Remarks | Default value | Verification | UI form field name | UI form field component |
| ------------------------ | ------- | -------- | ------- -------------------------------------------------- --- | ------ | --------------------- | ----------------- -| ----------------- |
| kafkaIgnoreInvalidRecord | Boolean | No | Whether to ignore non-JSON Object format messages, if it is, the message will be ignored if it encounters a parsing exception, otherwise it will stop pulling messages | false | Enumeration value: true \| false | Ignore non-JSON format messages| `<select />` |

##### **3.3 Target (Kafka Producer)**
| Field name (UI form parameter name) | Type | Is it required | Remarks | Default value | Verification | UI form field name | UI form field component |
| --------------------- | ------- | -------- | ---------- -------------------------------------------------- | ------ | ------------------------------------------ --- | ----------------- | ----------------- |
| kafkaAcks | String | No | ACK confirmation mechanism, "0": no confirmation, "1": write only to the master partition, "-1": write to most ISR partitions, "all": write to all ISR partitions| -1 | Enumeration value: "0" \| "1" \| "-1" \| "all" | Message push ACK | `<select />` |
| kafkaCompressionType | String | No | Message compression type: gzip, snappy, lz4, zstd. Enabling compression for large traffic messages can improve transmission efficiency. |-| Enumeration value: "gzip" \| "snappy" \| "lz4" \ | "zstd" | Message push compression method | `<select />` |
| kafkaIgnorePushError | Boolean | No | Whether to ignore the push message exception, if yes, ignore the push message (there is a message loss), otherwise stop pushing the message | false | Enumeration value: true \| false | Message push ignore exception | ` <select />` |
