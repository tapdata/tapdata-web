import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, set, del, computed, watch } from '@vue/composition-api'
import { useForm } from '@tap/form'
import { FormItem } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { VIcon, EmptyItem } from '@tap/component'
import { taskApi } from '@tap/api'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
// import 'vue-virtual-scroller/dist/vue-visafrtual-scroller.css'
// import { RecycleScroller } from 'vue-virtual-scroller'
import './style.scss'

export const TableRename = observer(
  defineComponent({
    props: ['findParentNode', 'value', 'listStyle', 'disabled'],
    setup(props, { emit, root }) {
      const formRef = useForm()
      const form = formRef.value
      const tableDataRef = ref([])
      const loading = ref(false)
      let nameMap = reactive(
        props.value
          ? props.value.reduce((obj, item) => {
              obj[item.previousTableName] = item.currentTableName
              return obj
            }, {})
          : {}
      )
      const config = reactive({
        search: '',
        replaceBefore: '',
        replaceAfter: '',
        prefix: '',
        suffix: '',
        transferCase: '',
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
              tableDataRef.value = items.map(item => {
                prevMap[item.previousTableName] = item.sourceObjectName
                return item.previousTableName
              })
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
        const target = filterNames.value
        let flag
        target.forEach(n => {
          let after = n
          after = after.replace(new RegExp(config.replaceBefore, 'g'), config.replaceAfter)
          after = config.prefix + after + config.suffix
          if (config.transferCase) {
            after = after[config.transferCase]()
          }
          if (n !== after) {
            set(nameMap, n, after)
            flag = true
          } else if (n in nameMap) {
            del(nameMap, n)
            flag = true
          }
        })
        flag && emitChange()
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
        Object.entries(nameMap).forEach(([previousTableName, currentTableName]) => {
          const originTableName = prevMap[previousTableName]
          if (originTableName) {
            arr.push({
              originTableName,
              previousTableName,
              currentTableName
            })
          }
        })
        emit('change', arr)
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
        loading
      }
    },

    render() {
      return (
        <div class="table-rename" v-loading={this.$store.state.dataflow.transformLoading || this.loading}>
          <FormItem.BaseItem label={i18n.t('packages_form_table_rename_index_sousuobiaoming')}>
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
              <div class="name-list-title px-4">{i18n.t('packages_form_table_rename_index_yuanbiaoming')}</div>
              <div class="name-list-title pl-5 pr-4">{i18n.t('packages_form_table_rename_index_xinbiaoming')}</div>
              <div class="name-list-header-extra px-4">
                <ElButton disabled={this.disabled} onClick={this.resetNames} size="mini" type="text">
                  {i18n.t('packages_form_button_reset')}
                </ElButton>
              </div>
            </div>
            <div class="name-list-content font-color-light overflow-auto">
              {this.filterNames.length ? (
                /*<RecycleScroller
                  items={this.filterNames}
                  itemSize={38}
                  buffer={50}
                  scopedSlots={{
                    default: ({ item: name }) => (
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
                            class="name-list-item-input"
                            value={this.nameMap[name] || name}
                            onChange={event => {
                              this.updateName(event.target.value, name)
                              this.emitChange()
                            }}
                          />
                        </div>
                        <VIcon size="12" class="name-list-item-center font-color-light">
                          left
                        </VIcon>
                      </div>
                    )
                  }}
                ></RecycleScroller>*/
                this.filterNames.map(name => {
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
                            this.updateName(event.target.value, name)
                            this.emitChange()
                          }}
                        />
                      </div>
                      <VIcon size="12" class="name-list-item-center font-color-light">
                        left
                      </VIcon>
                    </div>
                  )
                })
              ) : (
                <EmptyItem></EmptyItem>
              )}
            </div>
          </div>

          <div class="border border-form p-4 mt-4 rounded-2">
            <div class="font-color-light">{i18n.t('packages_form_table_rename_index_yixiacaozuojin')}</div>
            <FormItem.BaseItem label={i18n.t('packages_form_table_rename_index_tihuan')}>
              <div class="flex">
                <ElInput v-model={this.config.replaceBefore} disabled={this.disabled} clearable />
                <div class="px-4 text-nowrap font-color-light">{i18n.t('packages_form_table_rename_index_gaiwei')}</div>
                <ElInput v-model={this.config.replaceAfter} disabled={this.disabled} clearable />
              </div>
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_qianzhui')}>
              <ElInput v-model={this.config.prefix} disabled={this.disabled} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
              <ElInput v-model={this.config.suffix} disabled={this.disabled} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_daxiaoxie')}>
              <ElSelect v-model={this.config.transferCase} disabled={this.disabled}>
                <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
              </ElSelect>
            </FormItem.BaseItem>
            <div class="mt-4">
              <ElButton onClick={this.doModify} disabled={this.disabled} size="small" type="primary">
                {i18n.t('packages_form_table_rename_index_yingyong')}
              </ElButton>
              <ElButton onClick={this.doReset} disabled={this.disabled} size="small">
                {i18n.t('packages_form_table_rename_index_qingkong')}
              </ElButton>
            </div>
          </div>
        </div>
      )
    }
  })
)
