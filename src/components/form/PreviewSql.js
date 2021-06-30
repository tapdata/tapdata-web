import { connect, mapProps, observer, useForm } from '@formily/vue'
import { defineComponent } from 'vue-demi'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import Highlight from '@/components/Highlight'
hljs.registerLanguage('sql', sql)

export const PreviewSql = connect(
  observer(
    defineComponent({
      props: ['fields'],

      setup(props) {
        const form = useForm()?.value
        const formValue = form.values
        return {
          fieldFilterType: form.query('fieldFilterType').value(),
          selectedFields: form.query('selectedFields').value(),
          conditions: form.query('conditions').value().value
        }
      },

      computed: {
        where() {
          let where = ''
          this.conditions.forEach(cond => {
            if (cond.field || cond.type == 'group') {
              if (cond.type == 'group')
                where +=
                  ' ' +
                  cond.operator +
                  ' (' +
                  this.toSqlWhere(cond.conditions) +
                  ')'
              else {
                let quota = ['String', 'Date'].includes(
                    this.mergedSchema.fields.find(
                      it => it.field_name == cond.field
                    ).javaType
                  )
                    ? "'"
                    : '',
                  percent = cond.command == 'like' ? '%' : ''
                if (quota == '' && percent == '%') quota = "'"
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
        }
      },

      methods: {
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
        },

        genSqlWhere(conditions) {
          if (!this.mergedSchema) return
          let res = ''
          conditions.forEach(cond => {
            if (cond.field || cond.type == 'group') {
              if (cond.type == 'group')
                res +=
                  ' ' +
                  cond.operator +
                  ' (' +
                  this.genSqlWhere(cond.conditions) +
                  ')'
              else {
                let quota = ['String', 'Date'].includes(
                    this.mergedSchema.fields.find(
                      it => it.field_name == cond.field
                    ).javaType
                  )
                    ? "'"
                    : '',
                  percent = cond.command == 'like' ? '%' : ''
                if (quota == '' && percent == '%') quota = "'"
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
        // console.log('conditions', this.conditions)
        return (
          <div class="sql-text my-2">
            <Highlight
              language="sql"
              code="SELECT * FROM CAR_CLAIM WHERE SETTLED_AMOUNT > sss"
            />
          </div>
        )
      }
    })
  ),
  mapProps({ dataSource: 'fields' })
)
