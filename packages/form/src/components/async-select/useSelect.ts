import { ref, unref, reactive, computed, watch, nextTick, triggerRef, toRaw, onMounted, shallowRef } from 'vue'
import {
  useDeprecated,
  useLocale,
  useNamespace,
  useFormItem,
  useFormSize,
  CHANGE_EVENT,
  EVENT_CODE,
  UPDATE_MODEL_EVENT,
} from 'element-plus'
import {
  ValidateComponentsMap,
  debugWarn,
  getComponentSize,
  isClient,
  isFunction,
  isKorean,
  isNumber,
  isString,
  isUndefined,
  scrollIntoView,
} from 'element-plus/es/utils/index.mjs'
import { isPlainObj as isObject, isValid, isFn } from '@tap/shared'
// @ts-ignore
import { findLastIndex, isEqual, uniqBy, escapeRegExp, get, merge, debounce as lodashDebounce } from 'lodash'
import i18n from '@tap/i18n'
import { CancelToken } from '@tap/api'

import type { ComponentPublicInstance } from 'vue'
import type { ElTooltip, ElScrollbar } from 'element-plus'
import type { QueryChangeCtx, SelectOptionProxy } from 'element-plus/es/components/select/src/token'

export function useSelectStates(props) {
  const { t } = useLocale()
  return reactive({
    options: new Map(),
    cachedOptions: new Map(),
    disabledOptions: new Map(),
    createdLabel: null,
    createdSelected: false,
    selected: props.multiple ? [] : ({} as any),
    inputLength: 20,
    inputWidth: 0,
    optionsCount: 0,
    filteredOptionsCount: 0,
    visible: false,
    selectedLabel: '',
    hoverIndex: -1,
    query: '',
    previousQuery: null,
    inputHovering: false,
    cachedPlaceHolder: '',
    currentPlaceholder: t('el.select.placeholder') as string | (() => string),
    menuVisibleOnFocus: false,
    isOnComposition: false,
    prefixWidth: 11,
    mouseEnter: false,
    focused: false,
    // extends
    pagination: {
      page: 1,
    },
    total: 0,
    items: [],
    loadingMore: false,
    lastQuery: null,
    loadingData: false,
    loadingOption: false,
  })
}

type States = ReturnType<typeof useSelectStates>

export const useSelect: Function = (props, states: States, ctx) => {
  const { t } = useLocale()
  const ns = useNamespace('select')

  useDeprecated(
    {
      from: 'suffixTransition',
      replacement: 'override style scheme',
      version: '2.3.0',
      scope: 'props',
      ref: 'https://element-plus.org/en-US/component/select.html#select-attributes',
    },
    computed(() => props.suffixTransition === false),
  )

  // template refs
  const reference = ref<ComponentPublicInstance<{
    focus: () => void
    blur: () => void
    input: HTMLInputElement
  }> | null>(null)
  const input = ref<HTMLInputElement | null>(null)
  const iOSInput = ref<HTMLInputElement | null>(null)
  const tooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null)
  const tagTooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null)
  const tags = ref<HTMLElement | null>(null)
  const selectWrapper = ref<HTMLElement | null>(null)
  const scrollbar = ref<InstanceType<typeof ElScrollbar> | null>(null)
  const hoverOption = ref()
  const queryChange = shallowRef<QueryChangeCtx>({ query: '' })
  const groupQueryChange = shallowRef('')
  const optionList = ref<string[]>([])
  let originClientHeight = 0

  const { form, formItem } = useFormItem()

  const readonly = computed(() => !props.filterable || props.multiple || !states.visible)

  const selectDisabled = computed(() => props.disabled || form?.disabled)

  const showClose = computed(() => {
    const hasValue = props.multiple
      ? Array.isArray(props.modelValue) && props.modelValue.length > 0
      : props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== ''

    const criteria = props.clearable && !selectDisabled.value && states.inputHovering && hasValue
    return criteria
  })
  const iconComponent = computed(() =>
    props.remote && props.filterable && !props.remoteShowSuffix ? '' : props.suffixIcon,
  )
  const iconReverse = computed(() => ns.is('reverse', iconComponent.value && states.visible && props.suffixTransition))

  // Consistent with the processing of Form in the input component
  const showStatusIconAndState = computed(
    () => form?.statusIcon && formItem?.validateState && ValidateComponentsMap[formItem?.validateState],
  )

  const debounce = computed(() => props.inputQueryWait || 0)

  const emptyText = computed(() => {
    if (showLoading.value) {
      return props.loadingText || t('el.select.loading')
    } else {
      if (props.remote && states.query === '' && states.items.length === 0) return false
      if (props.filterable && states.query && states.items.length > 0 && states.filteredOptionsCount === 0) {
        return props.noMatchText || t('el.select.noMatch')
      }
      if (states.total === 0) {
        return props.noDataText || t('el.select.noData')
      }
    }
    return null
  })

  const optionsArray = computed(() => {
    const list = Array.from(states.options.values())
    const newList = []
    optionList.value.forEach((item) => {
      const index = list.findIndex((i) => i.currentLabel === item)
      if (index > -1) {
        newList.push(list[index])
      }
    })
    return newList.length >= list.length ? newList : list
  })

  const cachedOptionsArray = computed(() => Array.from(states.cachedOptions.values()))

  const showNewOption = computed(() => {
    const hasExistingOption = optionsArray.value
      .filter((option) => {
        return !option.created
      })
      .some((option) => {
        return option.currentLabel === states.query
      })
    return props.filterable && props.allowCreate && states.query !== '' && !hasExistingOption
  })

  const selectSize = useFormSize()

  const collapseTagSize = computed(() => (['small'].includes(selectSize.value) ? 'small' : 'default'))

  const dropMenuVisible = computed({
    get() {
      return states.visible && emptyText.value !== false
    },
    set(val: boolean) {
      states.visible = val
    },
  })

  // watch
  watch([() => selectDisabled.value, () => selectSize.value, () => form?.size], () => {
    nextTick(() => {
      resetInputHeight()
    })
  })

  watch(
    () => props.placeholder,
    (val) => {
      states.cachedPlaceHolder = states.currentPlaceholder = val

      const hasValue = props.multiple && Array.isArray(props.modelValue) && props.modelValue.length > 0

      if (hasValue) {
        states.currentPlaceholder = ''
      }
    },
  )

  watch(
    () => props.modelValue,
    (val, oldVal) => {
      if (props.multiple) {
        resetInputHeight()
        if ((val && val.length > 0) || (input.value && states.query !== '')) {
          states.currentPlaceholder = ''
        } else {
          states.currentPlaceholder = states.cachedPlaceHolder
        }
        if (props.filterable && !props.reserveKeyword) {
          states.query = ''
          handleQueryChange(states.query)
        }
      }
      setSelected()
      if (props.filterable && !props.multiple) {
        states.inputLength = 20
      }
      if (!isEqual(val, oldVal) && props.validateEvent) {
        formItem?.validate('change').catch((err) => debugWarn(err))
      }
    },
    {
      flush: 'post',
      deep: true,
    },
  )

  watch(
    () => states.visible,
    (val) => {
      if (!val) {
        if (props.filterable) {
          if (isFunction(props.filterMethod)) {
            props.filterMethod('')
          }
          if (isFunction(props.remoteMethod)) {
            props.remoteMethod('')
          }
        }
        states.query = ''
        states.previousQuery = null
        states.selectedLabel = ''
        states.inputLength = 20
        states.menuVisibleOnFocus = false
        resetHoverIndex()
        nextTick(() => {
          if (input.value && input.value.value === '' && states.selected.length === 0) {
            states.currentPlaceholder = states.cachedPlaceHolder
          }
        })

        if (!props.multiple) {
          if (states.selected) {
            if (props.filterable && props.allowCreate && states.createdSelected && states.createdLabel) {
              states.selectedLabel = states.createdLabel
            } else {
              states.selectedLabel = states.selected.currentLabel
            }
            if (props.filterable) states.query = states.selectedLabel
          }

          if (props.filterable) {
            states.currentPlaceholder = states.cachedPlaceHolder
          }
        }
      } else {
        tooltipRef.value?.updatePopper?.()

        if (props.filterable) {
          states.filteredOptionsCount = states.optionsCount
          states.query = props.remote ? '' : states.selectedLabel
          iOSInput.value?.focus?.()
          if (props.multiple) {
            input.value?.focus()
          } else {
            if (states.selectedLabel) {
              states.currentPlaceholder = `${states.selectedLabel}`
              states.selectedLabel = ''
            }
          }
          handleQueryChange(states.query)
          if (!props.multiple && !props.remote) {
            queryChange.value.query = ''

            triggerRef(queryChange)
            triggerRef(groupQueryChange)
          }
        }
      }
      ctx.emit('visible-change', val)
    },
  )

  watch(
    // fix `Array.prototype.push/splice/..` cannot trigger non-deep watcher
    // https://github.com/vuejs/vue-next/issues/2116
    () => states.options.entries(),
    () => {
      if (!isClient) return
      tooltipRef.value?.updatePopper?.()
      if (props.multiple) {
        resetInputHeight()
      }
      const inputs = selectWrapper.value?.querySelectorAll('input') || []
      if (
        (!props.filterable && !props.defaultFirstOption && !isUndefined(props.modelValue)) ||
        !Array.from(inputs).includes(document.activeElement as HTMLInputElement)
      ) {
        setSelected()
      }
      if (props.defaultFirstOption && (props.filterable || props.remote) && states.filteredOptionsCount) {
        checkDefaultFirstOption()
      }
    },
    {
      flush: 'post',
    },
  )

  watch(
    () => states.hoverIndex,
    (val) => {
      if (isNumber(val) && val > -1) {
        hoverOption.value = optionsArray.value[val] || {}
      } else {
        hoverOption.value = {}
      }
      optionsArray.value.forEach((option) => {
        option.hover = hoverOption.value === option
      })
    },
  )

  // methods
  const resetInputHeight = () => {
    nextTick(() => {
      if (!reference.value) return
      const input = reference.value.$el.querySelector('input') as HTMLInputElement
      originClientHeight = originClientHeight || (input.clientHeight > 0 ? input.clientHeight + 2 : 0)
      const _tags = tags.value
      const cssVarOfSelectSize = getComputedStyle(input).getPropertyValue(ns.cssVarName('input-height'))
      const gotSize = Number.parseFloat(cssVarOfSelectSize) || getComponentSize(selectSize.value || form?.size)

      const sizeInMap =
        selectSize.value || gotSize === originClientHeight || originClientHeight <= 0 ? gotSize : originClientHeight

      const isElHidden = input.offsetParent === null

      // it's an inner input so reduce it by 2px.
      !isElHidden &&
        (input.style.height = `${
          (states.selected.length === 0
            ? sizeInMap
            : Math.max(_tags ? _tags.clientHeight + (_tags.clientHeight > sizeInMap ? 6 : 0) : 0, sizeInMap)) - 2
        }px`)

      if (states.visible && emptyText.value !== false) {
        tooltipRef.value?.updatePopper?.()
      }
    })
  }

  const handleQueryChange = async (val) => {
    if (states.previousQuery === val || states.isOnComposition) return
    if (states.previousQuery === null && (isFn(props.filterMethod) || isFn(props.remoteMethod))) {
      states.previousQuery = val

      if (states.lastQuery) {
        await loadData()
        states.lastQuery = null
      }

      return
    }
    states.previousQuery = val
    nextTick(() => {
      if (states.visible) tooltipRef.value?.updatePopper?.()
    })
    states.hoverIndex = -1
    if (props.multiple && props.filterable) {
      nextTick(() => {
        // fix: https://github.com/element-plus/element-plus/issues/13872
        if (!selectDisabled.value) {
          const length = input.value.value.length * 15 + 20
          states.inputLength = props.collapseTags ? Math.min(50, length) : length
          managePlaceholder()
        }
        resetInputHeight()
      })
    }

    await loadData()

    states.lastQuery = val
    queryChange.value.query = val
    triggerRef(queryChange)
    triggerRef(groupQueryChange)

    /*if (props.remote && isFn(props.remoteMethod)) {
      states.hoverIndex = -1
      props.remoteMethod(val)
    } else if (isFn(props.filterMethod)) {
      props.filterMethod(val)
      triggerRef(groupQueryChange)
    } else {
      states.filteredOptionsCount = states.optionsCount
      queryChange.value.query = val

      triggerRef(queryChange)
      triggerRef(groupQueryChange)
    }*/

    if (props.defaultFirstOption && (props.filterable || props.remote) && states.filteredOptionsCount) {
      await nextTick()
      checkDefaultFirstOption()
    }
  }

  const managePlaceholder = () => {
    if (states.currentPlaceholder !== '') {
      states.currentPlaceholder = input.value!.value ? '' : states.cachedPlaceHolder
    }
  }

  /**
   * find and highlight first option as default selected
   * @remark
   * - if the first option in dropdown list is user-created,
   *   it would be at the end of the optionsArray
   *   so find it and set hover.
   *   (NOTE: there must be only one user-created option in dropdown list with query)
   * - if there's no user-created option in list, just find the first one as usual
   *   (NOTE: exclude options that are disabled or in disabled-group)
   */
  const checkDefaultFirstOption = () => {
    const optionsInDropdown = optionsArray.value.filter((n) => n.visible && !n.disabled && !n.states.groupDisabled)
    const userCreatedOption = optionsInDropdown.find((n) => n.created)
    const firstOriginOption = optionsInDropdown[0]
    states.hoverIndex = getValueIndex(optionsArray.value, userCreatedOption || firstOriginOption)
  }

  const setSelected = async () => {
    if (!props.multiple) {
      const option = await getOption(props.modelValue)

      if (props.onSetSelected && states.hoverIndex) {
        if (!option.$el) {
          props.onSetSelected(option)
        } else {
          const item = states.items.find((item) => item[props.itemValue] === props.modelValue)
          item && props.onSetSelected(item)
        }
      }

      if (option.props?.created) {
        states.createdLabel = option.props.value
        states.createdSelected = true
      } else {
        states.createdSelected = false
      }

      states.selectedLabel = option.currentLabel
      states.selected = option

      if (props.filterable) states.query = states.selectedLabel

      if (option.currentLabel === option.value && props.itemType === 'object' && props.currentLabel) {
        states.selectedLabel = props.currentLabel
      }
      return
    } else {
      states.selectedLabel = ''
    }

    const result = []

    if (Array.isArray(props.modelValue)) {
      for (let i = 0; i < props.modelValue.length; i++) {
        const value = props.modelValue[i]

        if (props.currentLabel?.length) {
          result.push({
            value,
            currentLabel: props.currentLabel[i] || '',
          })
        } else {
          result.push(await getOption(value))
        }
      }
    }

    states.selected = result

    nextTick(() => {
      resetInputHeight()
    })
  }

  const getOption = async (value, notNew?: boolean) => {
    let option, optionData
    const isObjectValue = isObject(value)
    const isValidValue = isValid(value)

    for (let i = states.cachedOptions.size - 1; i >= 0; i--) {
      const cachedOption = cachedOptionsArray.value[i]
      const isEqualValue = isObjectValue
        ? get(cachedOption.value, props.valueKey) === get(value, props.valueKey)
        : cachedOption.value === value
      if (isEqualValue) {
        option = {
          value,
          currentLabel: cachedOption.currentLabel,
          isDisabled: cachedOption.isDisabled,
        }
        optionData = states.items[i]
        break
      }
    }

    optionData && props.onLoadOption?.(optionData)

    if (option || notNew) return option

    const label = isObjectValue ? value.label : isValidValue ? value : ''
    let newOption = {
      value,
      currentLabel: label,
    }

    if (props.itemType === 'object' && states.total > 0 && !!value && !props.lazy) {
      states.loadingOption = true
      newOption = (await loadOption(value)) || newOption
      states.loadingOption = false
    }

    if (props.multiple) {
      ;(newOption as any).hitState = false
    }
    return newOption
  }

  const getFilter = () => {
    const filter = merge({}, props.params, states.pagination, {
      size: props.pageSize,
    })
    const query = states.query.trim()

    if (query) {
      merge(filter, {
        where: {
          [props.itemQuery || props.itemLabel]: {
            like: escapeRegExp(query),
            options: 'i',
          },
        },
      })
    }

    return filter
  }

  const resetHoverIndex = () => {
    setTimeout(() => {
      const valueKey = props.valueKey
      if (!props.multiple) {
        states.hoverIndex = optionsArray.value.findIndex((item) => {
          return getValueKey(item) === getValueKey(states.selected)
        })
      } else {
        if (states.selected.length > 0) {
          states.hoverIndex = Math.min.apply(
            null,
            states.selected.map((selected) => {
              return optionsArray.value.findIndex((item) => {
                return get(item, valueKey) === get(selected, valueKey)
              })
            }),
          )
        } else {
          states.hoverIndex = -1
        }
      }
    }, 300)
  }

  const handleResize = () => {
    resetInputWidth()
    tooltipRef.value?.updatePopper?.()
    props.multiple && resetInputHeight()
  }

  const resetInputWidth = () => {
    states.inputWidth = reference.value?.$el.offsetWidth
  }

  const onInputChange = () => {
    if (props.filterable && states.query !== states.selectedLabel) {
      states.query = states.selectedLabel
      handleQueryChange(states.query)
    }
  }

  const debouncedOnInputChange = lodashDebounce(() => {
    onInputChange()
  }, debounce.value)

  const debouncedQueryChange = lodashDebounce((e) => {
    handleQueryChange(e.target.value)
  }, debounce.value)

  const emitChange = (val) => {
    if (!isEqual(props.modelValue, val)) {
      ctx.emit(CHANGE_EVENT, val)

      if (props.multiple) {
        const uniqArr =
          uniqBy([...states.selected, ...states.cachedOptions.values(), ...states.options.values()], 'value') || []
        const changeLabels = uniqArr.filter((t) => val.includes(t.value)).map((t) => t.currentLabel || t.label)
        ctx.emit('change-label', changeLabels)
      } else {
        ctx.emit('change-label', states.options.get(val).currentLabel)
      }
    }
  }

  const getLastNotDisabledIndex = (value) => findLastIndex(value, (it) => !states.disabledOptions.has(it))

  const deletePrevTag = (e) => {
    if (e.code === EVENT_CODE.delete) return
    if (e.target.value.length <= 0 && !toggleLastOptionHitState()) {
      const value = props.modelValue.slice()
      const lastNotDisabledIndex = getLastNotDisabledIndex(value)
      if (lastNotDisabledIndex < 0) return
      value.splice(lastNotDisabledIndex, 1)
      ctx.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
    }

    if (e.target.value.length === 1 && props.modelValue.length === 0) {
      states.currentPlaceholder = states.cachedPlaceHolder
    }
  }

  const deleteTag = (event, tag) => {
    const index = states.selected.indexOf(tag)
    if (index > -1 && !selectDisabled.value) {
      const value = props.modelValue.slice()
      value.splice(index, 1)
      ctx.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
      ctx.emit('remove-tag', tag.value)
    }
    event.stopPropagation()
    focus()
  }

  const deleteSelected = (event) => {
    event.stopPropagation()
    const value: string | any[] = props.multiple ? [] : ''
    if (!isString(value)) {
      for (const item of states.selected) {
        if (item.isDisabled) (value as any[]).push(item.value)
      }
    }
    ctx.emit(UPDATE_MODEL_EVENT, value)
    emitChange(value)
    states.hoverIndex = -1
    states.visible = false
    ctx.emit('clear')
    focus()
  }

  const handleOptionSelect = (option) => {
    ctx.emit('option-select', option)

    if (props.multiple) {
      const value = (props.modelValue || []).slice()
      const optionIndex = getValueIndex(value, option.value)
      if (optionIndex > -1) {
        value.splice(optionIndex, 1)
      } else if (props.multipleLimit <= 0 || value.length < props.multipleLimit) {
        value.push(option.value)
      }
      ctx.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
      if (option.created) {
        states.query = ''
        handleQueryChange('')
        states.inputLength = 20
      }
      if (props.filterable) input.value?.focus()
    } else {
      const value = option.value

      if (option.created) {
        // 因为调整了setSelected为异步
        setTimeout(() => {
          states.visible = false
        }, 0)
        ctx.emit('create', value)
        if (props.createValidate && !props.createValidate(value)) return
      } else {
        states.visible = false
      }

      ctx.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
    }

    setSoftFocus()
    if (states.visible) return
    nextTick(() => {
      scrollToOption(option)
    })
  }

  const getValueIndex = (arr: any[] = [], value) => {
    if (!isObject(value)) return arr.indexOf(value)

    const valueKey = props.valueKey
    let index = -1
    arr.some((item, i) => {
      if (toRaw(get(item, valueKey)) === get(value, valueKey)) {
        index = i
        return true
      }
      return false
    })
    return index
  }

  const setSoftFocus = () => {
    const _input = input.value || reference.value
    if (_input) {
      _input?.focus()
    }
  }

  const scrollToOption = async (option) => {
    const targetOption = Array.isArray(option) ? option[0] : option
    let target = null

    if (targetOption?.value) {
      const options = optionsArray.value.filter((item) => item.value === targetOption.value)
      if (options.length > 0) {
        target = options[0].$el
      }
    } else if (!Array.isArray(option)) {
      const option = await getOption(props.modelValue, true)
      if (option?.$el) {
        target = option.$el
        // states.selected = option
      }
    }

    if (tooltipRef.value && target) {
      const menu = tooltipRef.value?.popperRef?.contentRef?.querySelector?.(`.${ns.be('dropdown', 'wrap')}`)
      if (menu) {
        scrollIntoView(menu as HTMLElement, target)
      }
    }
    scrollbar.value?.handleScroll()
  }

  const onOptionCreate = (vm: SelectOptionProxy) => {
    states.optionsCount++
    states.filteredOptionsCount++
    states.options.set(vm.value, vm)
    states.cachedOptions.set(vm.value, vm)
    vm.disabled && states.disabledOptions.set(vm.value, vm)
  }

  const onOptionDestroy = (key, vm: SelectOptionProxy) => {
    if (states.options.get(key) === vm) {
      states.optionsCount--
      states.filteredOptionsCount--
      states.options.delete(key)
    }
  }

  const resetInputState = (e: KeyboardEvent) => {
    if (e.code !== EVENT_CODE.backspace) toggleLastOptionHitState(false)
    states.inputLength = input.value!.value.length * 15 + 20
    resetInputHeight()
  }

  const toggleLastOptionHitState = (hit?: boolean) => {
    if (!Array.isArray(states.selected)) return
    const lastNotDisabledIndex = getLastNotDisabledIndex(states.selected.map((it) => it.value))
    const option = states.selected[lastNotDisabledIndex]
    if (!option) return

    if (hit === true || hit === false) {
      option.hitState = hit
      return hit
    }

    option.hitState = !option.hitState
    return option.hitState
  }

  const handleComposition = (event) => {
    const text = event.target.value
    if (event.type === 'compositionend') {
      states.isOnComposition = false
      nextTick(() => handleQueryChange(text))
    } else {
      const lastCharacter = text[text.length - 1] || ''
      states.isOnComposition = !isKorean(lastCharacter)
    }
  }

  const handleMenuEnter = () => {
    nextTick(() => scrollToOption(states.selected))
  }

  const handleFocus = (event: FocusEvent) => {
    if (!states.focused) {
      if (props.automaticDropdown || props.filterable) {
        if (props.filterable && !states.visible) {
          states.menuVisibleOnFocus = true
        }
        states.visible = true
      }
      states.focused = true
      ctx.emit('focus', event)
    }
  }

  const focus = () => {
    if (states.visible) {
      ;(input.value || reference.value)?.focus()
    } else {
      reference.value?.focus()
    }
  }

  const blur = () => {
    states.visible = false
    reference.value?.blur()
    iOSInput.value?.blur?.()
  }

  const handleBlur = (event: FocusEvent) => {
    // validate current focus event is inside el-tooltip-content or el-select
    // if so, ignore the blur event.
    if (
      tooltipRef.value?.isFocusInsideContent(event) ||
      tagTooltipRef.value?.isFocusInsideContent(event) ||
      selectWrapper.value?.contains(event.relatedTarget as Node)
    ) {
      return
    }

    states.visible && handleClose()
    states.focused = false
    ctx.emit('blur', event)
  }

  const handleClearClick = (event: Event) => {
    deleteSelected(event)
  }

  const handleClose = () => {
    states.visible = false
  }

  const handleKeydownEscape = (event: KeyboardEvent) => {
    if (states.visible) {
      event.preventDefault()
      event.stopPropagation()
      states.visible = false
    }
  }

  const toggleMenu = (e?: PointerEvent) => {
    if (e && !states.mouseEnter) {
      return
    }
    if (!selectDisabled.value) {
      if (states.menuVisibleOnFocus) {
        states.menuVisibleOnFocus = false
      } else {
        if (!tooltipRef.value || !tooltipRef.value.isFocusInsideContent()) {
          states.visible = !states.visible
        }
      }
      focus()
    }
  }

  const selectOption = () => {
    if (!states.visible) {
      toggleMenu()
    } else {
      if (optionsArray.value[states.hoverIndex]) {
        handleOptionSelect(optionsArray.value[states.hoverIndex])
      }
    }
  }

  const getValueKey = (item) => {
    return isObject(item.value) ? get(item.value, props.valueKey) : item.value
  }

  const optionsAllDisabled = computed(() =>
    optionsArray.value.filter((option) => option.visible).every((option) => option.disabled),
  )

  const showTagList = computed(() => (props.multiple ? states.selected.slice(0, props.maxCollapseTags) : []))

  const collapseTagList = computed(() => (props.multiple ? states.selected.slice(props.maxCollapseTags) : []))

  const navigateOptions = (direction) => {
    if (!states.visible) {
      states.visible = true
      return
    }
    if (states.options.size === 0 || states.filteredOptionsCount === 0) return
    if (states.isOnComposition) return

    if (!optionsAllDisabled.value) {
      if (direction === 'next') {
        states.hoverIndex++
        if (states.hoverIndex === states.options.size) {
          states.hoverIndex = 0
        }
      } else if (direction === 'prev') {
        states.hoverIndex--
        if (states.hoverIndex < 0) {
          states.hoverIndex = states.options.size - 1
        }
      }
      const option = optionsArray.value[states.hoverIndex]
      if (option.disabled === true || option.states.groupDisabled === true || !option.visible) {
        navigateOptions(direction)
      }
      nextTick(() => scrollToOption(hoverOption.value))
    }
  }

  const handleMouseEnter = () => {
    states.mouseEnter = true
  }

  const handleMouseLeave = () => {
    states.mouseEnter = false
  }
  const handleDeleteTooltipTag = (event, tag) => {
    deleteTag(event, tag)
    tagTooltipRef.value?.updatePopper?.()
  }

  // computed style
  // if in form and use statusIcon, the width of the icon needs to be subtracted, fix #13526
  const selectTagsStyle = computed(() => ({
    maxWidth: `${unref(states.inputWidth) - 32 - (showStatusIconAndState.value ? 22 : 0)}px`,
    width: '100%',
  }))

  const showLoading = computed(() => {
    return props.loading || states.loadingOption || states.loadingData
  })

  const loadingTxt = computed(() => {
    return props.loadingText || i18n.t('packages_form_el_select_loading')
  })

  const noMore = computed(() => {
    return states.pagination.page >= Math.ceil(states.total / props.pageSize)
  })

  const scrollDisabled = computed(() => {
    return props.loading || noMore.value || states.loadingMore
  })

  const debounceLoadData = lodashDebounce(() => {
    loadData()
  }, props.debounceWait)

  watch(
    () => props.params,
    (val, old) => {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        states.lastQuery = null
        states.query = ''
        debounceLoadData()
      }
    },
    { deep: true },
  )

  watch(
    () => states.visible,
    (v) => {
      if (props.lazy && !states.items.length && v) {
        loadData()
      }
    },
  )

  onMounted(async () => {
    if (!props.lazy) await loadData()
  })

  const loadOption = async (value) => {
    const { itemValue, itemLabel } = props
    const filter = merge({}, props.params, {
      where: { [itemValue]: value },
      size: 1,
    })
    const { items } = await props.method(filter)
    const [item] = items
    if (item) {
      return {
        ...item,
        value,
        currentLabel: item[itemLabel],
      }
    }
  }

  let cancelSource
  const loadData = async (isMore?: boolean) => {
    cancelSource?.cancel()
    cancelSource = CancelToken.source()
    if (isMore) {
      states.pagination.page++
      states.loadingMore = true
    } else {
      states.loadingData = true
      states.pagination.page = 1
      states.total = 0
    }

    try {
      const { items, total } = await props.method(getFilter(), {
        cancelToken: cancelSource.token,
      })
      states.total = total
      if (isMore) {
        states.items.push(...items)
        states.loadingMore = false
      } else {
        scrollbar.value?.setScrollTop(0)
        states.items = items
        states.loadingData = false
        nextTick(() => {
          scrollbar.value?.setScrollTop(0)
          scrollbar.value?.handleScroll()
        })
      }
    } catch (e) {
      states.loadingMore = false
      console.log('AsyncSelect.loadDat', e) // eslint-disable-line
    }
  }

  const loadMore = async () => {
    await loadData(true)
  }

  return {
    optionList,
    optionsArray,
    hoverOption,
    selectSize,
    handleResize,
    debouncedOnInputChange,
    debouncedQueryChange,
    deletePrevTag,
    deleteTag,
    deleteSelected,
    handleOptionSelect,
    scrollToOption,
    readonly,
    resetInputHeight,
    showClose,
    iconComponent,
    iconReverse,
    showNewOption,
    collapseTagSize,
    setSelected,
    managePlaceholder,
    selectDisabled,
    emptyText,
    toggleLastOptionHitState,
    resetInputState,
    handleComposition,
    onOptionCreate,
    onOptionDestroy,
    handleMenuEnter,
    handleFocus,
    focus,
    blur,
    handleBlur,
    handleClearClick,
    handleClose,
    handleKeydownEscape,
    toggleMenu,
    selectOption,
    getValueKey,
    navigateOptions,
    handleDeleteTooltipTag,
    dropMenuVisible,
    queryChange,
    groupQueryChange,
    showTagList,
    collapseTagList,

    // computed style
    selectTagsStyle,

    // DOM ref
    reference,
    input,
    iOSInput,
    tooltipRef,
    tagTooltipRef,
    tags,
    selectWrapper,
    scrollbar,

    // Mouser Event
    handleMouseEnter,
    handleMouseLeave,

    noMore,
    scrollDisabled,
    loadMore,
    loadData,
    showLoading,
  }
}
