import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, set, del, computed } from '@vue/composition-api'
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
            set(nameMap, n, after)
            flag = true
          } else if (n in nameMap) {
            del(nameMap, n)
            flag = true
          }
        })

        updateConfig()

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
        updateConfig()
      }

      const resetNames = () => {
        doReset()
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

      const updateConfig = () => {
        form.setValues({
          replaceBefore: config.replaceBefore, // 替换前
          replaceAfter: config.replaceAfter, // 替换后
          prefix: config.prefix, // 前缀
          suffix: config.suffix, // 后缀
          transferCase: config.transferCase // toUpperCase ｜ toLowerCase
        })
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
      const label = (
        <div class="inline-flex align-center position-absolute w-100">
          <span class="mr-2 flex-1">{i18n.t('packages_form_table_rename_rule_config')}</span>
          <ElLink disabled={this.disabled} onClick={this.resetNames} size="mini" type="primary">
            <div class="flex align-center px-1">
              <VIcon class="mr-1">reset</VIcon>
              {i18n.t('public_button_reset')}
            </div>
          </ElLink>
        </div>
      )
      return (
        <div class="table-rename" v-loading={this.$store.state.dataflow.transformLoading || this.loading}>
          <FormItem.BaseItem label={label}>
            <div class="border border-form px-4 pb-2 rounded-4">
              <FormItem.BaseItem label={i18n.t('packages_form_table_rename_index_tihuan')}>
                <div class="flex">
                  <ElInput
                    v-model={this.config.replaceBefore}
                    disabled={this.disabled}
                    clearable
                    onInput={this.doModify}
                  />
                  <div class="px-4 text-nowrap font-color-light">
                    {i18n.t('packages_form_table_rename_index_gaiwei')}
                  </div>
                  <ElInput
                    v-model={this.config.replaceAfter}
                    disabled={this.disabled}
                    clearable
                    onInput={this.doModify}
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
                  <ElInput v-model={this.config.prefix} disabled={this.disabled} clearable onInput={this.doModify} />
                </FormItem.BaseItem>
                <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
                  <ElInput v-model={this.config.suffix} disabled={this.disabled} clearable onInput={this.doModify} />
                </FormItem.BaseItem>
              </div>
            </div>
          </FormItem.BaseItem>

          <div class="flex mt-4">
            <ElInput
              v-model={this.config.search}
              disabled={this.disabled}
              prefixIcon="el-icon-search"
              clearable
              placeholder={i18n.t('packages_form_table_rename_index_sousuobiaoming')}
            ></ElInput>
          </div>

          <div
            class="name-list flex flex-column border border-form rounded-2 overflow-hidden mt-4"
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
    }
  })
)
