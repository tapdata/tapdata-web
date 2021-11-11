<template>
  <div class="hiveNode nodeStyle">
    <head>
      <VIcon class="headIcon color-primary">arrow-right-circle</VIcon>
      <span class="txt">{{ $t('editor.nodeSettings') }}</span>
    </head>
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item :label="$t('editor.choose') + ' Vika'" prop="connectionId" :rules="rules" required>
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('message.placeholderSelect') + 'Vika'"
            :clearable="true"
          >
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('editor.cell.data_node.table.form.table.label')"
          prop="tableName"
          :rules="rules"
          required
        >
          <el-input v-model="model.tableName" placeholder="请根据下面提供的数据，选择您需要的表"></el-input>
          <!-- <FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect> -->
          <el-tree
            highlight-current
            lazy
            accordion
            check-on-click-node
            node-key="id"
            ref="vikaTree"
            :props="props"
            :load="loadNode"
            :data="nodes"
            :default-expanded-keys="expandedKeys"
            :current-node-key="currentNodeKey"
            @node-click="handleNodeClick"
          >
          </el-tree>
        </el-form-item>
      </el-form>
      <div class="e-entity-wrap" style="text-align: center" v-if="model.connectionId && model.tableName">
        <el-button
          class="fr"
          type="success"
          size="mini"
          :loading="schemasLoading"
          v-if="!dataNodeInfo.isTarget || !showFieldMapping"
          @click="changeSchema(true)"
        >
          <VIcon v-if="reloadModelLoading">loading-circle</VIcon>
          <span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
          <span v-else>{{ $t('dataFlow.updateModel') }}</span>
        </el-button>
        <FieldMapping
          v-else
          ref="fieldMapping"
          class="fr"
          :dataFlow="dataFlow"
          :showBtn="true"
          :isFirst="model.isFirst"
          :isDisable="disabled"
          :hiddenFieldProcess="true"
          :stageId="stageId"
          @update-first="returnModel"
        ></FieldMapping>
        <entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import factory from '../../../api/factory'
import Entity from '../link/Entity'
import { convertSchemaToTreeData } from '../../util/Schema'
import FieldMapping from '@/components/FieldMapping'

import VIcon from '@/components/VIcon'
const connections = factory('connections')

// let editorMonitor = null;
export default {
  name: 'ApiNode',
  components: { Entity, VIcon, FieldMapping },
  data() {
    return {
      disabled: false,
      databases: [],
      databaseLoading: false,
      reloadModelLoading: false,
      dialogVisible: false,
      addtableFalg: false,
      dialogData: null,
      schemas: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.chooseApiName')
          }
        ],
        // primaryKeys: [
        // 	{
        // 		required: true,
        // 		trigger: 'blur',
        // 		message: this.$t('editor.cell.data_node.api.none_pk')
        // 	}
        // ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.none_collection')
          }
        ]
      },
      dataNodeInfo: {},
      model: {
        connectionId: '',
        type: 'vika',
        dataBaseType: 'vika',
        tableName: '',
        tableId: '',
        field_process: [],
        isFirst: true,
        vikaNodes: [],
        vika_space_id: '',
        database_host: ''
      },
      scope: '',
      dataFlow: '',
      stageId: '',
      showFieldMapping: false,
      schemasLoading: false,
      mergedSchema: null,
      nodes: [],
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      expandedKeys: [],
      currentNodeKey: ''
    }
  },

  async mounted() {
    this.databaseLoading = true
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: 'vika'
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1,
          schema: 1
        },
        order: 'name ASC'
      })
    })

    this.databaseLoading = false
    if (result.data) {
      this.databases = result.data
    }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    },
    'model.connectionId': {
      immediate: true,
      handler() {
        this.loadDataModels(this.model.connectionId)
      }
    },
    'model.tableName': {
      immediate: true,
      handler() {
        if (!this.model.tableName || this.model.tableName === '') {
          this.currentNodeKey = ''
          this.model.tableId = ''
          this.$nextTick(function () {
            this.$refs.vikaTree.setCurrentKey('')
          })
        }
      }
    }
  },

  methods: {
    convertSchemaToTreeData,
    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      this.schemasLoading = true
      connections
        .get([connectionId])
        .then(result => {
          if (result.data) {
            this.model.vika_space_id = result.data?.vika_space_id
            this.model.database_host = result.data?.database_host
            this.getSpaceVika()
            this.loadTree()
          }
        })
        .finally(() => {
          this.schemasLoading = false
        })
    },

    setData(data, cell, dataNodeInfo, vueAdapter) {
      if (data) {
        this.scope = vueAdapter?.editor?.scope
        this.stageId = cell.id
        this.getDataFlow()
        _.merge(this.model, data)
        let param = {
          stages: this.dataFlow?.stages,
          stageId: this.stageId
        }
        this.$api('DataFlows')
          .tranModelVersionControl(param)
          .then(data => {
            this.showFieldMapping = data?.data[this.stageId]
          })
      }
      this.dataNodeInfo = dataNodeInfo || {}
      this.mergedSchema = cell.getOutputSchema()

      cell.on('change:outputSchema', () => {
        this.mergedSchema = cell.getOutputSchema()
        this.getDataFlow()
      })

      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'Vika'
      return result
    },
    setDisabled(disabled) {
      this.disabled = disabled
    },
    //获取dataFlow
    getDataFlow() {
      this.dataFlow = this.scope.getDataFlowData(true) //不校验
    },
    //接收是否第一次打开
    returnModel(value) {
      this.model.isFirst = value
    },
    //获取维格表空间
    getSpaceVika() {
      let params = {
        load_type: 'node',
        space_id: this.model.vika_space_id,
        database_host: this.model.database_host,
        connection_id: this.model.connectionId || ''
      }
      this.$api('connections')
        .getSpace(params)
        .then(data => {
          if (data.data.status === 'SUCCESS') {
            let result = data.data.result
            //过滤目录结构
            result = result.filter(v => v.type === 'Datasheet' || v.type === 'Folder')
            for (let i = 0; i < result.length; i++) {
              if (result[i].type === 'Datasheet') {
                result[i]['leaf'] = true
              } else {
                result[i]['leaf'] = false
              }
            }
            this.nodes = result
          } else {
            this.$message.error(data.data?.error)
          }
        })
        .catch(() => {
          this.$message.error('接口请求失败')
        })
    },
    loadNode(node, resolve) {
      if (!this.model.connectionId) {
        return
      }
      var hasChild
      if (node.data.type === 'Datasheet') {
        hasChild = false
      } else {
        hasChild = true
      }
      if (hasChild) {
        let params = {
          load_type: 'node',
          space_id: this.model.vika_space_id,
          database_host: this.model.database_host,
          connection_id: this.model.connectionId || '',
          node_id: node.data.id
        }
        this.$api('connections')
          .getSpace(params)
          .then(data => {
            if (data.data.status === 'SUCCESS') {
              let children = data.data?.result.children || []
              //过滤目录结构
              children = children.filter(v => v.type === 'Datasheet' || v.type === 'Folder')
              for (let i = 0; i < children.length; i++) {
                if (children[i].type === 'Datasheet') {
                  children[i]['leaf'] = true
                } else {
                  children[i]['leaf'] = false
                }
              }
              resolve(data.data?.result.children)
            } else {
              this.$message.error(data.data?.error)
            }
          })
      } else {
        resolve([])
      }
      this.currentNodeKey = this.model.tableId
      this.$nextTick(function () {
        this.$refs.vikaTree.setCurrentKey(this.currentNodeKey)
      })
    },
    handleNodeClick(data, node) {
      if (this.model.tableName === data.name) {
        return //当前node 重复点击
      }
      this.model.vikaNodes = [] //每次都放入最新的node 目录
      if (data.type === 'Datasheet') {
        this.model.tableName = data.name
        this.model.tableId = data.id
        //组装数据 递归寻找当前结构
        let self = this
        let fn = function (node) {
          let item = {
            id: node.data.id,
            name: node.data.name,
            type: node.data.type
          }
          self.model.vikaNodes.push(item)
          self.model.vikaNodes.reverse()
          if (node.level !== 1) {
            fn(node.parent)
          }
        }
        fn(node)
      } else {
        this.model.tableName = ''
        this.model.tableId = ''
      }
      this.changeSchema()
    },
    //初始化树形结构
    loadTree() {
      let data = this.model.vikaNodes || []
      this.nodes = []
      for (let level = 0; level < data.length; level++) {
        if (level === 0) {
          this.nodes.push(data[level])
          this.expandedKeys.push(data[level].id)
        } else {
          this.expandedKeys.push(data[level].id)
          this.nodes['children'] = data[level]
        }
      }
    },
    changeSchema(isLoading) {
      if (isLoading) {
        this.schemasLoading = true
      }
      let params = {
        load_type: 'field',
        space_id: this.model.vika_space_id,
        database_host: this.model.database_host,
        connection_id: this.model.connectionId || '',
        node_id: this.model.tableId
      }
      this.$api('connections')
        .getSpace(params)
        .then(data => {
          if (data.data.status === 'SUCCESS') {
            let result = data.data.result
            let schema = result.filter(s => s.table_name === this.model.tableName)
            schema =
              schema && schema.length > 0
                ? schema[0]
                : {
                    table_name: this.model.tableName,
                    cdc_enabled: true,
                    meta_type: 'Vika',
                    fields: []
                  }
            this.mergedSchema = schema
            this.$emit('schemaChange', _.cloneDeep(schema))
            if (isLoading) {
              this.schemasLoading = false
              this.$message.success(this.$t('message.reloadSchemaSuccess'))
            }
          } else {
            this.$message.error(data.data?.error)
          }
        })
        .catch(() => {
          this.$message.error('接口请求失败')
        })
    }
    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>
<style lang="scss">
.hiveNode {
  .el-form-item {
    margin-bottom: 10px;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
  .marR20 {
    margin-right: 20px;
  }
}
</style>
