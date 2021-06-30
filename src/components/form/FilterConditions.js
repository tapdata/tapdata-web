import { connect, mapProps, useForm, observer } from '@formily/vue'
import { defineComponent } from 'vue-demi'
import { Space } from '@/components/form/Space'
import VIcon from '@/components/VIcon'

const Conditions = observer(
  defineComponent({
    props: ['conditions', 'options'],

    data() {
      return {
        calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like']
      }
    },

    render() {
      const { conditions } = this
      console.log('conditions', this.conditions)
      return (
        <div>
          {conditions.map((cond, ci) => {
            return (
              <div key={ci}>
                {((cond.type === 'group' &&
                  ci > 0 &&
                  cond.operator &&
                  ci > 0) ||
                  (cond.type !== 'group' && cond.operator && ci > 0)) && (
                  <div class="cond-operator my-2">{cond.operator}</div>
                )}
                {cond.type === 'group' ? (
                  cond.conditions.length > 0 && (
                    <Conditions
                      class="child-cond"
                      conditions={cond.conditions}
                      options={this.options}
                    />
                  )
                ) : (
                  <Space>
                    <el-select
                      v-model={cond.field}
                      filterable
                      size="mini"
                      placeholder="select field"
                    >
                      {this.options.map(item => (
                        <el-option key={item} label={item} value={item} />
                      ))}
                    </el-select>
                    <el-select
                      v-model={cond.command}
                      size="mini"
                      placeholder="select op"
                    >
                      {this.calculationList.map(item => (
                        <el-option label={item} value={item} key={item} />
                      ))}
                    </el-select>
                    <el-input
                      v-model={cond.value}
                      placeholder="enter value"
                      type="text"
                      size="mini"
                    />
                    <el-dropdown
                      size="mini"
                      onCommand={event => this.handleCommand(event, ci)}
                    >
                      <div>
                        <VIcon class="clickable" color="#000" size="20">
                          xinzeng
                        </VIcon>
                      </div>
                      <el-dropdown-menu slot="dropdown">
                        {this.databaseType !== 'mongodb' ? (
                          [
                            <el-dropdown-item command="and">
                              + and
                            </el-dropdown-item>,
                            <el-dropdown-item command="or">
                              + or
                            </el-dropdown-item>
                          ]
                        ) : (
                          <el-dropdown-item command="cond">+</el-dropdown-item>
                        )}
                        <el-dropdown-item command="andQ">
                          + and()
                        </el-dropdown-item>
                        <el-dropdown-item command="orQ">
                          + or()
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <VIcon
                      class="clickable"
                      color="#000"
                      onClick={this.removeCond}
                      small
                    >
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
          databaseType: '',
          conditions: [],
          calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like']
        }
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
        },

        genSql() {
          let res = 'SELECT ',
            custSql = this.value
          if (!this.sqlWhere) this.sqlWhere = ''
          while (this.custFields.length > 0) this.custFields.pop()
          if (
            this.value.selectedFields.length > 0 &&
            custSql.fieldFilterType == 'retainedField'
          )
            this.value.selectedFields.forEach(it => this.custFields.push(it))
          else if (
            this.value.selectedFields.length > 0 &&
            custSql.fieldFilterType == 'deleteField'
          ) {
            this.primaryKeyOptions
              .filter(it => !this.value.selectedFields.includes(it))
              .forEach(it => this.custFields.push(it))
          }

          if (
            this.custFields.length > 0 &&
            this.custFields.length != this.primaryKeyOptions.length
          )
            res += this.custFields.join(',')
          else res += '* '
          res += ' FROM ' + this.tableName + ' '
          if (
            (this.sqlWhere && this.sqlWhere.length > 0) ||
            (custSql.limitLines &&
              custSql.limitLines != 'all' &&
              this.databaseType == 'oracle')
          )
            res += ' WHERE '
          res += this.sqlWhere
          if (custSql.limitLines && custSql.limitLines != 'all') {
            if (this.databaseType == 'mysql')
              res += ' limit ' + custSql.limitLines
            if (this.databaseType == 'sqlserver')
              res = res.replace(
                'SELECT ',
                'SELECT top ' + custSql.limitLines + ' '
              )
            if (this.databaseType == 'oracle') {
              if (res.indexOf('WHERE ') < res.length - 6) res += ' AND '
              res += ' ROWNUM < ' + custSql.limitLines
            }
            if (this.databaseType == 'db2')
              res += '  fetch first ' + custSql.limitLines + ' rows only'
          }
          this.value.cSql = res
        }
      },

      render() {
        const $t = this.$t.bind(this)
        const { conditions } = this
        return (
          <Space direction="vertical" class="filter-conditions">
            {conditions.length > 0 ? (
              <Space>
                <el-button
                  plain
                  size="mini"
                  onClick={() => this.addCond('cond', 'and')}
                >
                  + and
                </el-button>
                <el-button
                  plain
                  size="mini"
                  onClick={() => this.addCond('cond', 'or')}
                >
                  + or
                </el-button>
                <el-button
                  plain
                  size="mini"
                  onClick={() => this.addCond('group', 'and')}
                >
                  + and()
                </el-button>
                <el-button
                  plain
                  size="mini"
                  onClick={() => this.addCond('group', 'or')}
                >
                  + or()
                </el-button>
              </Space>
            ) : (
              <Space>
                <el-button
                  plain
                  size="mini"
                  icon="el-icon-plus"
                  onClick={() => this.addCond('cond')}
                >
                  {$t('queryBuilder.addCond')}
                </el-button>
                <el-button
                  plain
                  size="mini"
                  icon="el-icon-plus"
                  onClick={() => this.addCond('group')}
                >
                  ({$t('queryBuilder.addCond')})
                </el-button>
              </Space>
            )}
            {conditions?.length > 0 && (
              <Conditions options={this.options} conditions={conditions} />
            )}
          </Space>
        )
      }
    })
  ),
  mapProps({ dataSource: 'options' })
)
