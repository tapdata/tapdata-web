import { defineComponent, ref, reactive } from 'vue-demi'
import { metadataTransformerApi } from '@tap/api'
import EmptyItem from 'web-core/components/EmptyItem'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import VIcon from 'web-core/components/VIcon'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import './style.scss'
import { FormItem } from '../index'

export const FieldRenameProcessor = defineComponent({
  props: ['connectionId'],
  setup(props, { emit }) {
    const list = ref([])
    const config = reactive({
      prefix: '',
      suffix: '',
      transferCase: '',
      visible: false,
      loadingNav: true,
      selectRow: ''
    })
    const loadData = () => {
      config.loadingNav = true
      metadataTransformerApi
        .get({
          filter: JSON.stringify({})
        })
        .then(res => {
          list.value = res?.items || []
          config.selectRow = res.items?.[0]
          emit('change', res.items)
        })
        .finally(() => (config.loadingNav = false))
    }
    const showOperation = () => {
      config.visible = true
    }
    const closeOperation = () => {
      config.visible = false
    }
    loadData()
    return {
      loadData,
      showOperation,
      closeOperation,
      list,
      config
    }
  },
  render() {
    let tableList = [
      {
        targetFieldName: 'name',
        sourceFieldName: 'name',
        sourceFieldType: 'STRING',
        type: 'auto'
      },
      {
        targetFieldName: '_id',
        sourceFieldName: '_id',
        sourceFieldType: 'STRING',
        type: 'auto'
      }
    ]
    return (
      <div class="node-field-mapping flex flex-column">
        <div class="task-form-body">
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
            <div class="bg-main flex justify-content-between mb-2 ml-2">
              <span class="table-name ml-1">表名</span>
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
                  {this.list.map((item, index) => (
                    <li key={index}>
                      {item.invalid ? (
                        <div class="task-form__img">
                          <img src={fieldMapping_table} alt="" />
                        </div>
                      ) : (
                        <div class="task-form__img">
                          <img src={fieldMapping_table_error} alt="" />
                        </div>
                      )}
                      <div class="task-form-text-box">
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
                        <div class="select">0</div>
                      </div>
                    </li>
                  ))}
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
              current-page={1}
              total={10}
              pager-count={5}
              current-change={this.loadData}
            >
              <div class="text-center">
                <span class="page__current" style="min-width: 22px">
                  0
                </span>
                <span class="icon-color" style="min-width: 22px">
                  /
                </span>
                <span class="icon-color" style="min-width: 22px">
                  0
                </span>
              </div>
            </ElPagination>
          </div>
          <div class="main">
            <div class="flex ml-2 text-start" style="margin-bottom: 8px">
              <div class="flex">
                <ElInput size="mini" placeholder="请输入字段名" suffix-icon="el-icon-search"></ElInput>
              </div>
              <div class="item ml-2">
                <ElButton plain class="btn-refresh">
                  <VIcon>refresh</VIcon>
                </ElButton>
                <ElButton type="text" class="btn-operation" onClick={this.showOperation}>
                  批量操作
                </ElButton>
                <ElButton type="text" class="btn-rest">
                  重置
                </ElButton>
              </div>
            </div>
            <ElTable class="field-mapping-table table-border" height="100%" data={tableList}>
              <ElTableColumn type="selection" width="55"></ElTableColumn>
              <ElTableColumn show-overflow-tooltip label="字段名" prop="sourceFieldName"></ElTableColumn>
              <ElTableColumn show-overflow-tooltip label="新字段名" prop="targetFieldName"></ElTableColumn>
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
