import { connect, useForm, mapProps } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import EmptyItem from '@/components/EmptyItem'

export const DatabaseInfo = connect(
  observer(
    defineComponent({
      props: ['data', 'loading'],

      setup() {
        const form = useForm()?.value
        const formValue = form.values
        return {
          syncObjects: formValue.syncObjects,
          table_prefix: formValue.table_prefix || '',
          table_suffix: formValue.table_suffix || ''
        }
      },

      render() {
        const databaseInfo = this.data
        if (!databaseInfo) return
        let tables = databaseInfo.schema?.tables || []
        tables = tables
          .sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1))
          .filter(item => item.table_name)
          .map(item => item.table_name)

        // 添加同步表
        if (this.syncObjects) {
          const syncItem = this.syncObjects.find(item => item.type === 'table')
          if (syncItem?.objectNames?.length) {
            const { table_prefix, table_suffix } = this
            const pushTables = syncItem.objectNames.map(item => {
              return table_prefix + item + table_suffix
            })
            tables.push(...pushTables)
          }
        }

        const databaseTables = [...new Set(tables)]

        return (
          <div class="database-info flex flex-column flex-grow-1 overflow-hidden">
            <ul class="info-box flex-shrink-0">
              <li>
                <span class="label">{this.$t('editor.cell.data_node.database.type')}:</span>
                <span class="text">{databaseInfo.database_type}</span>
              </li>
              <li>
                <span class="label">Host/Port:</span>
                {databaseInfo.database_host && (
                  <span class="text">
                    <span>{databaseInfo.database_host}</span>
                    {databaseInfo.database_type !== 'mongodb' && <span>:{databaseInfo.database_port}</span>}
                  </span>
                )}
              </li>
              <li>
                <span class="label">{this.$t('editor.cell.data_node.database.databaseName')}:</span>
                <span class="text">{databaseInfo.database_name}</span>
              </li>
              <li>
                <span class="label">{this.$t('editor.cell.data_node.database.account')}:</span>
                <span class="text">{databaseInfo.database_username}</span>
              </li>
              {databaseInfo.database_owner && (
                <li>
                  <span class="label">{this.$t('editor.cell.data_node.database.attributionAccount')}:</span>
                  <span class="text">{databaseInfo.database_owner}</span>
                </li>
              )}
            </ul>

            <div class="info-table flex flex-column overflow-hidden">
              <div class="info-table-header">
                {this.$t('editor.cell.data_node.database.includeTable')}
                <span class="ml-1">{databaseTables.length}</span>
              </div>
              <ul class="table-box flex-fill" vLoading={this.loading}>
                {databaseTables.map(item => {
                  return (
                    <li key={item} class="list-item flex align-center">
                      <i class="iconfont icon-table2 mr-1"></i>
                      <span class="list-item-text">{item}</span>
                    </li>
                  )
                })}
                {!databaseTables.length && <EmptyItem small></EmptyItem>}
              </ul>
            </div>
          </div>
        )
      }
    })
  ),
  mapProps({ loading: true, dataSource: 'data' })
)
