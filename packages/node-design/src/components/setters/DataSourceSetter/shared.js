import { uid, clone, toArr } from '@daas/shared'

export const traverseTree = (data, callback) => {
  for (let i = 0; i < data.length; i++) {
    callback(data[i], i, data)
    if (data[i]?.children) {
      traverseTree(data[i]?.children, callback)
    }
  }
}

export const transformValueToData = value => {
  const data = clone(value)
  traverseTree(data, (item, i, dataSource) => {
    const dataItem = {
      key: '',
      duplicateKey: '',
      map: [],
      children: []
    }
    for (const [key, value] of Object.entries(dataSource[i] || {})) {
      if (key !== 'children') dataItem.map.push({ label: key, value: value })
    }
    const uuid = uid()
    dataItem.key = uuid
    dataItem.duplicateKey = uuid
    dataItem.children = dataSource[i].children || []
    dataSource[i] = dataItem
  })
  return data
}

export const transformDataToValue = data => {
  const value = clone(data)
  traverseTree(value, (item, i, dataSource) => {
    const valueItem = {
      children: []
    }
    toArr(dataSource[i].map).forEach(item => {
      if (item.label) valueItem[item.label] = item.value
    })
    valueItem.children = dataSource[i]?.children || []
    dataSource[i] = valueItem
  })
  return value
}
