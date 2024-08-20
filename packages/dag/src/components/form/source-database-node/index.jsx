import { observer } from '@formily/reactive-vue'
import { RecursionField } from '@formily/vue'
import { defineComponent } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { FormItem } from '@tap/form'
import './style.scss'

const SourceDatabaseNode = observer(
  defineComponent({
    props: {
      value: Object
    },
    setup(props, { attrs, listeners }) {
      return () => {
        return (
          <div class="source-database-node">
            <el-tabs class="shadow-none" type="card">
              <el-tab-pane label={i18n.t('packages_dag_nodes_database_anbiaomingxuanze')}>
                <RecursionField
                  name="noPrimaryKeyTableSelectType"
                  schema={{
                    type: 'string',
                    title: i18n.t('packages_dag_nodes_database_biaoxianshi'),
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    default: 'All',
                    enum: [
                      { label: i18n.t('public_select_option_all'), value: 'All' },
                      { label: i18n.t('packages_dag_nodes_database_jinyouzhujianbiao'), value: 'HasKeys' },
                      { label: i18n.t('packages_dag_nodes_database_jinwuzhujianbiao'), value: 'NoKeys' }
                    ]
                  }}
                ></RecursionField>
              </el-tab-pane>
              <el-tab-pane label={i18n.t('packages_dag_nodes_database_anzhengzebiaoda')}>配置管理</el-tab-pane>
            </el-tabs>
          </div>
        )
      }
    }
  })
)

export { SourceDatabaseNode }
