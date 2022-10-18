import { defineComponent } from 'vue-demi'
import { observer } from '@formily/reactive-vue'

import './style.scss'
import { useForm } from '@formily/vue'

export const loadSchemaTree = observer(
  defineComponent({
    props: ['findParentNode', 'value'],
    setup(props) {
      const formRef = useForm()
      const form = formRef.value
      return {
        form
      }
    },

    render() {
      let fields = this.form.getValuesIn('loadSchemaTree')
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
