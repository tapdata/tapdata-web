## **连接配置帮助**

### **1. Doris 安装说明**

请遵循以下说明以确保在 Tapdata 中成功添加和使用Doris数据库。

### **2. 支持版本**
Doris 0.15.0

###  **3. 先决条件（作为目标）**
对于某个数据库赋于全部权限
```
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.<TABLE_NAME> TO 'tapdata' IDENTIFIED BY 'password';
```
对于全局的权限
```
GRANT PROCESS ON *.* TO 'tapdata' IDENTIFIED BY 'password';
```
