import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent, h } from 'vue-demi'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import { Highlight } from '@tap/component'
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)

export const PreviewSql = connect(
  observer(
    defineComponent({
      setup() {
        const formRef = useForm()

        return () => {
          const form = formRef.value
          const table = form.values.table
          const databaseType = form.values.databaseType
          const mongoCommand = {
            '=': 'eq',
            '<>': 'ne',
            '>': 'gt',
            '<': 'lt',
            '>=': 'gte',
            '<=': 'lte',
            like: 'like'
          }

          if (!table) return

          function genSql(form) {
            let res = 'SELECT '
            const limitLines = form.values.custSql.limitLines
            const fieldFilterType = form.values.custSql.fieldFilterType
            const conditions = form.values.custSql.conditions || []
            const selectedFields = form.values.custSql.selectedFields || []
            const fieldOptions = form.query('selectedFields').get('dataSource') || []
            const sqlWhere = genSqlWhere(conditions) || ''
            let custFields = []
            if (selectedFields.length > 0 && fieldFilterType === 'retainedField') custFields = [...selectedFields]
            else if (selectedFields.length > 0 && fieldFilterType === 'deleteField') {
              custFields = [fieldOptions.filter(it => !selectedFields.includes(it))]
            }

            if (custFields.length > 0 && custFields.length !== fieldOptions.length) res += custFields.join(',')
            else res += '* '
            res += ' FROM ' + table.table_name + ' '
            if ((sqlWhere && sqlWhere.length > 0) || (limitLines && limitLines !== 'all' && databaseType === 'oracle'))
              res += ' WHERE '
            res += sqlWhere
            if (limitLines && limitLines !== 'all') {
              switch (databaseType) {
                case 'mysql':
                  res += ' limit ' + limitLines
                  break
                case 'sqlserver':
                  res = res.replace('SELECT ', 'SELECT top ' + limitLines + ' ')
                  break
                case 'oracle':
                  if (res.indexOf('WHERE ') < res.length - 6) res += ' AND '
                  res += ' ROWNUM < ' + limitLines
                  break
                case 'db2':
                  res += '  fetch first ' + limitLines + ' rows only'
                  break
              }
            }
            return res
          }

          function genSqlWhere(conditions) {
            let res = ''
            conditions.forEach(cond => {
              if (cond.field || cond.type === 'group') {
                if (cond.type === 'group') res += ' ' + cond.operator + ' (' + genSqlWhere(cond.conditions) + ')'
                else {
                  let quota = ['String', 'Date'].includes(
                      table.fields.find(it => it.field_name === cond.field).data_type
                    )
                      ? "'"
                      : '',
                    percent = cond.command === 'like' ? '%' : ''
                  if (quota === '' && percent === '%') quota = "'"
                  if (res.length > 1) res += ' ' + cond.operator + ' '
                  res += cond.field + ' ' + cond.command + ' ' + quota + percent + cond.value + percent + quota
                }
              }
            })
            return res
          }

          function genMongo(form) {
            const conditions = form.values.custSql.conditions || []
            let res = ''
            if (conditions[0]) {
              res += JSON.stringify(genMongoFilter(conditions[0]))
            }
            return res
          }

          function genMongoFilter(condition) {
            if (!condition) return ''
            if (condition && condition.type === 'group') {
              if (condition.operator === 'and') {
                let result = { $and: [] }
                condition.conditions.forEach(v => {
                  let _flat = genMongoFilter(v)
                  if (_flat) result.$and.push(_flat)
                })
                return result
              } else if (condition.operator === 'or') {
                let result = { $or: [] }
                condition.conditions.forEach(v => {
                  let _flat = genMongoFilter(v)
                  if (_flat) result.$or.push(_flat)
                })
                return result
              }
            } else if (condition.type === 'condition' && condition.field) {
              let val = condition.value
              // console.log('table.fields', table.fields, val)
              if (!['String', 'Date'].includes(table.fields.find(it => it.field_name === condition.field).data_type))
                val = parseFloat(val)
              if (condition.command === 'eq') {
                return {
                  ['' + condition.field + '']: val
                }
              } else if (condition.command === 'like') {
                return {
                  ['' + condition.field + '']: {
                    ['$regex']: val
                  }
                }
              } else {
                return {
                  ['' + condition.field + '']: {
                    ['$' + mongoCommand[condition.command] + '']: val
                  }
                }
              }
            } else {
              return null
            }
          }

          const props =
            databaseType === 'mongodb'
              ? {
                  language: 'json',
                  code: genMongo(form)
                }
              : {
                  language: 'sql',
                  code: genSql(form)
                }

          return h('div', { class: 'sql-text my-2' }, [
            h(Highlight, {
              props
            })
          ])
        }
      }
    })
  ),
  mapProps({ dataSource: 'fields' })
)

export default PreviewSql
