import { get, set, merge } from 'lodash'
export const convertSchemaToTreeData = function (Schema) {
  if (Schema) {
    let root = {}
    let fields = Schema || []
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i]
      if (field && field.field_name && field.original_field_name) {
        // let jsonPath = field.original_field_name.split('.');
        let jsonPathForFieldName = field.field_name.split('.')
        let treeItem = {
          id:
            field.id ||
            `${field.table_name}${field.original_field_name ? '_' + field.original_field_name : ''}`.replace(
              /\./g,
              '_'
            ),
          label: jsonPathForFieldName[jsonPathForFieldName.length - 1],
          field_name: jsonPathForFieldName[jsonPathForFieldName.length - 1],
          type: field.originalDataType || field.data_type,
          data_type: field.data_type,
          primary_key_position: field.primary_key_position,
          table_name: field.table_name || 'table',
          original_field_name: field.original_field_name || field.field_name,
          is_deleted: field.is_deleted,
          comment: field.comment
        }
        let path = 'children.' + jsonPathForFieldName.join('.children.')
        let partField = get(root, path)
        if (!partField) {
          set(root, path, treeItem)
        } else {
          set(root, path, merge(partField, treeItem))
        }
      }
    }
    let re = function (field, count) {
      if (field && field.children) {
        count++
        field.children = Object.values(field.children).map(it => {
          it.level = count
          return it
        })
        field.children.forEach(it => {
          re(it, count)
        })
      }
    }
    re(root, 0)

    let sort = function (node) {
      if (node.children && node.children.length > 0) {
        node.children.sort((c1, c2) => (c1.table_name > c2.table_name ? 1 : c1.table_name === c2.table_name ? 0 : -1))
        node.children.forEach(sort)
      }
    }
    sort(root)
    fields = root.children
    return fields
  } else {
    return null
  }
}

export const getFieldsIds = function (fields) {
  let fieldIds = []
  if (fields) {
    fieldIds = fields.map(field => field.id)
  }
  return fieldIds
}
export const getOperationIds = function (operation) {
  let fieldIds = []
  if (operation) {
    fieldIds = operation.map(field => field.id)
  }
  return fieldIds
}

export const getFieldsNames = function (fields) {
  let fieldNames = []
  if (fields) {
    fieldNames = fields.map(field => field.field_name)
  }
  return fieldNames
}

export const fieldsNamesMap = function (fields) {
  let fieldsNamesMap = {}
  if (fields) {
    fields.map(s => (fieldsNamesMap[s.field_name] = s.id))
  }
  return fieldsNamesMap
}

export const fieldIsDeleted = function (fields) {
  let fieldIsDeleted = []
  if (fields) {
    fieldIsDeleted = fields.filter(field => field.is_deleted).map(n => n.id)
  }
  return fieldIsDeleted
}

export const fieldNameIndex = function (name) {
  let fieldNameIndex = ''
  if (name) {
    fieldNameIndex = name.indexOf('.')
  }
  return fieldNameIndex
}

export const handleOperation = function (fields, operations) {
  //查找是否有被删除的字段且operation有操作
  let fieldOriginalIds = getFieldsIds(fields)
  let fieldOriginalIsDeleted = fieldIsDeleted(fields)
  let fieldOriginalNames = getFieldsNames(fields)
  let operationIds = getOperationIds(operations)
  let temporary = operations
  if (temporary.length > 0) {
    for (let i = 0; i < temporary.length; i++) {
      let indexOf = fieldNameIndex(temporary[i].field) || -1
      if (fieldOriginalIsDeleted.includes(temporary[i].id) && !temporary[i]['keep']) {
        temporary.splice(i, 1)
        i--
        continue
      } else if (
        temporary[i].op === 'CREATE' &&
        (fieldOriginalNames.includes(temporary[i].field) ||
          (!fieldOriginalIds.includes(temporary[i].triggerFieldId) &&
            indexOf > -1 &&
            !operationIds.includes(temporary[i].triggerFieldId)))
      ) {
        temporary.splice(i, 1)
        i--
        continue
      }
    }
  }
  return temporary
}

export const isValidate = function (operations, schema) {
  //字段处理器是否校验通过
  let operation = operations || []
  let isValidate = true
  let errorList = []
  if (operation.length > 0) {
    //data.operation id不匹配的字段验证 跟当前schema进行比较operation.id
    let originalSchema = schema || {}
    let fieldOriginalIds = getFieldsIds(originalSchema.fields)
    let fieldDeleted = fieldIsDeleted(originalSchema.fields)
    let fieldOriginalNames = getFieldsNames(originalSchema.fields)
    let operationIds = getOperationIds(operation)
    for (let i = 0; i < operation.length; i++) {
      // isType 1表示id name 都不匹配 2表示name匹配 3表示该字段被标记为删除且id匹配 4 新建字段处理 5 脚本处理
      let indexOf = fieldNameIndex(operation[i].field) || -1
      let node = {}
      if (operation[i].op === 'CREATE') {
        node = {
          id: operation[i].id,
          isType: 4,
          keep: false,
          action: operation[i].action,
          op: operation[i].op,
          field: operation[i].field,
          data_type: operation[i].data_type,
          level: operation[i].level,
          tableName: operation[i].tableName,
          triggerFieldId: operation[i].triggerFieldId
        }
      } else {
        node = {
          id: operation[i].id,
          color: operation[i].color,
          field: operation[i].field,
          isType: 1,
          keep: false,
          label: operation[i].label,
          op: operation[i].op,
          operand: operation[i].operand,
          originalDataType: operation[i].originalDataType || operation[i].type,
          primary_key_position: operation[i].primary_key_position,
          table_name: operation[i].table_name,
          type: operation[i].type
        }
      }
      if (
        operation[i].op === 'CREATE' &&
        (fieldOriginalNames.includes(operation[i].field) ||
          (!fieldOriginalIds.includes(operation[i].triggerFieldId) &&
            indexOf > -1 &&
            !operationIds.includes(operation[i].triggerFieldId)))
      ) {
        errorList.push(node)
        isValidate = false
      } else if (
        !fieldOriginalIds.includes(operation[i].id) &&
        !fieldOriginalNames.includes(operation[i].field) &&
        operation[i].op !== 'CREATE'
      ) {
        node.isType = 1
        node.keep = false
        errorList.push(node)
        isValidate = false
      } else if (
        !fieldOriginalIds.includes(operation[i].id) &&
        fieldOriginalNames.includes(operation[i].field) &&
        operation[i].op !== 'CREATE'
      ) {
        node.isType = 2
        node.keep = true
        errorList.push(node)
        isValidate = false
      } else if (fieldDeleted.includes(operation[i].id)) {
        node.isType = 3
        node.keep = true
        errorList.push(node)
        isValidate = false
      }
    }
  }
  return {
    isValidate: isValidate,
    errorList: errorList
  }
}
export const isScript = function (operations, scripts) {
  let fieldIds = []
  let errorList = []
  if (operations) {
    fieldIds = operations.map(field => field.id)
  }
  if (scripts) {
    for (let i = 0; i < scripts.length; i++) {
      if (!fieldIds.includes(scripts[i].id)) {
        let node = {
          isType: 5,
          keep: false,
          color: scripts[i].color,
          field: scripts[i].field,
          id: scripts[i].id,
          label: scripts[i].label,
          primary_key_position: scripts[i].primary_key_position,
          script: scripts[i].script,
          scriptType: scripts[i].scriptType,
          tableName: scripts[i].tableName,
          type: scripts[i].type
        }
        errorList.push(node)
      }
    }
  }
  return errorList
}
export const delScript = function (operations, scripts, id) {
  let fieldIds = []
  if (operations) {
    fieldIds = operations.map(field => field.id)
  }
  if (scripts) {
    for (let i = 0; i < scripts.length; i++) {
      if (!fieldIds.includes(scripts[i].id)) {
        scripts.splice(i, 1)
        i--
      } else if (id === scripts[i].id) {
        scripts.splice(i, 1)
        i--
      }
    }
  }
  return scripts
}

//兼容数据 操作记录改变type => original_type
export const originalType = function (operations, id) {
  let data = operations.filter(v => v.id === id && v.op === 'CONVERT')
  let original_type = ''
  if (data.length > 0) {
    original_type = data[0].originalDataType
  }
  return original_type
}
export const uuid = function () {
  // credit: http://stackoverflow.com/posts/2117523/revisions

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0
    var v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
