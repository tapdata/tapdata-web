export class Database {
  group = 'data'

  // form-builder 配置
  formSchema = {}

  // 附加到节点上的属性
  attr = {
    type: 'database',
    syncObjects: [
      {
        type: 'table',
        objectNames: []
      }
    ]
  }

  constructor(name, icon, type) {
    this.icon = icon
    this.name = name
    this.tip = name

    Object.assign(this.attr, {
      database_type: type
    })
  }

  execute() {
    // 节点功能实现
  }

  /**
   * 验证此允许连接到目标
   */
  allowTarget() {
    return true
  }

  /**
   * 验证接受源连接
   */
  allowSource() {
    return true
  }
}
