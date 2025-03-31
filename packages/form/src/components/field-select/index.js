import { defineComponent } from 'vue-demi'
import { Select } from '../select'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element'
import { VIcon } from '@tap/component'
import { computed } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { isObj } from '@tap/shared'

const DefineFieldSelect = defineComponent({
  props: {
    options: Array
  },
  setup: (props, { attrs, listeners }) => {
    // public static final byte TYPE_DATETIME = 1;
    // public static final byte TYPE_ARRAY = 2;
    // public static final byte TYPE_BOOLEAN = 3;
    // public static final byte TYPE_MAP = 4;
    // public static final byte TYPE_YEAR = 5;
    // public static final byte TYPE_TIME = 6;
    // public static final byte TYPE_RAW = 7;
    // public static final byte TYPE_NUMBER = 8;
    // public static final byte TYPE_BINARY = 9;
    // public static final byte TYPE_STRING = 10;
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
      11: 'calendar'
    }

    const getIcon = tapType => {
      let match = tapType.match(/"type"\s*:\s*(\d+)/)
      let value = match?.[1]

      return TYPE_ICON[value] || 'type-unknown'
    }

    const fieldOptions = computed(() => {
      return props.options?.map(option => {
        if (option.tapType) option.icon = getIcon(option.tapType)
        if (option.source === 'virtual_hash') option.icon = 'file-hash'
        return option
      })
    })

    const renderIcon = option => {
      if (option.isPrimaryKey) {
        return option.isForeignKey ? (
          <ElTooltip
            placement="top"
            content={i18n.t('public_foreign_key_tip', { name: option.constraints[0], val: option.constraints[2] })}
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
            content={i18n.t('public_foreign_key_tip', { name: option.constraints[0], val: option.constraints[2] })}
            open-delay={200}
            transition="none"
          >
            <span class="flex align-center">
              <VIcon size="14">share</VIcon>
              {option.isMultiForeignKey && (
                <span style={`--index: '${option.constraints[1]}';`} class="fingerprint-sub foreign-sub"></span>
              )}
            </span>
          </ElTooltip>
        )
      }

      if (option.indicesUnique && Array.isArray(option.indicesUnique)) {
        return (
          <ElTooltip
            placement="top"
            content={
              `${i18n.t(option.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ` +
              option.indicesUnique[0]
            }
            open-delay={200}
            transition="none"
          >
            {option.indicesUnique[2] ? (
              <span class="flex align-center">
                <VIcon size="14">fingerprint</VIcon>
                {option.isMultiUniqueIndex && (
                  <span style={`--index: '${option.indicesUnique[1]}';`} class="fingerprint-sub unique-sub"></span>
                )}
              </span>
            ) : (
              <span class="flex align-center">
                <VIcon size="14">sort-descending</VIcon>
                {option.isMultiIndex && (
                  <span style={`--index: '${option.indicesUnique[1]}';`} class="fingerprint-sub index-sub"></span>
                )}
              </span>
            )}
          </ElTooltip>
        )
      }
    }

    return () => {
      const newAttrs = { ...attrs }
      if (
        (attrs['allow-create'] || attrs.allowCreate) &&
        !('defaultFirstOption' in attrs || 'default-first-option' in attrs)
      ) {
        newAttrs.defaultFirstOption = true
      }
      const itemLabel = newAttrs.itemLabel || 'label'
      return (
        <Select
          popper-class="field-select-popper"
          attrs={newAttrs}
          options={fieldOptions.value}
          on={listeners}
          scopedSlots={{
            option: ({ option }) => (
              <div class="flex align-center gap-1">
                {option.icon && (
                  <VIcon size="16" title={option.type}>
                    {option.icon}
                  </VIcon>
                )}
                {option[itemLabel]}
                {renderIcon(option)}
              </div>
            )
          }}
        />
      )
    }
  }
})

export const FieldSelect = connect(
  DefineFieldSelect,
  mapProps({ dataSource: 'options', loading: true }),
  mapReadPretty(PreviewText.Select)
)
