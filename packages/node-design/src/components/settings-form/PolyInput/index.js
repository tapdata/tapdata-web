import { ElButton as Button } from 'element-plus'
import { IconWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import './styles.scss'
import { defineComponent, ref, toRefs, watch } from 'vue'

const isValid = val => val !== undefined && val !== null

const getEventValue = event => {
  if (event?.target) {
    if (isValid(event.target.value)) return event.target.value
    if (isValid(event.target.checked)) return event.target.checked
    return
  }
  return event
}

const createTypes = (types, exclude, include) => {
  return types.filter(({ type }) => {
    if (Array.isArray(include) && include.length) {
      return include.includes(type)
    }
    if (Array.isArray(exclude) && exclude.length) {
      return !exclude.includes(type)
    }
    return true
  })
}

export function createPolyInput(polyTypes = []) {
  return defineComponent({
    props: {
      value: {},
      exclude: Array,
      include: Array
    },
    setup: (props, { emit }) => {
      const { value, exclude, include, ...comProps } = toRefs(props)
      const prefix = usePrefix('poly-input')
      const types = createTypes(polyTypes, exclude, include)
      const current = ref(types[0]?.type)
      const typesValue = ref({})

      watch(
        [value],
        () => {
          types?.forEach(({ checker, type }) => {
            if (checker(value.value)) {
              current.value = type
            }
          })
        },
        { immediate: true }
      )

      const getNextType = () => {
        const currentIndex = types?.findIndex(({ type }) => type === current.value)
        const nextIndex = currentIndex + 1 > types?.length - 1 ? 0 : currentIndex + 1
        return types[nextIndex]
      }

      const transformOnChangeValue = (value, type) => {
        return type?.toChangeValue ? type?.toChangeValue(value) : value
      }

      return () => {
        let type = types?.find(({ type }) => type === current.value)
        let component = type?.component
        return (
          <div class={prefix}>
            {component && (
              <div class={prefix + '-content'}>
                <component
                  {...{ props: { ...comProps } }}
                  value={type?.toInputValue ? type?.toInputValue(value.value) : value.value}
                  onChange={event => {
                    const value = getEventValue(event)
                    typesValue.value[type?.type] = value
                    emit('change', transformOnChangeValue(value, type))
                  }}
                />
              </div>
            )}
            <Button
              class={prefix + '-controller'}
              style={{
                width: !component ? '100%' : 'auto'
              }}
              block
              onClick={() => {
                const nextType = getNextType()
                if (nextType === type) return
                current.value = nextType?.type
                emit('change', transformOnChangeValue(typesValue.value[nextType?.type], nextType))
              }}
            >
              {type?.icon ? <IconWidget infer={type.icon} /> : type?.title || type?.type}
            </Button>
          </div>
        )
      }
    }
  })
}
