import { defineComponent, ref, reactive } from 'vue-demi'
import { metadataTransformerApi } from '@tap/api'
import EmptyItem from 'web-core/components/EmptyItem'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import VIcon from 'web-core/components/VIcon'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import './style.scss'
import { FormItem } from '../index'
import { useForm } from '@formily/vue'

export const FieldRenameProcessor = defineComponent({
  props: ['listStyle'],
  setup(props, { emit }) {
    const formRef = useForm()
    const form = formRef.value
    const list = ref([])
    const tableList = ref([])
    const config = reactive({
      prefix: '',
      suffix: '',
      transferCase: '',
      visible: false,
      loadingNav: true,
      selectRow: '',
      fieldCount: '',
      checkAll: false,
      checkedTables: [],
      position: 0,
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      }
    })
    const loadData = () => {
      config.loadingNav = true
      let { size, current } = config.page
      let id = '62b96c293e587246d3eda22d'
      let where = {
        dataFlowId: id,
        sinkNodeId: ''
      }
      let filter = {
        where: where,
        limit: size || 10,
        skip: (current - 1) * size > 0 ? (current - 1) * size : 0
      }
      metadataTransformerApi
        .get({
          filter: JSON.stringify({})
        })
        .then(res => {
          let { total, items } = res
          list.value = items || []
          config.page.total = total
          config.page.count = Math.ceil(total / 10) === 0 ? 1 : Math.ceil(total / 10)
          updateView(config.position)
          emit('change', items)
        })
        .finally(() => (config.loadingNav = false))
    }

    const handleCheckAllChange = val => {
      config.checkAll = val
      if (val) {
        config.checkedTables = list.value.map(t => t.sinkQulifiedName)
      } else {
        config.checkedTables = []
      }
    }
    const handleCheckedTablesChange = value => {
      let checkedCount = value.length
      config.checkAll = checkedCount === list.value.length
    }
    const showOperation = () => {
      config.visible = true
    }
    const closeOperation = () => {
      config.visible = false
    }
    const renderNode = ({ row }) => {
      return (
        <div>
          <span class="mr-4">{row.targetFieldName}</span>
          <VIcon>edit</VIcon>
        </div>
      )
    }
    const updateView = index => {
      config.position = index
      config.selectRow = list.value[index]
      tableList.value = config.selectRow.fieldsMapping
      config.fieldCount = config.selectRow.sourceFieldCount - config.selectRow.userDeletedNum || 0
    }
    loadData()
    return {
      loadData,
      showOperation,
      closeOperation,
      handleCheckAllChange,
      handleCheckedTablesChange,
      renderNode,
      updateView,
      list,
      tableList,
      config,
      fieldsMapping: form.fieldsMapping
    }
  },
  render() {
    return (
      <div class="processor-field-mapping flex flex-column">
        <div class="task-form-body" style={this.listStyle}>
          <div class="task-form-left flex flex-column">
            <div class="flex mb-2 ml-2 mr-2">
              <div class="flex">
                <ElInput
                  size="mini"
                  placeholder="请输入表名"
                  suffix-icon="el-icon-search"
                  clearable
                  onInput={this.loadData}
                ></ElInput>
              </div>
            </div>
            <div class="bg-main flex justify-content-between line-height ml-2">
              <span>
                <el-checkbox v-model={this.config.checkAll} onChange={this.handleCheckAllChange}></el-checkbox>
                <span class="table-name ml-2">表名</span>
              </span>
              <span class="mr-4">
                <i class="el-icon-loading link-primary mx-2"></i>
                <span class="link-primary">
                  {0} / {0}
                </span>
              </span>
            </div>
            <div class="task-form-left__ul flex flex-column" v-loading={this.config.loadingNav}>
              {this.list.length > 0 ? (
                <ul>
                  <el-checkbox-group v-model={this.config.checkedTables} onChange={this.handleCheckedTablesChange}>
                    {this.list.map((item, index) => (
                      <li key={index} class={[this.config.position === index ? 'active' : '']}>
                        <el-checkbox class="mr-2" label={item.sinkQulifiedName}>
                          <br />
                        </el-checkbox>
                        {item.invalid ? (
                          <div class="task-form__img" onClick={() => this.updateView(index)}>
                            <img src={fieldMapping_table} alt="" />
                          </div>
                        ) : (
                          <div class="task-form__img" onClick={() => this.updateView(index)}>
                            <img src={fieldMapping_table_error} alt="" />
                          </div>
                        )}
                        <div class="task-form-text-box" onClick={() => this.updateView(index)}>
                          <OverflowTooltip
                            class="w-100 text-truncate source"
                            text={item.sourceObjectName}
                            placement="right"
                            open-delay={400}
                          />
                          <OverflowTooltip
                            class="w-100 text-truncate target"
                            text={item.sinkObjectName}
                            placement="right"
                            open-delay={400}
                          />
                          <div class="select" onClick={() => this.updateView(index)}>
                            <span>
                              <span>已选中 </span>
                              {item.sourceFieldCount - item.userDeletedNum} /{item.sourceFieldCount}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </el-checkbox-group>
                </ul>
              ) : (
                <div class="task-form-left__ul flex flex-column align-items-center">
                  <EmptyItem></EmptyItem>
                </div>
              )}
            </div>
            <ElPagination
              small
              class="flex mt-3 din-font"
              layout="total, prev, slot, next"
              current-page={this.config.page.current}
              total={this.config.page.total}
              pager-count={5}
              current-change={this.loadData}
            >
              <div class="text-center">
                <span class="page__current" style="min-width: 22px">
                  {this.config.page.current}
                </span>
                <span class="icon-color" style="min-width: 22px">
                  /
                </span>
                <span class="icon-color" style="min-width: 22px">
                  {this.config.page.count}
                </span>
              </div>
            </ElPagination>
          </div>
          <div class="main">
            <div class="flex ml-2 text-start justify-content-between" style="margin-bottom: 8px">
              <div class="flex">
                <ElInput size="mini" placeholder="请输入字段名" suffix-icon="el-icon-search"></ElInput>
                <ElButton plain class="btn-refresh ml-2">
                  <VIcon>refresh</VIcon>
                </ElButton>
              </div>
              <div class="item ml-2">
                <ElButton type="text" class="btn-operation" onClick={this.showOperation}>
                  批量操作
                </ElButton>
                <ElButton type="text" class="btn-rest">
                  重置
                </ElButton>
              </div>
            </div>
            <ElTable class="field-mapping-table table-border" height="100%" data={this.tableList}>
              <ElTableColumn type="selection" width="55"></ElTableColumn>
              <ElTableColumn show-overflow-tooltip label="字段名" prop="sourceFieldName"></ElTableColumn>
              <ElTableColumn
                show-overflow-tooltip
                label="新字段名"
                prop="targetFieldName"
                scopedSlots={{
                  default: this.renderNode
                }}
              ></ElTableColumn>
              <ElTableColumn show-overflow-tooltip label="操作" prop="field_name"></ElTableColumn>
              <div class="field-mapping-table__empty" slot="empty">
                <EmptyItem></EmptyItem>
              </div>
            </ElTable>
          </div>
        </div>
        <ElDialog title="批量操作" visible={this.config.visible} append-to-body before-close={this.closeOperation}>
          <div>
            <FormItem.BaseItem
              label="前缀"
              tooltip="以英文字母开头，仅支持英文、数字、下划线、点、中划线，限0~50字符，前缀不允许以 system 开头"
            >
              <ElInput v-model={this.config.prefix} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem
              label="后缀"
              tooltip="以英文字母、下划线开头，仅支持英文、数字、下划线、点、中划线，限0~50字符"
            >
              <ElInput v-model={this.config.suffix} clearable />
            </FormItem.BaseItem>

            <FormItem.BaseItem label="大小写">
              <ElSelect v-model={this.config.transferCase}>
                <ElOption value="" label="不变" />
                <ElOption value="toUpperCase" label="大写" />
                <ElOption value="toLowerCase" label="小写" />
              </ElSelect>
            </FormItem.BaseItem>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button onClick={this.closeOperation}>取 消</el-button>
            <el-button type="primary">确 定</el-button>
          </span>
        </ElDialog>
      </div>
    )
  }
})
