import * as Vue from 'vue'
import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, computed } from 'vue'
import { useForm } from '@tap/form'
import { FormItem } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { EmptyItem } from '@tap/component'
import { taskApi } from '@tap/api'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import List from './List.vue'
import './style.scss'
import { debounce } from 'lodash'
import { useStore } from 'vuex'

// 源节点改变，表编辑按照批量配置重新应用，重新应用的场景如下：
// 1. 记录源节点id，表编辑节点渲染时进行判断，如果源节点和上次记录的不同，重新应用批量规则
// 2. 用户停留在表编辑节点时，监听源节点ID变化，重新应用批量规则

export const TableRename = observer(
  defineComponent({
    props: ['findParentNodes', 'value', 'listStyle', 'disabled'],
    setup(props, { emit, refs }) {
      const store = useStore()
      const itemSize = 38
      const formRef = useForm()
      const form = formRef.value
      const tableDataRef = ref([])
      let tableMap = {}
      const loading = ref(false)
      let countByName = ref({})
      let nameMap = reactive(
        props.value
          ? props.value.reduce((obj, item) => {
              obj[item.previousTableName] = item.currentTableName

              if (item.currentTableName in countByName.value) {
                countByName.value[item.currentTableName]++
              } else {
                countByName.value[item.currentTableName] = 1
              }
              return obj
            }, {})
          : {},
      )
      const config = reactive({
        search: '',
        replaceBefore: form.values.replaceBefore, // 替换前
        replaceAfter: form.values.replaceAfter || '', // 替换后
        prefix: form.values.prefix || '', // 前缀
        suffix: form.values.suffix || '', // 后缀
        transferCase: form.values.transferCase || '', // toUpperCase ｜ toLowerCase
        transformLoading: store.state.dataflow.transformLoading,
      })

      let prevMap = {}

      const makeTable = (...args) => {
        if (form.values.$inputs?.length) {
          const { taskId } = store.state.dataflow
          loading.value = true
          taskApi
            .getNodeTableInfo({
              taskId,
              nodeId: form.values.id,
              page: 1,
              pageSize: 10000,
            })
            .then(({ items = [] }) => {
              prevMap = {}
              tableMap = {}
              tableDataRef.value = items.map((item) => {
                prevMap[item.previousTableName] = item.sourceObjectName
                tableMap[item.previousTableName] = true

                // TM会主动修改表编辑节点,节点不会自动刷新,在这里同步最新的表推演
                if (item.previousTableName !== item.sinkObjectName && !nameMap[item.previousTableName]) {
                  nameMap[item.previousTableName] = item.sinkObjectName
                  // set(nameMap, item.previousTableName, item.sinkObjectName)
                }

                return item.previousTableName
              })

              // 新创建的源节点按表达式选表，tableNames 为空
              // 导致表编辑校验时拿不到源表名无法正确的校验
              // 这里把拿到的表名设置到源节点上（跟TM沟通，当表达式选表时，TM不会读取只会写入tableNames，所以不会影响到）
              const parents = props.findParentNodes(form.values.id)
              if (
                tableDataRef.value.length &&
                parents &&
                parents.length &&
                !parents[0].tableNames?.length &&
                parents[0].migrateTableSelectType === 'expression'
              ) {
                parents[0].tableNames = tableDataRef.value.slice()
              }

              // 将源节点的ID保存在attrs中，用于后续的校验
              const { sourceId } = form.values.attrs || {}
              const inputId = parents[0]?.id

              // 检查源节点是否发生变化，如果发生有效变化（新的源节点选了表），重新应用批量规则
              if (sourceId && sourceId !== inputId && items.length) {
                form.values.attrs.sourceId = inputId
                doModify()
              } else if (!sourceId && inputId) {
                form.values.attrs.sourceId = inputId
              }
            })
            .finally(() => {
              loading.value = false
            })
        } else {
          tableDataRef.value = []
        }
      }

      makeTable()

      // 源节点发生变化，任务保存后加载模型
      useAfterTaskSaved(formRef.value.values.$inputs, makeTable)

      const updateName = (val, name) => {
        if (val !== name) {
          nameMap[name] = val
          // set(nameMap, name, val)
        } else {
          delete nameMap[name]
          // del(nameMap, name)
        }
      }

      const filterNames = computed(() => {
        const txt = config.search.trim().toLowerCase()
        if (txt) {
          return tableDataRef.value.filter((n) => n.toLowerCase().includes(txt))
        }
        return tableDataRef.value
      })

      const doModify = () => {
        console.log('doModify') // eslint-disable-line
        const target = tableDataRef.value
        let flag
        // let skipTableName = []
        target.forEach((n) => {
          let after = n
          after = config.replaceBefore
            ? after.replace(new RegExp(config.replaceBefore, 'g'), config.replaceAfter)
            : after
          after = config.prefix + after + config.suffix
          if (config.transferCase) {
            after = after[config.transferCase]()
          }
          if (n !== after) {
            if (nameMap[n] === after) return
            nameMap[n] = after
            // set(nameMap, n, after)
            flag = true
          } else if (n in nameMap) {
            delete nameMap[n]
            // del(nameMap, n)
            flag = true
          }
        })

        updateConfig()

        flag && emitChange()
      }

      const lazyModify = debounce(doModify, 1000)

      const doReset = () => {
        Object.assign(config, {
          search: '',
          replaceBefore: '',
          replaceAfter: '',
          prefix: '',
          suffix: '',
          transferCase: '',
        })
        updateConfig()
      }

      const resetNames = () => {
        doReset()
        const keys = Object.keys(nameMap)
        if (keys.length) {
          keys.forEach((key) => {
            delete nameMap[key]
          })
          emitChange()
        }
      }

      const emitChange = () => {
        const arr = []
        let _countByName = {}
        Object.entries(nameMap).forEach(([previousTableName, currentTableName]) => {
          // tableNames 里面源表名不存在的会被清掉
          const originTableName = prevMap[previousTableName]
          if (originTableName) {
            arr.push({
              originTableName,
              previousTableName,
              currentTableName,
            })
            if (currentTableName in _countByName) {
              _countByName[currentTableName]++
            } else {
              _countByName[currentTableName] = 1
            }
          }
        })
        countByName.value = _countByName
        emit('change', arr)
      }

      const updateConfig = () => {
        form.setValues({
          replaceBefore: config.replaceBefore, // 替换前
          replaceAfter: config.replaceAfter, // 替换后
          prefix: config.prefix, // 前缀
          suffix: config.suffix, // 后缀
          transferCase: config.transferCase, // toUpperCase ｜ toLowerCase
        })
      }

      const scrollToItem = (index) => {
        refs.nameList.scrollTop = index * itemSize
      }

      return {
        config,
        filterNames,
        updateName,
        resetNames,
        doModify,
        lazyModify,
        doReset,
        emitChange,
        nameMap,
        tableData: tableDataRef,
        loading,
        countByName,
        itemSize,
      }
    },

    render() {
      const label = (
        <div class="inline-flex align-center position-absolute w-100">
          <span class="mr-2 flex-1">{i18n.t('packages_form_table_rename_rule_config')}</span>
          <ElLink disabled={this.disabled} onClick={this.resetNames} type="primary">
            <div class="flex align-center px-1">
              <VIcon class="mr-1">reset</VIcon>
              {i18n.t('public_button_reset')}
            </div>
          </ElLink>
        </div>
      )
      return (
        <div class="table-rename">
          <FormItem.BaseItem label={label}>
            <div class="border border-form px-4 pb-2 rounded-4">
              <FormItem.BaseItem label={i18n.t('packages_form_table_rename_index_tihuan')}>
                <div class="flex">
                  <ElInput
                    v-model={this.config.replaceBefore}
                    disabled={this.disabled}
                    clearable
                    onInput={this.lazyModify}
                  />
                  <div class="px-4 text-nowrap font-color-light">
                    {i18n.t('packages_form_table_rename_index_gaiwei')}
                  </div>
                  <ElInput
                    v-model={this.config.replaceAfter}
                    disabled={this.disabled}
                    clearable
                    onInput={this.lazyModify}
                  />
                </div>
              </FormItem.BaseItem>
              <div class="flex gap-4">
                <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_daxiaoxie')}>
                  <ElSelect
                    v-model={this.config.transferCase}
                    disabled={this.disabled}
                    onChange={this.doModify}
                    class="w-auto"
                  >
                    <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                    <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                    <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
                  </ElSelect>
                </FormItem.BaseItem>
                <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_qianzhui')}>
                  <ElInput v-model={this.config.prefix} disabled={this.disabled} clearable onInput={this.lazyModify} />
                </FormItem.BaseItem>
                <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
                  <ElInput v-model={this.config.suffix} disabled={this.disabled} clearable onInput={this.lazyModify} />
                </FormItem.BaseItem>
              </div>
            </div>
          </FormItem.BaseItem>

          <div class="flex mt-4">
            <ElInput
              v-model={this.config.search}
              disabled={this.disabled}
              clearable
              placeholder={i18n.t('packages_form_table_rename_index_sousuobiaoming')}
            >
              {{
                prefix: () => (
                  <ElIcon>
                    <ElIconSearch />
                  </ElIcon>
                ),
              }}
            </ElInput>
          </div>

          <div
            v-loading={this.$store.state.dataflow.transformLoading || this.loading}
            class="name-list flex flex-column border border-form rounded-4 overflow-hidden mt-4"
            style={this.listStyle}
          >
            <div class="name-list-header flex flex-shrink-0">
              <div class="name-list-title px-4">{i18n.t('packages_form_table_rename_index_yuanbiaoming')}</div>
              <div class="name-list-title pl-5 pr-4">{i18n.t('packages_form_table_rename_index_xinbiaoming')}</div>
            </div>
            <div ref="nameList" class="name-list-content font-color-light overflow-auto">
              {this.filterNames.length ? (
                <List
                  disabled={this.disabled}
                  items={this.filterNames}
                  itemSize={this.itemSize}
                  buffer={50}
                  countByName={this.countByName}
                  nameMap={this.nameMap}
                  tableData={this.tableData}
                  updateName={this.updateName}
                  emitChange={this.emitChange}
                ></List>
              ) : (
                <EmptyItem></EmptyItem>
              )}
            </div>
          </div>
        </div>
      )
    },
  }),
)
