## **Agent配置说明**
### **1. 为什么要安装Agent**
由于部分用户的数据库等服务通常无法被外部网络访问, 在使用 Tapdata cloud 之前, 用户可以自行下载一个 Agent 以解决通信问题, 以实现平台的迁移和计算任务的执行。
>**注意：**<br>
>Agent 运行在用户的机器上, 需要保证网络上能够与用户的源库与目标库通信, 并需要有一定的计算资源来执行任务。

### **2. Agent 运行环境**
- Linux 或者 Windows 环境<br>
- 提前配置好 JAVA<br>
- 建议使用 java docker 容器环境运行 agent<br>
### **3. Agent 架构图**


### **4. Agent下载说明**
#### **WINDOW**
- 首先要确保环境中安装了 JAVA 运行环境
- 下载文件，并存放在某个目录中
- 进入目录，执行命令后系统将自动安装并启动 Agent
>**注意：**<br>
>在 Agent 安装后，可通过 tapdata start/stop backend 启动和停止 Agent
>Tapdata 云版一个账号下只能安装一个 Agent

#### **LINUX**
- 首先要确保环境中安装了 JAVA 运行环境
- 在环境中执行以上命令，将会自动下载和​​启动 Agent
- 在 Agent 安装后，可通过 tapdata start/stop backend 启动和停止 Agent

#### **Docker**<br>
- 首先，需要確保環境中安裝了 Docker 運行環境
- 執行命令後系統將自動安裝並啟動 Agent
>**注意：**
>Tapdata 雲版一個賬號下只能安裝一個 Agent