## **连接配置帮助**

### **1. ADB MySQL 安装说明**

请遵循以下说明以确保在 Tapdata 中成功添加和使用ADB MySQL数据库。

需要注意的是ADB MySQL仅支持作为目标。

### **2. 支持版本**
3.0

### **3. 作为目标**
- 对于某个数据库赋于全部权限
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```
- 对于某个数据库赋于全部权限
```
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
