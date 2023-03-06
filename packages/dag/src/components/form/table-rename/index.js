import * as Vue from 'vue'
import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, set, del, computed } from 'vue'
import { useForm } from '@tap/form'
import { FormItem } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { EmptyItem } from '@tap/component'
import { taskApi } from '@tap/api'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import List from './List.vue'
import './style.scss'

export const TableRename = observer(
  defineComponent({
    props: ['findParentNodes', 'value', 'listStyle', 'disabled'],
    setup(props, { emit, root, refs }) {
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
          : {}
      )
      const config = reactive({
        search: '',
        replaceBefore: form.values.replaceBefore, // 替换前
        replaceAfter: form.values.replaceAfter || '', // 替换后
        prefix: form.values.prefix || '', // 前缀
        suffix: form.values.suffix || '', // 后缀
        transferCase: form.values.transferCase || '', // toUpperCase ｜ toLowerCase
        transformLoading: root.$store.state.dataflow.transformLoading
      })

      let prevMap = {}

      const makeTable = () => {
        if (form.values.$inputs?.length) {
          const { taskId } = root.$store.state.dataflow
          loading.value = true
          taskApi
            .getNodeTableInfo({
              taskId,
              nodeId: form.values.id,
              page: 1,
              pageSize: 10000
            })
            .then(({ items = [] }) => {
              prevMap = {}
              tableMap = {}
              tableDataRef.value = items.map(item => {
                prevMap[item.previousTableName] = item.sourceObjectName
                tableMap[item.previousTableName] = true
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
      useAfterTaskSaved(root, formRef.value.values.$inputs, makeTable)

      const updateName = (val, name) => {
        if (val !== name) {
          set(nameMap, name, val)
        } else {
          del(nameMap, name)
        }
      }

      const filterNames = computed(() => {
        const txt = config.search.trim().toLowerCase()
        if (txt) {
          return tableDataRef.value.filter(n => n.toLowerCase().includes(txt))
        }
        return tableDataRef.value
      })

      const doModify = () => {
        const target = tableDataRef.value
        let flag
        // let skipTableName = []
        target.forEach(n => {
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
            /*if (
              (target.includes(after) && (!nameMap[after] || nameMap[after] === after)) ||
              Object.values(nameMap).includes(after)
            ) {
              skipTableName.push(n)
              console.log('导致表名重复') // eslint-disable-line
              return
            }*/
            set(nameMap, n, after)
            flag = true
          } else if (n in nameMap) {
            del(nameMap, n)
            flag = true
          }
        })

        form.setValues({
          replaceBefore: config.replaceBefore, // 替换前
          replaceAfter: config.replaceAfter, // 替换后
          prefix: config.prefix, // 前缀
          suffix: config.suffix, // 后缀
          transferCase: config.transferCase // toUpperCase ｜ toLowerCase
        })

        flag && emitChange()

        /*if (skipTableName.length) {
          // `自动跳过针对 [${skipTableName.join(', ')}] 表名的操作，原因是会导致表名重复`
          root.$message.warning(
            i18n.global.t('packages_form_table_rename_index_daozhibiaomingchongfu', {
              val1: skipTableName.join(', ')
            })
          )
        }*/
      }

      const doReset = () => {
        Object.assign(config, {
          search: '',
          replaceBefore: '',
          replaceAfter: '',
          prefix: '',
          suffix: '',
          transferCase: ''
        })
      }

      const resetNames = () => {
        const keys = Object.keys(nameMap)
        if (keys.length) {
          keys.forEach(key => del(nameMap, key))
          emitChange()
        }
      }

      const emitChange = () => {
        const arr = []
        let _countByName = {}
        Object.entries(nameMap).forEach(([previousTableName, currentTableName]) => {
          const originTableName = prevMap[previousTableName]
          if (originTableName) {
            arr.push({
              originTableName,
              previousTableName,
              currentTableName
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

      const scrollToItem = index => {
        refs.nameList.scrollTop = index * itemSize
      }

      return {
        config,
        filterNames,
        updateName,
        resetNames,
        doModify,
        doReset,
        emitChange,
        nameMap,
        tableData: tableDataRef,
        loading,
        countByName,
        itemSize
      }
    },

    render() {
      return (
        <div class="table-rename" v-loading={this.$store.state.dataflow.transformLoading || this.loading}>
          <div class="border border-form p-4 mt-4 rounded-2">
            <div class="font-color-light">{i18n.global.t('packages_form_table_rename_index_yixiacaozuojin')}</div>
            <FormItem.BaseItem label={i18n.global.t('packages_form_table_rename_index_tihuan')}>
              <div class="flex">
                <ElInput v-model={this.config.replaceBefore} disabled={this.disabled} clearable />
                <div class="px-4 text-nowrap font-color-light">{i18n.global.t('packages_form_table_rename_index_gaiwei')}</div>
                <ElInput v-model={this.config.replaceAfter} disabled={this.disabled} clearable />
              </div>
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.global.t('packages_form_field_processor_index_qianzhui')}>
              <ElInput v-model={this.config.prefix} disabled={this.disabled} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.global.t('packages_form_field_processor_index_houzhui')}>
              <ElInput v-model={this.config.suffix} disabled={this.disabled} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.global.t('packages_form_field_processor_index_daxiaoxie')}>
              <ElSelect v-model={this.config.transferCase} disabled={this.disabled}>
                <ElOption value="" label={i18n.global.t('packages_form_field_processor_index_bubian')} />
                <ElOption value="toUpperCase" label={i18n.global.t('packages_form_field_processor_index_daxie')} />
                <ElOption value="toLowerCase" label={i18n.global.t('packages_form_field_processor_index_xiaoxie')} />
              </ElSelect>
            </FormItem.BaseItem>
            <div class="mt-4">
              <ElButton onClick={this.doModify} disabled={this.disabled} size="small" type="primary">
                {i18n.global.t('packages_form_table_rename_index_yingyong')}
              </ElButton>
              <ElButton onClick={this.doReset} disabled={this.disabled} size="small">
                {i18n.global.t('packages_form_table_rename_index_qingkong')}
              </ElButton>
            </div>
          </div>

          <FormItem.BaseItem label={i18n.global.t('packages_form_table_rename_index_sousuobiaoming')}>
            <ElInput
              v-model={this.config.search}
              disabled={this.disabled}
              prefixIcon="el-icon-search"
              clearable
            ></ElInput>
          </FormItem.BaseItem>

          <div
            class="name-list flex flex-column border border-form rounded-2 overflow-hidden mt-4"
            style={this.listStyle}
          >
            <div class="name-list-header flex flex-shrink-0">
              <div class="name-list-title px-4">{i18n.global.t('packages_form_table_rename_index_yuanbiaoming')}</div>
              <div class="name-list-title pl-5 pr-4">{i18n.global.t('packages_form_table_rename_index_xinbiaoming')}</div>
              <div class="name-list-header-extra px-4">
                <ElButton disabled={this.disabled} onClick={this.resetNames} size="mini" type="text">
                  {i18n.global.t('packages_form_button_reset')}
                </ElButton>
              </div>
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
                /*<RecycleScroller
                  items={this.filterNames}
                  itemSize={38}
                  buffer={50}
                  scopedSlots={{
                    default: ({ item: name }) => {
                      let inputVal = this.nameMap[name] || name
                      return (
                        <div class="name-list-item flex align-center position-relative">
                          <div class="flex-1 px-4 text-truncate">
                            <span title={name}>{name}</span>
                          </div>
                          <div
                            class={[
                              'flex-1 px-4 text-truncate',
                              {
                                'color-primary': !!this.nameMap[name]
                              }
                            ]}
                          >
                            <input
                              readOnly={this.disabled}
                              class="name-list-item-input px-2"
                              v-model={inputVal}
                              onChange={event => {
                                const val = event.target.value
                                console.log('this.nameMap', this.nameMap) // eslint-disable-line
                                if (val) {
                                  if (this.tableData.includes(val) || Object.values(this.nameMap).includes(val)) {
                                    event.target.value = this.nameMap[name] || name
                                    return
                                  }
                                  this.updateName(val, name)
                                  this.emitChange()
                                } else {
                                  event.target.value = name
                                  if (this.nameMap[name]) {
                                    this.$delete(this.nameMap, name)
                                    this.emitChange()
                                  }
                                }
                              }}
                            />
                          </div>
                          <VIcon size="12" class="name-list-item-center font-color-light">
                            left
                          </VIcon>
                        </div>
                      )
                    }
                  }}
                ></RecycleScroller>*/
                /*this.filterNames.map(name => {
                  return (
                    <div key={name} class="name-list-item flex align-center position-relative">
                      <div class="flex-1 px-4 text-truncate">
                        <span title={name}>{name}</span>
                      </div>
                      <div
                        class={[
                          'flex-1 px-4 text-truncate',
                          {
                            'color-primary': !!this.nameMap[name]
                          }
                        ]}
                      >
                        <input
                          readOnly={this.disabled}
                          class="name-list-item-input px-2"
                          value={this.nameMap[name] || name}
                          onChange={event => {
                            const val = event.target.value
                            if (val) {
                              this.updateName(val, name)
                              this.emitChange()
                            } else {
                              event.target.value = name
                              if (this.nameMap[name]) {
                                this.$delete(this.nameMap, name)
                                this.emitChange()
                              }
                            }
                          }}
                        />
                      </div>
                      <VIcon size="12" class="name-list-item-center font-color-light">
                        left
                      </VIcon>
                    </div>
                  )
                })*/
                <EmptyItem></EmptyItem>
              )}
            </div>
          </div>
        </div>
      )
    }
  })
)
