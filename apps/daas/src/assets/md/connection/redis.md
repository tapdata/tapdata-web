## **连接配置帮助**
### **1. REDIS 安装说明**
请遵循以下说明以确保在 Tapdata 中成功添加和使用Redis数据库。
### **2. 限制说明**
- **Hash数据类型**
没有field个数限制，单个元素最大值为512 MB，推荐元素个数小于8192， value最大长度不超过1 MB。
- **传输限制**
Tapdata系统当前版本Redis仅支持作为目标，支持的数据源的类型为：Oracle、MySQL、MongoDB、PostgreSQL、SQL Server。


| 源端 | 目标端|支持情况
| :-----------: | :-----------:|:-----------:|
| Oracle | Elastic Search |支持
| MySQL| Elastic Search |支持
| MongoDB| Elastic Search |支持
| PostgreSQL| Elastic Search |支持
| SQL Server | Elastic Search |支持

### **3. 支持版本**
Redis 3.3
### **4. 配置说明**
- Host/IP
- Port
- 数据库名
- 密码
> **特别说明**<br>
> Redis的密码不是必填项，但是如果您要配置的Redis数据库有密码，而您未在Tapdata中配置密码的话，检测会不通过。

### **5. 连接测试项**
- 检测host/IP 和 port
- 检查索引
- 检查数据库名和密码
