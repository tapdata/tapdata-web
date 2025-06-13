import { PreviewText } from '@formily/element-plus'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
// import { Select } from '../select'
import { ElSelectV2 as Select } from 'element-plus'
import { computed, defineComponent } from 'vue'

const DefineFieldSelect = defineComponent({
  props: {
    options: Array,
  },
  setup: (props, { attrs, slots }) => {
    // public static final byte TYPE_DATETIME = 1;
    // public static final byte TYPE_ARRAY = 2;
    // public static final byte TYPE_BOOLEAN = 3;
    // public static final byte TYPE_MAP = 4;
    // public static final byte TYPE_YEAR = 5;
    // public static final byte TYPE_TIME = 6;
    // public static final byte TYPE_RAW = 7;
    // public static final byte TYPE_NUMBER = 8;
    // public static final byte TYPE_BINARY = 9;
    // public static final byte TYPE_STRING = 10
    // public static final byte TYPE_DATE = 11;

    const TYPE_ICON = {
      1: 'calendar',
      2: '',
      3: 'type-boolean',
      4: '',
      5: 'calendar',
      6: 'calendar',
      7: '',
      8: 'type-number',
      9: '',
      10: 'type-string',
      11: 'calendar',
    }

    const getIcon = (tapType) => {
      const match = tapType.match(/"type"\s*:\s*(\d+)/)
      const value = match?.[1]

      return TYPE_ICON[value] || 'type-unknown'
    }

    const fieldOptions = computed(() => {
      return (
        props.options?.map((option) => {
          if (option.tapType) option.icon = getIcon(option.tapType)
          if (option.source === 'virtual_hash') option.icon = 'file-hash'
          return option
        }) || []
      )
    })

    const renderIcon = (option) => {
      if (option.isPrimaryKey) {
        return option.isForeignKey ? (
          <ElTooltip
            placement="top"
            content={i18n.t('public_foreign_key_tip', {
              name: option.constraints[0],
              val: option.constraints[2],
            })}
            open-delay={200}
            transition="none"
          >
            <VIcon size="12" class="text-warning">
              key
            </VIcon>
          </ElTooltip>
        ) : (
          <VIcon size="12" class="text-warning">
            key
          </VIcon>
        )
      }

      if (option.isForeignKey) {
        return (
          <ElTooltip
            placement="top"
            content={i18n.t('public_foreign_key_tip', {
              name: option.constraints[0],
              val: option.constraints[2],
            })}
            open-delay={200}
            transition="none"
          >
            <span class="flex align-center">
              <VIcon size="14">share</VIcon>
              {option.isMultiForeignKey && (
                <span
                  style={`--index: '${option.constraints[1]}';`}
                  class="fingerprint-sub foreign-sub"
                ></span>
              )}
            </span>
          </ElTooltip>
        )
      }

      if (option.indicesUnique && Array.isArray(option.indicesUnique)) {
        return (
          <ElTooltip
            placement="top"
            content={`${i18n.t(option.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ${
              option.indicesUnique[0]
            }`}
            open-delay={200}
            transition="none"
          >
            {option.indicesUnique[2] ? (
              <span class="flex align-center">
                <VIcon size="14">fingerprint</VIcon>
                {option.isMultiUniqueIndex && (
                  <span
                    style={`--index: '${option.indicesUnique[1]}';`}
                    class="fingerprint-sub unique-sub"
                  ></span>
                )}
              </span>
            ) : (
              <span class="flex align-center">
                <VIcon size="14">sort-descending</VIcon>
                {option.isMultiIndex && (
                  <span
                    style={`--index: '${option.indicesUnique[1]}';`}
                    class="fingerprint-sub index-sub"
                  ></span>
                )}
              </span>
            )}
          </ElTooltip>
        )
      }
    }

    const fieldNames = computed(() => {
      return {
        label: attrs['item-label'] || 'label',
        value: attrs['item-value'] || 'value',
        disabled: attrs['item-disabled'] || 'disabled',
      }
    })

    return () => {
      const newAttrs = { ...attrs }
      if (
        (attrs['allow-create'] || attrs.allowCreate) &&
        !('defaultFirstOption' in attrs) &&
        !('default-first-option' in attrs)
      ) {
        newAttrs.defaultFirstOption = true
      }

      return (
        <Select
          {...newAttrs}
          props={fieldNames.value}
          popper-class="field-select-popper"
          options={fieldOptions.value}
          dataSource={fieldOptions.value}
        >
          {{
            header: slots.header,
            default: ({ item: option }) => (
              <div class="flex align-center gap-1">
                {option.icon && (
                  <VIcon size="16" title={option.type}>
                    {option.icon}
                  </VIcon>
                )}
                {option[fieldNames.value.label]}
                {renderIcon(option)}
              </div>
            ),
          }}
        </Select>
      )
    }
  },
})

export { DefineFieldSelect as BaseFieldSelect }

export const FieldSelect = connect(
  DefineFieldSelect,
  mapProps(
    { dataSource: 'options', loading: true, value: 'modelValue' },
    (props) => {
      const _props = { ...props }

      if (_props.dataSource) {
        _props.options = _props.dataSource
      }

      return _props
    },
  ),
  mapReadPretty(PreviewText.Select),
)

export const mapFieldsData = (data) => {
  let {
    constraints = [],
    indices = [],
    fields = [],
    partitionInfo: { partitionFields = [] } = { partitionFields: [] },
  } = data
  let isMultiIndex = false
  let isMultiUniqueIndex = false
  let isMultiForeignKey = false

  let indexCount = 0
  let uniqueIndexCount = 0
  let foreignKeyCount = 0

  const pkMap = fields.reduce((map, field) => {
    if (field.primary_key_position > 0) {
      map[field.field_name] = true
    }
    return map
  }, {})

  const constraintMap = constraints.reduce((map, item, index) => {
    if (item.type === 'FOREIGN_KEY') {
      let temp = 0
      item.mappingFields.forEach(({ foreignKey, referenceKey }) => {
        map[foreignKey] = [
          item.name,
          index,
          `${item.referencesTableName}.${referenceKey}`,
        ]
        if (!pkMap[foreignKey]) {
          temp++
        }
      })
      if (temp > 0) foreignKeyCount++
    }

    return map
  }, {})

  indices = indices.filter(
    (item) => item.primaryKey !== true && item.primaryKey !== 'true',
  )

  const columnsMap = indices.reduce((map, item, index) => {
    let temp = 0
    if (item.unique) {
      uniqueIndexCount++
    }

    item.columns.forEach(({ columnName }) => {
      map[columnName] = [item.indexName, index, item.unique]
      if (!constraintMap[columnName]) {
        temp++
      }
    })

    // 外键默认会有普通索引，排除外键
    if (!item.unique && temp > 0) indexCount++

    return map
  }, {})

  const partitionFieldMap = partitionFields.reduce((map, item) => {
    map[item.name] = true
    return map
  }, {})

  isMultiIndex = indexCount > 1
  isMultiUniqueIndex = uniqueIndexCount > 1
  isMultiForeignKey = foreignKeyCount > 1

  const newFields = fields
    .filter((item) => !item.is_deleted)
    .map((field) => {
      return {
        ...field,
        label: field.field_name,
        value: field.field_name,
        isPrimaryKey: field.primary_key_position > 0,
        indicesUnique: columnsMap[field.field_name],
        isForeignKey: !!constraintMap[field.field_name],
        isPartitionKey: partitionFieldMap[field.field_name],
        constraints: constraintMap[field.field_name],
        type: field.data_type,
        dataType: field.data_type.replace(/\(.+\)/, ''),
        isMultiIndex,
        isMultiUniqueIndex,
        isMultiForeignKey,
      }
    })

  return {
    columnsMap,
    constraintMap,
    partitionFieldMap,
    isMultiIndex,
    isMultiUniqueIndex,
    isMultiForeignKey,
    fields: newFields,
  }
}
