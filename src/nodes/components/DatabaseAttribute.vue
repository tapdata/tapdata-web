<template>
  <div class="attr-panel">
    <div class="attr-panel-body">
      <ElForm class="flex flex-column h-100">
        <FormProvider :form="form">
          <SchemaField
            :schema="schema"
            :scope="{ useAsyncDataSource, loadDatabase, loadDatabaseInfo }"
          />
          <!--<FormConsumer>
            <template #default="{ form }">
              {{ form.values }}
            </template>
          </FormConsumer>-->
        </FormProvider>
      </ElForm>

      <!--<ElForm
        class="e-form"
        label-position="top"
        label-width="160px"
        :model="node"
        ref="form"
        :disabled="disabled"
      >
        <ElFormItem
          class="e-form"
          :label="$t('editor.cell.data_node.database.form.label')"
          prop="connectionId"
          :rules="rules"
          required
        >
          <div style="display: flex">
            &lt;!&ndash;<FbSelect
              :value="node.connectionId"
              :config="databaseSelectConfig"
              @change="valueChanged"
            ></FbSelect>&ndash;&gt;
            <ElButton
              size="mini"
              icon="el-icon-plus"
              style="padding: 7px; margin-left: 7px"
              v-readonlybtn="'datasource_creation'"
              @click="creatDatabase"
              >{{ $t('dataFlow.createNew') }}</ElButton
            >
            &lt;!&ndash; @click="$refs.databaseForm.show()" &ndash;&gt;
            &lt;!&ndash; <DatabaseForm ref="databaseForm" @success="loadDataSource"></DatabaseForm> &ndash;&gt;
          </div>
        </ElFormItem>
      </ElForm>-->

      <!--<div
        class="database-info flex flex-column flex-grow-1 overflow-hidden"
        v-if="node.connectionId"
      >
        <div class="info-table flex flex-column overflow-hidden">
          <div class="info-table-header">
            {{ $t('editor.cell.data_node.database.includeTable') }}
            <span>{{ databaseTables.length }}</span>
          </div>
          <ul class="table-box flex-fill" v-loading="tableLoading">
            <li
              v-for="item in databaseTables"
              :key="item"
              class="list-item flex align-center"
            >
              <i class="iconfont icon-table2 mr-1"></i>
              <span class="list-item-text">{{ item }}</span>
            </li>
            <EmptyItem small v-if="!databaseTables.length"></EmptyItem>
          </ul>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script>
import factory from '@/api/factory'
import _ from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import EmptyItem from '@/components/EmptyItem'
import { createForm } from '@formily/core'
import { action } from '@formily/reactive'
import { FormProvider, FormConsumer, createSchemaField } from '@formily/vue'
import { components } from '@/components/form'

const { SchemaField } = createSchemaField({
  components
})

let connections = factory('connections')

export default {
  name: 'DatabaseAttribute',

  components: { FormProvider, FormConsumer, SchemaField },

  data() {
    return {
      form: createForm({
        // display: 'hidden'
      }),
      schema: {
        type: 'object',
        properties: {
          datasource: {
            title: '数据库',
            type: 'void',
            'x-decorator': 'ElFormItem',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none'
            },
            'x-component': 'Row',
            'x-component-props': {
              type: 'flex',
              gap: '8px'
            },
            properties: {
              connectionId: {
                type: 'string',
                required: true,
                'x-decorator': 'Col',
                'x-decorator-props': { flex: 1 },
                'x-component': 'ComboSelect',
                'x-component-props': {
                  config: { placeholder: '请选择数据库' }
                },
                'x-reactions': ['{{useAsyncDataSource(loadDatabase)}}']
              },
              connectionBtn: {
                type: 'void',
                'x-component': 'AddDatabaseBtn'
              }
            }
          },
          datasourceInfo: {
            type: 'object',
            'x-component': 'DatabaseInfo',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo)}}']
          }
        }
      },

      tableLoading: false,
      disabled: false,
      activeName: '0',
      databaseTables: [],

      isSourceDataNode: false,
      firstRound: true,

      databaseSelectConfig: {
        size: 'mini',
        placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
        loading: false,
        filterable: true,
        /*on: {
          change() {
            self.model.removeAllTables = false
            self.changeConnection()
            valueChanged
          }
        },*/
        options: []
      },

      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.database.form.placeholder')
          }
        ]
      },
      model: {
        database_type: '',
        connectionId: '',
        table_prefix: '',
        table_suffix: '',
        dropType: 'no_drop',
        syncObjects: [],
        type: 'postgres'
      },
      databaseInfo: {
        connection_type: '',
        database_type: '',
        database_port: '',
        database_host: '',
        database_uri: '',
        database_owner: '',
        database_name: '',
        database_username: ''
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', { node: 'activeNode' })
  },

  watch: {
    // 'node.database_type'() {
    //   // 数据库类型发生改变，重新加载数据源
    //   this.loadDataSource()
    // },
    /*async 'node.id'() {
      await this.$nextTick()
      this.$refs.form.clearValidate()
      // FIXME 加载逻辑有待调整
      await this.loadDataSource()
    }*/
  },

  created() {
    // this.loadDataSource()
  },

  async mounted() {
    await this.$nextTick()
    this.form.setState({
      display: 'visible',
      values: this.node
    })
    // this.form = createForm({
    //   values: this.node
    // })
    // setTimeout(() => {
    //   console.log(this.form.getState())
    // }, 3000)
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue']),

    useAsyncDataSource(service) {
      return field => {
        field.loading = true
        service(field).then(
          action(data => {
            field.dataSource = data
            field.loading = false
          })
        )
      }
    },

    async loadDatabase(field) {
      let database_type = field.form.values.database_type
      try {
        let result = await connections.get({
          filter: JSON.stringify({
            where: {
              database_type: database_type
                ? { in: [database_type] }
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

    async loadDatabaseInfo(field) {
      const connectionId = field.query('connectionId').get('value')
      if (!connectionId) return
      let result = await connections.customQuery([connectionId], {
        schema: true
      })
      return result.data
    },

    creatDatabase() {
      let database_type = this.model.database_type || this.model.databaseType
      let href = '/#/connections/create?databaseType=' + database_type
      window.open(href, '_blank')
    },

    setData(data, cell, dataNodeInfo) {
      if (data) {
        _.merge(this.model, data)
      }
      this.cell = cell
      this.isSourceDataNode = dataNodeInfo && !dataNodeInfo.isTarget
      // editorMonitor = vueAdapter.editor;

      this.loadDataSource()
    },

    async loadDataSource() {
      this.databaseSelectConfig.loading = true
      // let database_type = this.model.database_type || this.model.databaseType
      let database_type = this.node.database_type
      let result = await connections.get({
        filter: JSON.stringify({
          where: {
            database_type: database_type
              ? { in: [database_type] }
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
      this.databaseSelectConfig.loading = false
      if (result.data) {
        this.databaseSelectConfig.options = result.data.map(item => {
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} (${
              this.$t('connection.status.' + item.status) || item.status
            })`,
            value: item.id
          }
        })

        this.lookupDatabaseType()
      }
    },

    changeConnection() {
      this.databaseTables = []
      this.lookupDatabaseType()

      /*this.cell.graph
        .getConnectedLinks(this.cell, { outbound: true })
        .forEach(link => {
          let orignData = link.getFormData()
          if (orignData) {
            orignData.selectSourceDatabase = {
              table: true,
              view: false,pa
              function: false,
              procedure: false
            }
            orignData.table_prefix = ''
            orignData.table_suffix = ''
            orignData.dropType = 'no_drop'
            orignData.table_prefix = ''
            orignData.selectSourceArr = []
          }
          link.setFormData(orignData)
        })*/
    },

    lookupDatabaseType() {
      const { connectionId } = this.node
      if (!connectionId) return
      let selectedDbs = this.databaseSelectConfig.options.filter(
        db => db.id === connectionId
      )
      if (selectedDbs && selectedDbs.length > 0) {
        this.database_type = selectedDbs[0].database_type
      }
      if (this.database_type === 'mongodb') {
        this.getMongoDBData(connectionId)
      } else {
        this.loadDataModels(connectionId)
      }
    },
    // 获取表名称
    loadDataModels(connectionId) {
      this.tableLoading = true
      let self = this
      if (!connectionId) {
        return
      }
      connections
        .customQuery([connectionId], { schema: true })
        .then(result => {
          if (result.data) {
            self.databaseInfo = result.data
            self.model.database_type = self.databaseInfo.database_type
            let tables = (result.data.schema && result.data.schema.tables) || []
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
            )
            if (!(this.firstRound && this.databaseTables.length > 0)) {
              let tablesArr = tables.filter(item => {
                if (item.table_name) {
                  return item.table_name
                }
              })
              this.databaseTables = [
                ...new Set(tablesArr.map(item => item.table_name))
              ]
            }

            this.handleIncludeTable()
            this.firstRound = false
            self.$forceUpdate()
            this.tableLoading = false
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    // 获取保留表数据
    handleIncludeTable() {
      let syncItem = this.node.syncObjects.find(item => item.type === 'table')
      if (syncItem?.objectNames.length) {
        const { table_prefix = '', table_suffix = '' } = this.node
        const pushTables = syncItem.objectNames.map(item => {
          return table_prefix + item + table_suffix
        })

        this.databaseTables = [
          ...new Set(this.databaseTables.concat(pushTables))
        ]
      }
      /*this.cell.graph
        .getConnectedLinks(this.cell, { inbound: true })
        .forEach(link => {
          let orignData = link.getFormData()
          let includeTable = [],
            databaseTables = []
          if (
            orignData &&
            orignData.selectSourceArr &&
            orignData.selectSourceArr.length
          ) {
            includeTable = orignData.selectSourceArr.map(item => {
              return orignData.table_prefix + item + orignData.table_suffix
            })

            databaseTables = this.databaseTables.concat(includeTable)
            this.databaseTables = [...new Set(databaseTables)]
          }
        })*/
    },
    getMongoDBData(connectionId) {
      if (!connectionId) {
        return
      }
      connections.customQuery([connectionId]).then(result => {
        if (result.data) {
          this.loadDataModels([connectionId])
          // this.database_host = result.data.database_host;
          // this.database_port = result.data.database_port;
        }
      })
    },
    filter(list, keyword) {
      let reg = new RegExp(keyword, 'ig')
      return keyword ? list.filter(t => t.table_name.match(reg)) : list
    },
    // checkAll() {
    // 	let pane = this.tabs[this.activeName];
    // 	let checkAll = pane.checkAll;
    // 	let filterList = this.filterTables[this.activeName];
    // 	filterList.map(item => {
    // 		item.checked = checkAll;
    // 	});
    // },

    // move(list) {
    // 	this.tabs[this.activeName].checkAll = false;
    // 	let inList = this.tabs[0].list;
    // 	let outList = this.tabs[1].list;
    // 	let sourceList = this.activeName === '0' ? inList : outList;
    // 	let targetList = this.activeName === '0' ? outList : inList;

    // 	list.forEach(item => {
    // 		item.checked = false;

    // 		let tableIndex = sourceList.findIndex(table => table.table_name === item.table_name);
    // 		sourceList.splice(tableIndex, 1);

    // 		targetList.push(item);
    // 	});

    // 	targetList.sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1));

    // 	this.model.includeTables = inList.map(t => t.table_name);
    // },

    // moveAll() {
    // 	let list = this.filterTables[this.activeName];
    // 	this.move(list.filter(t => t.checked));
    // },

    getData() {
      let result = _.cloneDeep(this.model)
      if (result.connectionId) {
        let database = this.databaseSelectConfig.options || []
        database = database.filter(db => db.id === result.connectionId)

        if (this.isSourceDataNode) {
          delete result.dropTable
        }

        if (database && database.length > 0) {
          result.name = database[0].name
        }
      }

      return result
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },

    valueChanged(v) {
      this.setNodeValue({
        id: this.node.id,
        key: 'connectionId',
        value: v
      })
      this.changeConnection()
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>

<style scoped lang="scss">
$radius: 4px;

.attr-panel {
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
          background-color: #f5f5f5;
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
  }

  &-body {
  }
}
</style>
