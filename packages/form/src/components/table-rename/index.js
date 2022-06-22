import { defineComponent, ref } from 'vue-demi'
import { h as createElement, useFieldSchema, useForm, RecursionField } from '@formily/vue'
import { FormItem, Input, Editable } from '../index'
import { observer } from '@formily/reactive-vue'

export const TableRename = observer(
  defineComponent({
    props: ['findParentNode'],
    setup(props) {
      const formRef = useForm()
      const form = formRef.value
      const tableDataRef = ref([])

      const makeTable = () => {
        let tableData = []
        if (form.values.$inputs?.length) {
          let parentNode = props.findParentNode(form.values.id)
          if (parentNode.type === 'database') {
            const { tableNames = [] } = parentNode
            console.log('parentNode', parentNode) // eslint-disable-line
            tableData = tableNames.map(item => {
              return {
                source: item,
                target: item
              }
            })
          }
        }
        tableDataRef.value = tableData
      }

      makeTable()

      return () => {
        return (
          <div>
            <FormItem.BaseItem label="搜索表名">
              <Input prefixIcon="el-icon-search"></Input>
            </FormItem.BaseItem>

            {/*<div class="name-list-wrap">
              <div class="name-list-header"></div>
              <div class="name-list-content">
                <div class="name-list-item"></div>
              </div>
            </div>*/}

            <ElTable class="mt-4" data={tableDataRef.value}>
              <ElTableColumn prop="source" label="原表名"></ElTableColumn>
              <ElTableColumn prop="target" label="新表名">
                <template slot="default"></template>
              </ElTableColumn>
            </ElTable>

            <div class="font-color-light mt-4">以下操作仅对已搜索出来的表生效</div>

            <FormItem.BaseItem label="替换">
              <div class="flex">
                <Input prefixIcon="el-icon-search"></Input>
                <div class="px-4 text-nowrap">改为</div>
                <Input prefixIcon="el-icon-search"></Input>
              </div>
            </FormItem.BaseItem>

            <FormItem.BaseItem
              label="前缀"
              tooltip="以英文字母开头，仅支持英文、数字、下划线、点、中划线，限0~50字符，前缀不允许以 system 开头"
            >
              <Input></Input>
            </FormItem.BaseItem>

            <FormItem.BaseItem
              label="后缀"
              tooltip="以英文字母、下划线开头，仅支持英文、数字、下划线、点、中划线，限0~50字符"
            >
              <Input></Input>
            </FormItem.BaseItem>

            <FormItem.BaseItem label="大小写">
              <ElSelect>
                <ElOption value="">不变</ElOption>
                <ElOption value="up">大写</ElOption>
                <ElOption value="low">小写</ElOption>
              </ElSelect>
            </FormItem.BaseItem>
          </div>
        )
      }
    }
  })
)
