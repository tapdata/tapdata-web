import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
// import * as components from 'web-core/components/form'
// import { Form, FormItem, Switch, Input, Checkbox, Radio} from '@formily/element'
import { FormBaseItem as FormItem } from '@formily/element'
import VIcon from '@/components/VIcon'
import './index.scss'

export const ArrayAggregate = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],
      // components: { Form , FormItem },
      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType
        }
      },

      data() {
        return {
          selectList: [
            {
              label: 'AVG',
              value: 'AVG'
            },
            {
              label: 'SUM',
              value: 'SUM'
            },
            {
              label: 'MAX',
              value: 'MAX'
            },
            {
              label: 'MIN',
              value: 'MIN'
            },
            {
              label: 'COUNT',
              value: 'COUNT'
            }
          ],
          countObj: {
            AVG: 0,
            SUM: 0,
            MAX: 0,
            MIN: 0,
            COUNT: 0
          },
          aggregations: [
            {
              name: 'COUNT',
              filterPredicate: '',
              aggFunction: 'COUNT',
              aggExpression: '',
              groupByExpression: []
            }
          ],

          groupList: []
        }
      },

      watch: {
        aggregations: {
          deep: true,
          handler(v) {
            this.$emit('change', v)
            console.log('Aggregate', v) // eslint-disable-line
          }
        }
      },

      render() {
        const { aggregations } = this
        return (
          <div class="aggregate-list">
            {aggregations.map((item, index) => {
              // eslint-disable-next-line prettier/prettier
              return (
                <ElRow
                  gutter={20}
                  style="width: 889px; margin: 0 0 20px; padding-top: 15px; border: 1px solid #C8CDCF;"
                >
                  <ElCol span={23}>
                    <ElRow gutter={10}>
                      <ElCol span={8}>
                        <FormItem title="聚合函数" label="聚合函数">
                          <ElSelect
                            v-model={item.aggFunction}
                            size="mini"
                            onChange={() => this.changeAggFunction(item)}
                          >
                            {this.selectList.map(op => (
                              <ElOption label={op.label} value={op.value} key={op.value} />
                            ))}
                          </ElSelect>
                        </FormItem>
                      </ElCol>
                      <ElCol span={16}>
                        <FormItem title="作用目标" label="作用目标">
                          <ElInput
                            v-model={item.aggExpression}
                            size="mini"
                            disabled={item.aggFunction === 'COUNT'}
                          ></ElInput>
                        </FormItem>
                      </ElCol>
                    </ElRow>
                    <FormItem label="子处理名称">
                      <ElInput v-model={item.name} size="mini"></ElInput>
                    </FormItem>
                    <FormItem label="过滤器">
                      <ElInput v-model={item.filterPredicate} size="mini" type="textarea"></ElInput>
                    </FormItem>
                    <FormItem label="分组字段">
                      <ElSelect v-model={item.groupByExpression} size="mini" multiple>
                        {this.options && this.options.length
                          ? this.options.map(op => <ElOption label={op} value={op} key={op} />)
                          : []}
                      </ElSelect>
                    </FormItem>
                  </ElCol>
                  <ElCol span={1}>
                    <VIcon
                      class="clickable"
                      style="padding-top:3px"
                      color="#666"
                      onClick={() => this.removeRow(index)}
                      small
                    >
                      close
                    </VIcon>
                  </ElCol>
                </ElRow>
              )
            })}
            <el-button type="text" onClick={() => this.addRow()}>
              添加聚合
            </el-button>
            <div class="example">
              <h3>返回示例</h3>
              <ul class="example-box">
                {aggregations[0].groupByExpression.length ? (
                  <li>
                    <div class="text" style="padding-left: 10px">
                      {'{'}
                      <div style="padding-left: 10px">_tapd8_sub_name : {aggregations[0].name}</div>
                      {aggregations[0].groupByExpression.map(group => {
                        return <div style="padding-left: 10px"> {group} : XXX</div>
                      })}
                      {'}'},
                    </div>
                  </li>
                ) : (
                  <li>
                    <span class="text">_id: {aggregations[0].name},</span>
                    <span class="comment">// "students_sum" 自定义的子处理名称，多个子处理名称不可重复</span>
                  </li>
                )}

                <li>
                  <span class="text">
                    {aggregations[0].aggFunction}:
                    {aggregations[0].aggFunction === 'COUNT' ? 100 : aggregations[0].aggExpression},
                  </span>
                  <span class="comment">// COUNT为选择的函数, 132为函数值；如果函数是MAX, 则名称为MAX</span>
                </li>
                {aggregations[0].groupByExpression.map(group => {
                  return (
                    <li>
                      <span class="text">{group}: XXX</span>
                      <span class="comment">// 分组汇总的字段名，如果不填写则不显示</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      },

      methods: {
        addRow() {
          let list = {
            name: '',
            filterPredicate: '',
            aggFunction: 'COUNT',
            aggExpression: '',
            groupByExpression: ''
          }
          this.aggregations.push(list)
          this.changeAggFunction(list)
        },

        removeRow(index) {
          this.aggregations.splice(index, 1)
          if (!this.aggregations.length) this.$emit('remove')
        },

        changeAggFunction(data) {
          if (data.aggFunction !== 'COUNT') {
            data.aggExpression = '1'
          } else {
            data.aggExpression = ''
          }
          let aggFunctionArr = []
          for (let i = 0; i < this.aggregations.length; i++) {
            let item = this.aggregations[i]
            aggFunctionArr.push(item.name)
            if (new Set(aggFunctionArr).size !== aggFunctionArr.length) {
              this.countObj[data.aggFunction]++
            }
            if (this.countObj[data.aggFunction] === 0) {
              data.name = data.aggFunction
            } else {
              data.name = data.aggFunction + '_' + this.countObj[data.aggFunction]
            }
          }
        }
      }
    })
  ),
  mapProps({ dataSource: 'options' })
)

export default ArrayAggregate
