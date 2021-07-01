import { connect, mapProps, observer, useForm } from '@formily/vue'
import { defineComponent, h } from 'vue-demi'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import Highlight from '@/components/Highlight'
hljs.registerLanguage('sql', sql)

export const PreviewSql = connect(
  observer(
    defineComponent({
      props: ['fields'],

      setup(props) {
        const formRef = useForm()
        const form = formRef.value
        // const form = useForm()?.value
        // const formValue = form.values
        // console.log('formValue', formValue, formValue.fieldFilterType)
        /*return {
          form,
          table: form.values.table,
          fieldFilterType: form.values.custSql.fieldFilterType,
          selectedFields: form.values.custSql.selectedFields || [],
          conditions: form.values.custSql.conditions || [],
          limitLines: form.values.custSql.limitLines,
          databaseType: form.values.databaseType,
          fieldOptions: form.query('selectedFields').get('dataSource') || []
        }*/

        return () => {
          const form = formRef.value
          const table = form.values.table
          if (!table) return

          function genSql(form) {
            console.log('genSql', form.values.custSql.selectedFields)
            let res = 'SELECT '
            const databaseType = form.values.databaseType
            const limitLines = form.values.custSql.limitLines
            const fieldFilterType = form.values.custSql.fieldFilterType
            const conditions = form.values.custSql.conditions || []
            const selectedFields = form.values.custSql.selectedFields || []
            const fieldOptions =
              form.query('selectedFields').get('dataSource') || []
            const sqlWhere = genSqlWhere(conditions) || ''
            let custFields = []
            if (
              selectedFields.length > 0 &&
              fieldFilterType === 'retainedField'
            )
              custFields = [...selectedFields]
            else if (
              selectedFields.length > 0 &&
              fieldFilterType === 'deleteField'
            ) {
              custFields = [
                fieldOptions.filter(it => !selectedFields.includes(it))
              ]
            }

            if (
              custFields.length > 0 &&
              custFields.length !== fieldOptions.length
            )
              res += custFields.join(',')
            else res += '* '
            res += ' FROM ' + table.table_name + ' '
            if (
              (sqlWhere && sqlWhere.length > 0) ||
              (limitLines && limitLines !== 'all' && databaseType === 'oracle')
            )
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
                if (cond.type === 'group')
                  res +=
                    ' ' +
                    cond.operator +
                    ' (' +
                    genSqlWhere(cond.conditions) +
                    ')'
                else {
                  let quota = ['String', 'Date'].includes(
                      table.fields.find(it => it.field_name === cond.field)
                        .javaType
                    )
                      ? "'"
                      : '',
                    percent = cond.command === 'like' ? '%' : ''
                  if (quota === '' && percent === '%') quota = "'"
                  if (res.length > 1) res += ' ' + cond.operator + ' '
                  res +=
                    cond.field +
                    ' ' +
                    cond.command +
                    ' ' +
                    quota +
                    percent +
                    cond.value +
                    percent +
                    quota
                }
              }
            })
            return res
          }

          return h('div', { class: 'sql-text my-2' }, [
            h(Highlight, {
              props: {
                language: 'sql',
                code: genSql(form)
              }
            })
          ])
        }
      },

      /*computed: {
        sql() {
          console.log('compute', this.selectedFields)
          let res = 'SELECT '
          let { conditions } = this
          const sqlWhere = this.genSqlWhere(conditions) || ''
          let custFields = []
          if (
            this.selectedFields.length > 0 &&
            this.fieldFilterType === 'retainedField'
          )
            custFields = [...this.selectedFields]
          else if (
            this.selectedFields.length > 0 &&
            this.fieldFilterType === 'deleteField'
          ) {
            custFields = [
              ...this.fieldOptions.filter(
                it => !this.selectedFields.includes(it)
              )
            ]
          }

          if (
            custFields.length > 0 &&
            custFields.length !== this.fieldOptions.length
          )
            res += custFields.join(',')
          else res += '* '
          res += ' FROM ' + this.table.table_name + ' '
          if (
            (sqlWhere && sqlWhere.length > 0) ||
            (this.limitLines &&
              this.limitLines !== 'all' &&
              this.databaseType === 'oracle')
          )
            res += ' WHERE '
          res += sqlWhere
          if (this.limitLines && this.limitLines !== 'all') {
            if (this.databaseType === 'mysql')
              res += ' limit ' + this.limitLines
            if (this.databaseType === 'sqlserver')
              res = res.replace(
                'SELECT ',
                'SELECT top ' + this.limitLines + ' '
              )
            if (this.databaseType === 'oracle') {
              if (res.indexOf('WHERE ') < res.length - 6) res += ' AND '
              res += ' ROWNUM < ' + this.limitLines
            }
            if (this.databaseType === 'db2')
              res += '  fetch first ' + this.limitLines + ' rows only'
          }
          return res
        }
      },*/

      methods: {
        genSql() {
          console.log('compute', this.selectedFields)
          let res = 'SELECT '
          let { conditions } = this
          const sqlWhere = this.genSqlWhere(conditions) || ''
          let custFields = []
          if (
            this.selectedFields.length > 0 &&
            this.fieldFilterType === 'retainedField'
          )
            custFields = [...this.selectedFields]
          else if (
            this.selectedFields.length > 0 &&
            this.fieldFilterType === 'deleteField'
          ) {
            custFields = [
              ...this.fieldOptions.filter(
                it => !this.selectedFields.includes(it)
              )
            ]
          }

          if (
            custFields.length > 0 &&
            custFields.length !== this.fieldOptions.length
          )
            res += custFields.join(',')
          else res += '* '
          res += ' FROM ' + this.table.table_name + ' '
          if (
            (sqlWhere && sqlWhere.length > 0) ||
            (this.limitLines &&
              this.limitLines !== 'all' &&
              this.databaseType === 'oracle')
          )
            res += ' WHERE '
          res += sqlWhere
          if (this.limitLines && this.limitLines !== 'all') {
            if (this.databaseType === 'mysql')
              res += ' limit ' + this.limitLines
            if (this.databaseType === 'sqlserver')
              res = res.replace(
                'SELECT ',
                'SELECT top ' + this.limitLines + ' '
              )
            if (this.databaseType === 'oracle') {
              if (res.indexOf('WHERE ') < res.length - 6) res += ' AND '
              res += ' ROWNUM < ' + this.limitLines
            }
            if (this.databaseType === 'db2')
              res += '  fetch first ' + this.limitLines + ' rows only'
          }
          return res
        },

        genSqlWhere(conditions) {
          if (!this.table) return
          let res = ''
          conditions.forEach(cond => {
            if (cond.field || cond.type === 'group') {
              if (cond.type === 'group')
                res +=
                  ' ' +
                  cond.operator +
                  ' (' +
                  this.genSqlWhere(cond.conditions) +
                  ')'
              else {
                let quota = ['String', 'Date'].includes(
                    this.table.fields.find(it => it.field_name === cond.field)
                      .javaType
                  )
                    ? "'"
                    : '',
                  percent = cond.command === 'like' ? '%' : ''
                if (quota === '' && percent === '%') quota = "'"
                if (res.length > 1) res += ' ' + cond.operator + ' '
                res +=
                  cond.field +
                  ' ' +
                  cond.command +
                  ' ' +
                  quota +
                  percent +
                  cond.value +
                  percent +
                  quota
              }
            }
          })
          return res
        }
      },
      render(h) {
        console.log('Render')
        return h('div', { class: 'test' }, [this.genSql()])
        // console.log('conditions', this.conditions)
        /*return (
          <div class="sql-text my-2">
            <Highlight language="sql" code={this.sql} />
          </div>
        )*/
      }
    })
  ),
  mapProps({ dataSource: 'fields' })
)
