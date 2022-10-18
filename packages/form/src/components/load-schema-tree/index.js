import { defineComponent } from 'vue-demi'
import { observer } from '@formily/reactive-vue'

import './style.scss'
import { VIcon } from '@tap/component'

export const loadSchemaTree = observer(
  defineComponent({
    props: ['findParentNode'],
    setup() {},

    render() {
      let fields = [
        {
          targetFieldName: 'form_id',
          sourceFieldName: 'form_id',
          sourceFieldType: 'INT32',
          type: 'auto',
          defaultValue: '',
          useDefaultValue: true,
          isShow: true,
          migrateType: 'system',
          primary_key_position: 0
        },
        {
          targetFieldName: 'form_version',
          sourceFieldName: 'form_version',
          sourceFieldType: 'STRING',
          type: 'auto',
          defaultValue: '',
          useDefaultValue: true,
          isShow: true,
          migrateType: 'system',
          primary_key_position: 0
        },
        {
          targetFieldName: 'id',
          sourceFieldName: 'id',
          sourceFieldType: 'INT32',
          type: 'auto',
          defaultValue: '',
          useDefaultValue: true,
          isShow: true,
          migrateType: 'system',
          primary_key_position: 1
        },
        {
          targetFieldName: 'task_id',
          sourceFieldName: 'task_id',
          sourceFieldType: 'INT32',
          type: 'auto',
          defaultValue: '',
          useDefaultValue: true,
          isShow: true,
          migrateType: 'system',
          primary_key_position: 0
        }
      ]
      return (
        <div>
          <el-tree
            ref="tree"
            data={fields}
            node-key="id"
            default-expand-all={true}
            expand-on-click-node={false}
            class="schema-tree"
            scopedSlots={{
              default: ({ data }) => (
                <span class="row" slot-scope="{  data }">
                  <span class="type mr-2">{data.sourceFieldType}</span>
                  <span>{data.sourceFieldName}</span>
                </span>
              )
            }}
          ></el-tree>
        </div>
      )
    }
  })
)
