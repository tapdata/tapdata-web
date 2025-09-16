export const makeTree = (data: any[]) => {
  const root: any = {
    children: [],
  }

  for (const item of data) {
    const { field_name, field_alias } = item
    let parent = root
    const fields = field_name.split('.')

    for (let i = 0; i < fields.length; i++) {
      const name = fields[i]
      let child = parent.children.find((c: any) => c.name === name)

      if (!child) {
        child = {
          label: field_alias || name,
          name,
          children: [],
        }
        parent.children.push(child)
      }

      parent = child

      if (i === fields.length - 1) {
        Object.assign(parent, item, {
          label: field_alias || name,
          name,
          dataType: item.data_type.replace(/\(.+\)/, ''),
        })
      }
    }
  }

  return root.children
}

export const filterNode = (value: string, data: any) => {
  if (!value) return true
  const val = value.toLowerCase()
  return (
    data.label?.toLowerCase().includes(val) ||
    data.name?.toLowerCase().includes(val)
  )
}
