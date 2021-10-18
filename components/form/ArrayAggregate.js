import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import VIcon from '@/components/VIcon'

export const ArrayAggregate = connect(
  observer(
    defineComponent({
      // props: ['aggregations', 'options', 'databaseType'],
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
              groupByExpression: ''
            }
          ],
          groupList: []
        }
      },

      render() {
        const { aggregations } = this
        return (
          <div class="aggregate-list">
            {aggregations.map((item, index) => {
              // eslint-disable-next-line prettier/prettier
            return (
                <el-row gutter={20} style="margin: 0 0 20px;border: 1px solid #C8CDCF">
                  <el-col span={22}>
                    <el-row gutter={10}>
                      <el-col span={6}>
                        <el-form-item label="聚合函数">
                          <el-select
                            v-model={item.aggFunction}
                            size="mini"
                            onChange={() => this.changeAggFunction(item)}
                          >
                            {this.selectList.map(op => (
                              <el-option label={op.label} value={op.value} key={op.value} />
                            ))}
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col span={18}>
                        <el-form-item label="作用目标">
                          <el-input
                            v-model={item.aggExpression}
                            size="mini"
                            disabled={item.aggFunction === 'COUNT'}
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="子处理名称">
                      <el-input v-model={item.name} size="mini"></el-input>
                    </el-form-item>
                    <el-form-item label="过滤器">
                      <el-input v-model={item.filterPredicate} size="mini" type="textarea"></el-input>
                    </el-form-item>
                    <el-form-item label="分组字段">
                      <el-select v-model={item.groupByExpression} size="mini">
                        {this.groupList.map(op => (
                          <el-option label={op.label} value={op.value} key={op.value} />
                        ))}
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col span={2}>
                    <VIcon class="clickable" color="#000" onClick={() => this.removeRow(index)} small>
                      delete
                    </VIcon>
                  </el-col>
                </el-row>
              )
            })}
            <el-button type="text" onClick={() => this.addRow()}>
              添加聚合
            </el-button>
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
