## **连接配置帮助**

### ** Javascript Built-in Function**

### **1. Http**
```
Http Return Instructions
// data为返回的body，可能是array或object或string
{code:200, data:[]}
```
```
rest.get(url, header)
rest.get(url, header, returnType)
// 调用http的 get 方法
// returnType: 返回的结果类型，默认为array
var result = rest.get('http://127.0.0.1:1234/users?id=1', {}, '[array/object/string]'});
```
```
rest.post(url, parameters)
rest.post(url, parameters, headers, returnType)
// 调用http的 post 方法
// returnType: 返回的结果类型，默认为array
var result = rest.post('http://127.0.0.1:1234/users/find', {}, {}, '[array/object/string]');
```
```
rest.patch(url, parameters)
rest.patch(url, parameters, headers)
// 调用http的 patch 方法
var result = rest.patch('http://127.0.0.1:1234/users?where[user_id]=1', {status: 0}, {});
```
```
rest.delete(url)
rest.delete(url, headers)
// 调用http的 delete 方法
var result = rest.delete(’http://127.0.0.1:1234/users?where[user_id]=1‘, {});
```
### **2. MongoDB**
```
mongo.getData(uri, collection)
mongo.getData(uri, collection, filter)
mongo.getData(uri, collection, filter, limit, sort)
// MongoDB 查询数据
var result = mongo.getData('mongodb://127.0.0.1:27017/test', 'users', {id: 1}, 10, {add_time: -1});
```

```
mongo.insert(url, collection, inserts)
// MongoDB 插入数据
// inserts 表示插入的数据，可以传入数组或者对象
mongo.insert('mongodb://127.0.0.1:27017/test', 'users', [{id: 1, name: 'test1'}, {id: 2, name: 'test2'}]);
```
```
mongo.update(url, collection, filter, update)
// MongoDB更新数据
var modifyCount = mongo.update('mongodb://127.0.0.1:27017/test', 'users', {id: 1}, {name: 'test3'});
```
```
mongo.delete(url, collection, filter)
// MongoDB删除数据
var deleteCount = mongo.delete('mongodb://127.0.0.1:27017/test', 'users', {id: 1});
```

