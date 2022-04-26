import { connect, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import Highlight from 'web-core/components/Highlight'
import 'highlight.js/styles/atom-one-light.css'

export const ArrayAggregate = connect(
  observer(
    defineComponent({
      setup() {
        const formRef = useForm()
        const form = formRef.value

        return () => {
          const [aggregation] = form.values.aggregations
          const result = {}

          if (aggregation.groupByExpression.length) {
            result._id = {
              _tapd8_sub_name: aggregation.name
            }
            aggregation.groupByExpression.forEach(key => {
              result._id[key] = 'XXX'
              result[key] = 'XXX'
            })
          }
          result[aggregation.aggFunction] = aggregation.aggFunction === 'COUNT' ? 100 : aggregation.aggExpression

          return <Highlight class="mt-0" language="json" code={JSON.stringify(result, null, 2)}></Highlight>
        }
      }
    })
  )
)

export default ArrayAggregate
