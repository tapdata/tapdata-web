<template>
  <aside
    v-if="show"
    v-resize.left="{
      minWidth: 500,
      maxWidth: 800
    }"
    class="layout-sidebar --right border-start"
  >
    <div class="attr-panel">
      <header
        v-if="sourceNode && sourceNode.type === 'database'"
        class="attr-panel-header"
      >
        <div @click="$emit('deselectConnection')" class="header-icon">
          <VIcon>right-circle</VIcon>
        </div>
        <span class="header-txt pl-2">{{
          $t('editor.cell.link.mappingRelations')
        }}</span>
      </header>
      <div class="attr-panel-body overflow-auto">
        <ElForm class="flex flex-column" label-position="top">
          <FormProvider :form="form">
            <SchemaField
              :schema="schema"
              :scope="{
                useAsyncDataSource,
                loadDatabase,
                loadDatabaseInfo,
                getDropOptions,
                loadDatabaseTable,
                loadTableField,
                loadTableInfo,
                sourceConnectionId: sourceNode ? sourceNode.connectionId : null
              }"
            />
            <!--<FormConsumer>
              <template #default="{ form }">
                {{ form.values }}
              </template>
            </FormConsumer>-->
          </FormProvider>
        </ElForm>
      </div>
    </div>
  </aside>
</template>

<script>
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import { mapGetters, mapMutations } from 'vuex'
import {
  createForm,
  onFormValuesChange,
  onFormInputChange
} from '@formily/core'
import { action } from '@formily/reactive'
import { FormProvider, FormConsumer, createSchemaField } from '@formily/vue'
import { components, createFormTab } from '@/components/form'
import VIcon from '@/components/VIcon'
import '@/components/form/styles/index.scss'
import ConnectionsApi from '@/api/connections'
import MetadataApi from '@/api/MetadataInstances'

const { SchemaField } = createSchemaField({
  components
})

const connections = new ConnectionsApi()
const metadataApi = new MetadataApi()

export default {
  name: 'RightSidebar',

  directives: {
    resize
  },

  data() {
    return {
      form: createForm({
        effects: () => {
          onFormValuesChange(form => {
            console.log(
              'onFormValuesChange',
              JSON.parse(JSON.stringify(form.values))
            )
          })
          const filterProps = ['position', 'id'] // 排除属性的更新
          onFormInputChange(form => {
            this.$nextTick(() => {
              this.updateNodeProperties({
                id: this.node.id,
                properties: JSON.parse(
                  JSON.stringify(form.values, (key, value) =>
                    filterProps.includes(key) ? undefined : value
                  )
                )
              })
            })
          })
        }
      }),

      schema: null
    }
  },

  components: { VIcon, FormProvider, FormConsumer, SchemaField },

  computed: {
    ...mapGetters('dataflow', ['activeNode', 'nodeById', 'activeConnection']),

    node() {
      return this.activeConnection
        ? this.nodeById(this.activeConnection.targetId)
        : this.activeNode
    },

    sourceNode() {
      return this.activeConnection
        ? this.nodeById(this.activeConnection.sourceId)
        : null
    },

    ins() {
      return this.node?.__Ctor
    },

    show() {
      return !!this.node
    },

    // 联合唯一key
    uniteKey() {
      return `${this.node?.id || ''}_${this.activeConnection?.sourceId || ''}`
    }

    /*schema() {
      const { ins } = this
      console.log('computed:schema', ins)
      return ins
        ? this.activeConnection
          ? ins.linkFormSchema
          : ins.formSchema
        : {}
    }*/
  },

  watch: {
    uniteKey(v) {
      if (this.show) {
        console.log('watch:uniteKey', v)

        this.form.reset()
        this.schema = {}
        this.$nextTick(() => {
          this.schema = !this.activeConnection
            ? this.ins.formSchema
            : this.ins.linkFormSchema
          this.form.setValues(this.node)
        })
      }
    }
  },

  async mounted() {
    await this.$nextTick()
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties']),

    useAsyncDataSource(service, fieldName = 'dataSource', ...args) {
      return field => {
        field.loading = true
        service(field, ...args).then(
          action(data => {
            if (fieldName === 'value') {
              field.setValue(data)
              console.log('field.setValue', field)
            } else field[fieldName] = data
            field.loading = false
          })
        )
      }
    },

    async loadDatabase(field, databaseType = field.form.values.databaseType) {
      try {
        let result = await connections.get({
          filter: JSON.stringify({
            where: {
              database_type: databaseType
                ? {
                    in: Array.isArray(databaseType)
                      ? databaseType
                      : [databaseType]
                  }
                : {
                    nin: [
                      'file',
                      'dummy',
                      'gridfs',
                      'rest api',
                      'custom_connection'
                    ]
                  }
            },
            fields: {
              name: 1,
              id: 1,
              database_type: 1,
              connection_type: 1,
              status: 1
            },
            order: ['status DESC', 'name ASC']
          })
        })
        return result.data.map(item => {
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} (${
              this.$t('connection.status.' + item.status) || item.status
            })`,
            value: item.id
          }
        })
      } catch (e) {
        console.log('catch', e)
        return [
          {
            label: 'AAA',
            value: 'aaa'
          },
          {
            label: 'BBB',
            value: 'ccc'
          }
        ]
      }
    },

    async loadDatabaseInfo(field, id) {
      const connectionId = id || field.query('connectionId').get('value')
      if (!connectionId) return
      let result = await connections.customQuery([connectionId], {
        schema: true
      })
      return result.data
    },

    async loadDatabaseTable(
      field,
      connectionId = field.query('connectionId').get('value')
    ) {
      if (!connectionId) return
      const params = {
        filter: JSON.stringify({
          where: {
            'source.id': connectionId,
            meta_type: {
              in: ['collection', 'table', 'view'] //,
            },
            is_deleted: false
          },
          fields: {
            id: true,
            original_name: true
          }
        })
      }
      let { data: tables } = await metadataApi.get(params)
      tables = tables.map(item => ({
        label: item.original_name,
        value: item.id
      }))
      return tables
    },

    async loadTableInfo(field, id = field.query('tableId').get('value')) {
      if (!id) return
      console.log('loadTableInfo', field, id)
      const params = {
        filter: JSON.stringify({
          where: {
            id,
            is_deleted: false
          }
        })
      }
      const { data } = await metadataApi.schema(params)
      return data.records[0].schema.tables[0]
    },

    async loadTableField(field, id = field.query('tableId').get('value')) {
      if (!id) return
      console.log('loadTableField', field, id)
      const params = {
        filter: JSON.stringify({
          where: {
            id,
            is_deleted: false
          }
        })
      }
      const { data } = await metadataApi.schema(params)
      return data.records[0].schema.tables[0].fields.map(
        item => item.field_name
      )
    },

    getDropOptions(field) {
      const options = [
        {
          label: this.$t('editor.cell.link.existingSchema.keepSchema'),
          value: 'no_drop'
        },
        {
          label: this.$t('editor.cell.link.existingSchema.keepExistedData'),
          value: 'drop_data'
        }
      ]
      if (field.form.values.database_type === 'mongodb') {
        options.push({
          label: this.$t('editor.cell.link.existingSchema.removeSchema'),
          value: 'drop_schema'
        })
      }
      field.dataSource = options
    }
  }
}
</script>

<style lang="scss">
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>

<style lang="scss" scoped>
$radius: 4px;
$headerH: 28px;
$headerBg: #f5f7fa;
.layout-sidebar {
  .attr-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    &-header {
      display: flex;
      align-items: center;
      width: 100%;
      height: $headerH;
      line-height: $headerH;
      border-bottom: 1px solid #ebeef5;
      background-color: $headerBg;

      .header-icon {
        display: inline-block;
        width: $headerH;
        height: $headerH;
        text-align: center;
        background-color: var(--primary);
        cursor: pointer;
        color: #fff;
      }

      .header-txt {
        font-size: 12px;
      }
    }

    &-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 20px;
      height: 0;

      .e-form {
        .addTxt {
          float: right;
          display: inline-block;
          height: 30px;
          line-height: 30px;
          font-size: 12px;
          color: #48b6e2;
        }

        .el-form-item {
          margin-bottom: 10px;
        }

        .el-form-item__label {
          line-height: 30px;
          padding: 0;
          font-size: 12px;
        }

        .el-form-item__content {
          width: 100%;
          line-height: 30px;

          .el-select {
            width: 100%;
          }

          .el-input__inner {
            width: 100%;
            height: 30px;
            line-height: 30px;
          }

          .el-input__inner::-webkit-input-placeholder {
            font-size: 12px;
          }

          .el-textarea__inner {
            font-size: 12px;
          }

          .el-input__icon {
            line-height: 30px;
          }
        }
      }

      .el-form-item.--label-w100 {
        .el-form-item__label {
          width: 100%;
        }
      }

      .el-form-item__content > .el-row {
        width: 100%;
      }
    }

    ::v-deep {
      .el-form {
        .addTxt {
          float: right;
          display: inline-block;
          height: 30px;
          line-height: 30px;
          font-size: 12px;
          color: #48b6e2;
        }

        &-item {
          margin-bottom: 10px;

          &__label {
            line-height: 30px;
            padding: 0;
            font-size: 12px;
          }

          &__content {
            width: 100%;
            line-height: 30px;

            .el-select {
              width: 100%;
            }

            .el-input__inner {
              width: 100%;
              height: 30px;
              line-height: 30px;
              border-radius: $radius; //TODO: 和drs不兼容，后面需要统一样式
            }

            //TODO: 和drs不兼容，后面需要统一样式
            .ElButton--mini,
            .ElButton--small {
              border-radius: $radius;
            }

            .el-input__inner::-webkit-input-placeholder {
              font-size: 12px;
            }

            .el-textarea__inner {
              font-size: 12px;
            }

            .el-input__icon {
              line-height: 30px;
            }
          }
        }
      }

      .e-form {
        height: 100%;
        .database-tableBox {
          padding-top: 10px;
          height: calc(100% - 140px);
          box-sizing: border-box;
          .box-text {
            display: flex;
            padding-bottom: 10px;
            justify-content: space-between;
            font-size: 12px;
            color: #333;
            h3 {
              color: #606266;
            }
            .box-btn {
              color: #48b6e2;
              cursor: pointer;
              .e-button {
                padding: 4px 10px;
                color: #666;
                background-color: #f5f5f5;
              }
            }
          }
        }
      }

      .el-form-item {
        position: relative;
        margin-bottom: 10px;
      }

      .database-info {
        .info-box {
          padding: 10px 20px;
          box-sizing: border-box;
          overflow: hidden;
          font-size: 12px;
          color: #666;
          border: 1px solid #dedee4;
          li {
            padding-bottom: 8px;
          }
          .label {
            display: inline-block;
            width: 100px;
            text-align: right;
            color: #999;
          }
          .text {
            padding-left: 10px;
          }
        }
        .info-table {
          margin-top: 10px;
          border: 1px solid #dedee4;
          &-header {
            height: 28px;
            padding: 0 10px;
            line-height: 28px;
            font-size: 12px;
            color: #333;
            border-bottom: 1px solid #dedee4;
            background-color: $headerBg;
            span {
              color: #999;
            }
          }
          .table-box {
            overflow-y: auto;
          }
          .list-item {
            width: 100%;
            height: 36px;
            line-height: 36px;
            margin: 0 !important;
            padding: 0 15px;
            font-size: 12px;
            overflow: hidden;
            box-sizing: border-box;
            .iconfont {
              color: #4aaf47;
            }

            &:hover {
              background-color: var(--primary-hover-l);

              .list-item-text {
                color: var(--primary);
              }

              .el-checkbox {
                opacity: 1;
                visibility: visible;
              }

              .el-button--text {
                opacity: 1;
                visibility: visible;
              }
            }
          }
        }
      }

      .database-tableBox {
        .el-checkbox__label {
          height: 30px;
          font-size: 12px !important;
          padding-right: 6px;
        }
        .el-transfer {
          height: 640px;
          .el-transfer-panel {
            width: 298px;
            .el-transfer-panel__body {
              .box {
                display: inline-block;
                .nameStyle {
                  display: none;
                  color: #48b6e2;
                  float: right;
                  font-size: 12px;
                  padding-left: 10px;
                }
                .text {
                  width: 230px;
                  display: inline-block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }
            }
            .el-transfer-panel__header {
              height: 28px;
              line-height: 28px;
              background: #f5f5f5;
              .el-checkbox {
                height: 28px;
                line-height: 28px;
                overflow: hidden;
              }
            }
            .el-transfer-panel__filter {
              margin: 10px;
              .el-input__inner {
                border-radius: 3px;
              }
            }
            .el-transfer__button {
              border-radius: 3px;
            }
            .el-transfer__button.is-disabled,
            .el-transfer__button.is-disabled:hover {
              background-color: #f5f5f5;
            }
          }
          .el-transfer-panel:nth-child(3) {
            .el-transfer-panel__body {
              .el-transfer-panel__item .el-checkbox__label:hover {
                .box .nameStyle {
                  display: block;
                }
                .active {
                  color: rgb(253, 176, 28) !important;
                }
              }
            }
          }
          .el-transfer__buttons {
            padding: 0 20px;
          }
        }
        .el-transfer-panel__item:hover {
          color: #666 !important;
        }
        .transfer {
          height: calc(100% - 32px) !important;
          overflow: auto;
        }
        .el-transfer,
        .el-transfer-panel {
          height: 100% !important;
        }
        .el-transfer-panel__body {
          height: calc(100% - 38px) !important;
        }
        .el-checkbox-group {
          height: calc(100% - 32px);
          padding-bottom: 5px;
          box-sizing: border-box;
        }
        .el-transfer-panel__item {
          width: 100%;
          margin-right: 10px !important;
          box-sizing: border-box;
        }
      }

      .sync-object-item-wrap {
        .el-transfer__buttons {
          display: inline-flex;
          flex-direction: column;
          padding: 0 20px;
          .el-button {
            padding: 9px 15px;
            font-size: 12px;
            border-radius: 3px;
            &:last-child {
              margin-left: 0;
            }
          }
        }

        .el-transfer .el-transfer-panel {
          .el-transfer-panel__header {
            height: 28px;

            .el-checkbox {
              height: 28px;
              line-height: 28px;
              overflow: hidden;
            }
          }

          .el-transfer-panel__filter {
            margin: 10px;
            .el-input__inner {
              border-radius: 3px;
            }
          }
        }

        .el-checkbox__label {
          height: 30px;
          font-size: 12px !important;
          padding-right: 6px;
        }
      }

      .el-transfer {
        display: flex;
        align-items: center;

        &-panel {
          flex: 1;
        }
      }
    }
  }
}
</style>
