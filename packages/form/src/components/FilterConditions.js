import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import { Space } from './space'
import { VIcon } from '@tap/component'

const Conditions = observer(
  defineComponent({
    props: ['conditions', 'options', 'databaseType'],
    data() {
      return {
        calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like']
      }
    },

    render() {
      const { conditions } = this
      return (
        <div class="cond-list">
          {conditions.map((cond, ci) => {
            return (
              <div class="cond-item-wrap" key={ci}>
                {((cond.type === 'group' && ci > 0 && cond.operator && ci > 0) ||
                  (cond.type !== 'group' && cond.operator && ci > 0)) && (
                  <div class="cond-operator">{cond.operator}</div>
                )}
                {cond.type === 'group' ? (
                  cond.conditions.length > 0 && (
                    <Conditions
                      class="child-cond"
                      conditions={cond.conditions}
                      options={this.options}
                      databaseType={this.databaseType}
                      onRemove={() => this.removeCond(ci)}
                    />
                  )
                ) : (
                  <Space>
                    <el-select v-model={cond.field} filterable size="mini" placeholder="select field">
                      {this.options.map(item => (
                        <el-option key={item} label={item} value={item} />
                      ))}
                    </el-select>
                    <el-select v-model={cond.command} size="mini" placeholder="select op">
                      {this.calculationList.map(item => (
                        <el-option label={item} value={item} key={item} />
                      ))}
                    </el-select>
                    <el-input v-model={cond.value} placeholder="enter value" type="text" size="mini" />
                    <el-dropdown size="mini" onCommand={event => this.handleCommand(event, ci)}>
                      <div>
                        <VIcon class="clickable" color="#000" size="20">
                          xinzeng
                        </VIcon>
                      </div>
                      <el-dropdown-menu slot="dropdown">
                        {this.databaseType !== 'mongodb' ? (
                          [
                            <el-dropdown-item command="and">+ and</el-dropdown-item>,
                            <el-dropdown-item command="or">+ or</el-dropdown-item>
                          ]
                        ) : (
                          <el-dropdown-item command="cond">+</el-dropdown-item>
                        )}
                        <el-dropdown-item command="andQ">+ and()</el-dropdown-item>
                        <el-dropdown-item command="orQ">+ or()</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <VIcon class="clickable" color="#000" onClick={() => this.removeCond(ci)} small>
                      delete
                    </VIcon>
                  </Space>
                )}
              </div>
            )
          })}
        </div>
      )
    },

    methods: {
      addCond(type, operator = '', index) {
        let child = {}
        if (type === 'group') {
          child = {
            type: 'group',
            operator,
            conditions: [
              {
                type: 'condition',
                field: '',
                command: '',
                value: ''
              }
            ]
          }
        } else {
          child = {
            type: 'condition',
            field: '',
            operator,
            command: '',
            value: ''
          }
        }
        if (index !== undefined) {
          this.conditions.splice(index + 1, 0, child)
        } else {
          this.conditions.push(child)
        }
      },

      removeCond(index) {
        this.conditions.splice(index, 1)
        if (!this.conditions.length) this.$emit('remove')
      },

      handleCommand(command, index) {
        switch (command) {
          case 'cond':
            this.addCond('condition', '', index)
            break
          case 'andQ':
            this.addCond('group', 'and', index)
            break
          case 'and':
            this.addCond('condition', 'and', index)
            break
          case 'orQ':
            this.addCond('group', 'or', index)
            break
          case 'or':
            this.addCond('condition', 'or', index)
            break
        }
      }
    }
  })
)

export const FilterConditions = connect(
  observer(
    defineComponent({
      props: {
        value: {
          type: Array,
          default: () => []
        },
        options: {
          type: Array,
          default: () => []
        }
      },

      data() {
        return {
          conditions: [],
          calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like']
        }
      },

      watch: {
        conditions: {
          deep: true,
          handler(v) {
            this.$emit('change', v)
            console.log('changeConditions', v) // eslint-disable-line
          }
        },

        value(v) {
          console.log('watch:value', v) // eslint-disable-line
          // this.conditions = v
        }
      },

      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType
        }
      },

      mounted() {
        this.conditions = this.value
      },

      methods: {
        addCond(type, operator = '') {
          let cond = {}
          if (type === 'group') {
            cond = {
              type: 'group',
              operator,
              conditions: [
                {
                  type: 'condition',
                  field: '',
                  command: '',
                  value: ''
                }
              ]
            }
          } else {
            cond = {
              type: 'condition',
              field: '',
              operator,
              command: '',
              value: ''
            }
          }
          this.conditions.push(cond)
        }
      },

      render() {
        const t = this.t.bind(this)
        const { conditions } = this

        let btns

        console.log('databaseType', this.databaseType) // eslint-disable-line

        if (this.databaseType === 'mongodb') {
          if (!conditions.length) {
            btns = [
              <el-button plain size="mini" onClick={() => this.addCond('group', 'and')}>
                + and()
              </el-button>,
              <el-button plain size="mini" onClick={() => this.addCond('group', 'or')}>
                + or()
              </el-button>
            ]
          }
        } else {
          btns = !conditions.length
            ? [
                <el-button plain size="mini" icon="el-icon-plus" onClick={() => this.addCond('cond')}>
                  {$t('queryBuilder_addCond')}
                </el-button>,
                <el-button plain size="mini" icon="el-icon-plus" onClick={() => this.addCond('group')}>
                  ({$t('queryBuilder_addCond')})
                </el-button>
              ]
            : [
                <el-button plain size="mini" onClick={() => this.addCond('cond', 'and')}>
                  + and
                </el-button>,
                <el-button plain size="mini" onClick={() => this.addCond('cond', 'or')}>
                  + or
                </el-button>,
                <el-button plain size="mini" onClick={() => this.addCond('group', 'and')}>
                  + and()
                </el-button>,
                <el-button plain size="mini" onClick={() => this.addCond('group', 'or')}>
                  + or()
                </el-button>
              ]
        }

        return (
          <Space direction="vertical" class="filter-conditions">
            {!!btns && <Space>{btns}</Space>}
            {conditions?.length > 0 && (
              <Conditions options={this.options} conditions={conditions} databaseType={this.databaseType} />
            )}
          </Space>
        )
      }
    })
  ),
  mapProps({ dataSource: 'options' })
)

export default FilterConditions
