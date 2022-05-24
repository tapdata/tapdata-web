## **数据源配置说明**

### **1。 Hazelcast cloud 安装说明**

请按照下面的说明来确保hazelcast云数据库成功添加并在tapdata中使用


### **2。 限制说明**
Tapdata 支持 hazelcast cloud 作为目标数据库

### **3。 配置说明**
- hazelcast集群配置中可以得到以下配置

![图像文本](../images/hazcast_2.png)

- 集群名称：

![图像文本](../images/hazcast_1.png)

- 令牌：

![图像文本](../images/hazcast_3.png)

- 启用 SSL：使用 SSL 加密协议
- 密钥库文件：client.keystore 文件
- 信任密钥存储文件：client.truststore

![图像文本](../images/hazcast_4.png)

- 密钥文件密码：文件的 ssl 密码

![图像文本](../images/hazcast_5.png)
