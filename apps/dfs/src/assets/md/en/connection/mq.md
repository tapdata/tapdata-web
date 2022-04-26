## **Connection configuration help**
### **1. MQ configuration instructions**
Please follow the instructions below to ensure that MQ data sources are successfully added and used in Tapdata, including ActiveMQ, RabbitMQ, RocketMQ.

### **2. Restrictions **
Tapdata system supports MQ as source and target.

### **3. Supported version**
activemq-5.14.x, rabbitmq-3.8.x, rocketmq-4.9.x

### **4. Configuration Instructions**
#### **Data source configuration**<br>
- MQ type, you can choose ActiveMQ, RabbitMQ, RocketMQ
- Connection type, support for source and target, source, target
- Account number, allow to be empty
- Password, allow it to be empty

#### **ActiveMQ dedicated configuration**<br>
- MQ connection string: required
- Subject name, it is allowed to be empty
- Queue name, it is allowed to be empty

#### **RabbitMQ dedicated configuration**<br>
- MQ address, MQ port
- Queue name, required field
- Message routing: allow to be empty
- Virtual host: Allow to be empty
- The connection type is source and target or source, subject name cannot be empty

#### **RocketMQ Dedicated Configuration**<br>
- MQ address, MQ port
- Subject name, required field
- The connection type is source and target or source, subject name cannot be empty

### **5. Connection test items**
- All fields marked as required
