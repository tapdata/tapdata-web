<template>
  <section
    v-show="isMonitor || activeType"
    v-resize.top="{
      minHeight: 40
    }"
    class="config-panel border-top"
  >
    <VIcon class="config-panel-close" size="16" @click="handleClosePanel">close</VIcon>
    <div v-if="activeType === 'settings'" class="h-100 flex flex-column overflow-hidden">
      <SettingPanel v-bind="$attrs" v-on="$listeners"></SettingPanel>
    </div>
    <div v-else class="config-tabs-wrap">
      <div class="tabs-header flex align-center px-4">
        <!--<VIcon class="header-icon mr-2">{{ icon }}</VIcon>-->
        <ElImage class="mr-2" :src="icon"></ElImage>
        <div class="title-input-wrap flex align-center flex-shrink-0 h-100">
          <input
            ref="nameInput"
            v-focus-select
            :value="activeNode ? activeNode.name : ''"
            :readonly="isMonitor"
            class="title-input text-truncate"
            @change="handleChangeName"
          />
          <VIcon @click="focusNameInput" class="title-input-icon" size="14">edit-outline</VIcon>
        </div>
      </div>
      <ElTabs v-model="currentTab" class="config-tabs">
        <ElTabPane label="属性设置">
          <FormPanel :scope="scope" v-on="$listeners"></FormPanel>
        </ElTabPane>
        <ElTabPane label="元数据">
          <MetaPane></MetaPane>
        </ElTabPane>
        <ElTabPane label="数据详情">
          <DataPane></DataPane>
        </ElTabPane>
      </ElTabs>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import FormPanel from 'web-core/views/dataflow/components/FormPanel'
import SettingPanel from 'web-core/views/dataflow/components/SettingPanel'
import DataPane from 'web-core/views/dataflow/components/DataPane'
import MetaPane from 'web-core/views/dataflow/components/MetaPane'
import VIcon from 'web-core/components/VIcon'
import { DB_ICON, NODE_TYPE_ICON } from 'web-core/views/dataflow/constants'
import focusSelect from 'web-core/directives/focusSelect'
import { validateBySchema } from 'web-core/components/form/utils/validate'
import { action } from '@formily/reactive'
import ConnectionsApi from 'web-core/api/Connections'
import MetadataApi from 'web-core/api/MetadataInstances'

const connections = new ConnectionsApi()
const metadataApi = new MetadataApi()

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  props: {
    isMonitor: Boolean
  },

  data() {
    return {
      currentTab: '0',

      scope: {
        /**
         * 统一的异步数据源方法
         * @param service
         * @param fieldName 数据设置指定的字段
         * @param serviceParams 缺省参数，传递给service方法
         * @returns {(function(*=): void)|*}
         */
        useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            field.loading = true
            service(field, ...serviceParams).then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },

        /**
         * 加载数据库
         * @param field
         * @param databaseType 数据库类型，String或Array
         * @returns {Promise<*[]|*>}
         */
        loadDatabase: async (field, databaseType = field.form.values.databaseType) => {
          try {
            let result = await connections.get({
              filter: JSON.stringify({
                where: {
                  database_type: databaseType
                    ? {
                        $in: Array.isArray(databaseType) ? databaseType : [databaseType]
                      }
                    : {
                        $nin: ['file', 'dummy', 'gridfs', 'rest api', 'custom_connection']
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
            return (result.items || result).map(item => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} (${this.$t('connection.status.' + item.status) || item.status})`,
                value: item.id,
                databaseType: item.database_type
              }
            })
          } catch (e) {
            console.log('catch', e) // eslint-disable-line
            return []
          }
        },

        /**
         * 加载数据库的详情
         * @param field
         * @param connectionId
         * @returns {Promise<AxiosResponse<any>>}
         */
        loadDatabaseInfo: async (field, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          return await connections.customQuery([connectionId], {
            schema: true
          })
        },

        /**
         * 加载数据库的表，只返回表名的集合
         * @param field
         * @param connectionId
         * @returns {Promise<*|AxiosResponse<any>>}
         */
        loadDatabaseTable: async (field, connectionId = field.query('connectionId').get('value')) => {
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
                original_name: true
              }
            })
          }
          const data = await metadataApi.get(params)
          return data.items.map(item => item.original_name)
        },

        /**
         * 加载表的详情，返回表的数据对象
         * @param field
         * @param connectionId
         * @param tableName
         * @returns {Promise<AxiosResponse<any>>}
         */
        loadTableInfo: async (
          field,
          connectionId = field.query('connectionId').get('value'),
          tableName = field.query('tableName').get('value')
        ) => {
          if (!connectionId || !tableName) return
          // console.log('loadTableInfo', field, id) // eslint-disable-line
          const params = {
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                original_name: tableName,
                is_deleted: false
              }
            })
          }
          return await metadataApi.get(params)
        },

        /**
         * 加载表字段，返回字段名的集合
         * @param field
         * @param connectionId
         * @param tableName
         * @returns {Promise<*>}
         */
        loadTableField: async (
          field,
          connectionId = field.query('connectionId').get('value'),
          tableName = field.query('tableName').get('value')
        ) => {
          if (!connectionId || !tableName) return
          const params = {
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                original_name: tableName,
                is_deleted: false
              },
              fields: {
                fields: true
              }
            })
          }
          const data = await metadataApi.get(params)
          return data.items[0]?.fields.map(item => item.field_name) || []
          // const tableData = await metadataApi.findOne(params)
          // return tableData.fields.map(item => item.field_name)
        },

        // 加载数据集
        loadCollections: async (field, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          let result = await connections.get([connectionId])
          const tables = result.data?.schema?.tables || []
          return tables
        },

        /**
         * 对目标端已存在的结构和数据的处理，下拉选项
         * @param field
         */
        loadDropOptions: field => {
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
        },

        /**
         * 数据写入模式
         * @param field
         */
        loadWriteModelOptions: field => {
          const options = [
            {
              label: this.$t('editor.cell.link.writeMode.append'),
              value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
            },
            {
              label: this.$t('editor.cell.link.writeMode.upsert'),
              value: 'upsert' // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
            },
            {
              label: this.$t('editor.cell.link.writeMode.update'),
              value: 'update' // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
            }
          ]
          if (field.form.values.type !== 'table') {
            // SupportEmbedArray
            options.push({
              label: this.$t('editor.cell.link.writeMode.merge_embed'),
              value: 'merge_embed' // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
            })
          }
          field.dataSource = options
        },

        isSource: field => {
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          // field.setValue(allEdges.some(({ source }) => source === id))
          field.value = allEdges.some(({ source }) => source === id)
          /*console.log(
            '🚗isSource',
            allEdges,
            id,
            allEdges.some(({ source }) => source === id),
            field.value,
            field
          )*/
        },

        isTarget: field => {
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          // field.setValue(allEdges.some(({ target }) => target === id))
          field.value = allEdges.some(({ target }) => target === id)
          /*console.log(
            '🚗isTarget',
            allEdges,
            id,
            allEdges.some(({ target }) => target === id),
            field.value,
            field
          )*/
        }
      }
    }
  },

  components: { VIcon, MetaPane, DataPane, FormPanel, SettingPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'settingPanelType']),

    icon() {
      const node = this.activeNode
      if (!node) return null
      const icon = node.type === 'table' ? DB_ICON[node.databaseType] : NODE_TYPE_ICON[node.type]
      return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
    }
  },

  watch: {
    async 'activeNode.id'(n, o) {
      if (o) {
        const node = this.nodeById(o)
        try {
          if (node) {
            const result = await validateBySchema(node.__Ctor.formSchema, node, this.scope)
            // eslint-disable-next-line no-console
            console.log('上一个激活的节点校验结果', result)
          }
          this.clearNodeError(o)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          this.setNodeError(o)
        }
        // console.log('上一个激活的节点校验结果', result)
      }
    }
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties', 'setNodeError', 'clearNodeError', 'setActiveType']),

    handleChangeName(e) {
      this.updateNodeProperties({
        id: this.activeNode.id,
        properties: {
          name: e.target.value
        }
      })
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
    },

    handleClosePanel() {
      this.setActiveType(null)
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
<style scoped lang="scss">
$color: map-get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.title-input-wrap {
  position: relative;
  flex: 1;
  font-size: 14px;

  &:hover {
    .title-input {
      border-color: #dcdfe6;
    }
    .title-input-icon {
      color: $color;
    }
  }

  .title-input {
    position: relative;
    padding: 2px 28px 1px 8px;
    width: 100%;
    height: 28px;
    line-height: 28px;
    outline: none;
    box-shadow: none;
    background: 0 0;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: inherit;
    transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:focus {
      border-color: #409eff;
      & + .title-input-icon {
        color: $color;
      }
    }
  }

  .title-input-icon {
    position: absolute;
    right: 8px;
    height: 28px;
  }
}

.config-panel {
  position: relative;
  z-index: 10;
  height: 40vh;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: height;

  &-close {
    position: absolute;
    z-index: 3;
    top: 12px;
    right: 16px;
  }

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .tabs-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: $tabsHeaderWidth;
    height: $headerHeight;

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  .panel-header {
    height: $headerHeight;
  }

  .header-icon {
    color: $color;
    font-size: 18px;
  }
  /*.setting-tabs {
    ::v-deep {
      .el-tabs__content {
        height: calc(100% - 55px);
        .el-tab-pane {
          height: 100%;
          .setting-tabs-box {
            box-sizing: border-box;
            .title {
              height: 40px;
              line-height: 40px;
            }
            textarea {
              border: 1px solid #d9d9d9;
              min-width: 600px;
              min-height: 100px;
              &:focus {
                outline: initial;
              }
            }
          }
        }
      }
    }
  }*/

  ::v-deep {
    .config-tabs.el-tabs {
      height: 100%;

      > .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          padding-left: $tabsHeaderWidth + 32px;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
        }
        .el-tabs__active-bar {
          background-color: $color;
        }

        .el-tabs__item {
          font-weight: 400;

          &.is-active,
          &:hover {
            color: $color;
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 40px);
        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}
</style>
