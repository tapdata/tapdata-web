## **连接配置说明**
### **1. FILE 安装说明**
请遵循以下说明以确保在 Tapdata 中成功添加和使用FILE数据源。<br>
FILE 既可以直接作为数据节点在**数据库迁移**中作为源将指定的目录下的文件打包传输至目标路径，也可以在**数据同步**中将其目录下的EXCEL、CSV、XML、JSON 类型的文件生成模型，作为专门的数据节点类型同步传输给数据集。

### **2. 先决条件（作为源）**
#### **2.1 Excel/CSV**
##### 支持的版本
Excel：xls、xlsx
CSV：分隔符自定义

##### 基本配置
**文件存放规则**<br>
一个文件表示一张表，包括 Excel 和 CSV<br>
**文件内容**<br>
- 第一行必须是 header (字段名)<br>
- 第二行开始是数据行<br>
**文件获取方式**<br>
- FTP
- 本地目录（共享目录）
- Windows 共享目录

##### 页面配置
1. 创建连接，“数据库类型”选择“File(s)”<br>
2. “协议”选择“Local File”<br>
3. “文件保存时间”即通过该连接采集到的文件生命周期，单位为分钟<br>
4. “目录/文件”允许用户添加多个路径，以下是每个输入框的解释：<br>
- “路径”：填写的是绝对路径，注意：这里只能填写路径，不需要填写具体文件名<br>
- “包含文件名”：正则表达式填写的就是您希望获取的文件<br>
- “排除文件名”：正则表达式填写的就是您希望排除的文件<br>
- 例如：
>路径： /home/dianke/files/<br>
>包含文件名：.*.xlsx<br>
>排除文件名：<空><br>

5. 若“协议”选择“FTP”后，只需要填入对应的ftp地址、端口、账号名、密码即可。<br>
- FTP的连接超时时间用来控制用户连接ftp后的超时时间。<br>
- FTP的数据传输超时时间用来控制采集文件时的超时时间。<br>

6. FTP主动模式和被动模式：<br>
这里的主被动模式就是指FTP本身的2种模式<br>
>建议：使用被动模式，缓解服务器压力<br>

#### **2.2 Json**<br>
##### 列表Json：<br>
```
[
  {...},
{...},
  ...
]
```
##### 一行一个字典
```
{...}
{...}
...
```

##### 页面配置
同 Excel/CSV 配置<br>
举例：<br>
>路径： /home/dianke/files/<br>
>包含文件名：.*.json<br>
>排除文件名：<空><br>

#### **2.3 XML**
##### 标准XML格式
```
<DATA>
  <RECORD>
      <NAME>...</NAME>
      <AGE>...</AGE>
      ...
  </RECORD>
  <RECORD>
  ...
  </RECORD>

  ...

</DATA>
```

##### 页面配置
同 Excel/CSV 配置<br>
举例：<br>
>路径： /home/dianke/files/<br>
>包含文件名：.*.xml<br>
>排除文件名：<空><br>

### 作为目标
#### FTP
如果需要支持中文路径及文件名，需设置UTF为FALSE
#### SMB
目前支持的协议为SMB1.0，以下为windows开启SMB1.0的操作说明
1. 前往控制面板->程序和功能，安装SMB1.0服务器
2. 管理员运行powershell
3. 执行命令
```
Set-SmbServerConfiguration -EnableSMB1Protocol $true
```
4. 检验结果
```
Get-SmbServerConfiguration | Select EnableSMB1Protocol, EnableSMB2Protocol
```
查看EnableSMBProtocol1是否为True