<template>
  <div class="data-map-container">
    <div class="data-map"></div>
    <div class="data-map-info">
      <ul>
        <li>
          <span class="circle source-color"></span>
          <span>{{ $t('dataMap.infoSource') }}</span>
        </li>
        <li>
          <span class="circle target-color"></span>
          <span>{{ $t('dataMap.infoDAAS') }}</span>
        </li>
        <li>
          <span class="circle api-color"></span>
          <span>{{ $t('dataMap.infoAPI') }}</span>
        </li>
      </ul>
    </div>
    <div class="action-bar">
      <div class="left-bar">
        <span class="e-btn" @click="upward">
          <i class="el-icon-back"></i>
        </span>
      </div>
      <div class="center-bar">
        <el-radio-group v-model="currentLevel" @change="changeLevel">
          <el-radio :label="1">{{ $t('dataMap.topLevel') }}</el-radio>
          <span class="space-line"></span>
          <el-radio :label="2">{{ $t('dataMap.dbLevel') }}</el-radio>
          <span class="space-line"></span>
          <el-radio :label="3">{{ $t('dataMap.tableLevel') }}</el-radio>
          <span class="space-line"></span>
          <el-radio :label="4">{{ $t('dataMap.fieldLevel') }}</el-radio>
        </el-radio-group>
      </div>
      <div class="right-bar">
        <span class="e-btn" @click="toggleFullscreen">
          <i class="fullscreen-btn iconfont icon-quanping"></i>
        </span>
        <span class="e-btn" @click="zoomIn">
          <i class="iconfont icon-zoomin"></i>
        </span>
        <span class="e-btn" @click="zoomOut">
          <i class="iconfont icon-zoomout"></i>
        </span>
      </div>
      <div class="e-classification">
        <el-cascader
          size="mini"
          :options="treeData"
          clearable
          :filter-method="filterNode"
          @change="loadCellsByTag"
          filterable
          :props="{ label: 'value', value: 'id', expandTrigger: 'hover', checkStrictly: true }"
        >
        </el-cascader>
        <!--<div class="e-header">{{ $t('dataMap.classification') }}</div>
				<div>
					<el-cascader size="small" :options="treeData" clearable></el-cascader>
					&lt;!&ndash;<el-tree
						class="filter-tree"
						:data="treeData"
						default-expand-all
						:filter-node-method="filterNode"
						:props="{ label: 'value' }"
						@node-click="loadCellsByTag"
						:expand-on-click-node="false"
						highlight-current
					>
					</el-tree>&ndash;&gt;
				</div>-->
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import DataMap from '../../editor/data-map/index'
import log from '../../log'
import factory from '../../api/factory'
import i18n from '@/i18n'

const metadataInstances = factory('MetadataInstances')
const metadataDefinitions = factory('MetadataDefinitions')

export default {
  name: 'DataMap',

  data() {
    return {
      currentLevel: 1,
      level: 1,
      tag: '',

      connectionId: '',
      tableName: '',

      fullscreen: false,

      filterText: '',

      treeData: []
    }
  },

  watch: {
    level: {
      handler() {
        this.currentLevel = this.level
        this.loadData()
      }
    }
  },

  mounted() {
    let self = this

    self.dataMap = new DataMap({
      container: $('.data-map-container .data-map')
      //leftSidebar: $('.data-map-container .e-classification')
    })

    this.loadData()

    this.loadClassification()

    this.dataMap.graph.on('drill_down', (level, connectionId, tableName) => {
      log('DataMap.ChangeLevel', level, connectionId, tableName)
      level = level || (self.level > 1 ? --self.level : self.level)
      if (self.level !== level && level >= 1 && level <= 4) {
        self.level = level
        self.connectionId = connectionId
        self.tableName = tableName
      }
    })
  },

  methods: {
    changeLevel(newValue) {
      if (newValue === 4) {
        let self = this
        this.$alert(i18n.t('dataMap.dblclickDataModel'), '', {
          confirmButtonText: i18n.t('message.ok'),
          callback: () => {
            self.currentLevel = self.level
          }
        })
      } else {
        this.level = newValue
      }
    },

    upward() {
      if (this.level > 1) {
        this.level--
      }
    },

    zoomIn() {
      this.dataMap.graph.zoomIn()
    },

    zoomOut() {
      this.dataMap.graph.zoomOut()
    },

    toggleFullscreen(e) {
      if (this.fullscreen) this.exitFullscreen()
      else this.requestFullscreen($('.data-map-container')[0])

      this.fullscreen = !this.fullscreen
      $(e.target)
        .parent()
        .find('i.fullscreen-btn')
        .removeClass('icon-quanping')
        .removeClass('icon-huanyuanhuabu')
        .addClass(this.fullscreen ? 'icon-huanyuanhuabu' : 'icon-quanping')
    },

    requestFullscreen(element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    },

    loadData() {
      let self = this
      let loading = self.$loading({
        text: i18n.t('message.api.get.loading')
      })
      let params = { level: 1 }
      if (this.level <= 3) {
        params = { level: this.level, tag: this.tag }
      } else if (this.level === 4) {
        params = { level: 4, connectionId: this.connectionId, tableName: this.tableName }
      }
      metadataInstances
        .dataMap(params)
        .then((result) => {
          if (result && result.data && result.data.records && result.data.records.length > 0) {
            let cells = result.data.records
            self.dataMap.graph.renderCells(self.level, cells)
          } else {
            self.$message.info({
              message: i18n.t('dataMap.noneData'),
              duration: 10000,
              showClose: true,
              offset: 100
            })
          }

          loading.close()
        })
        .catch((err) => {
          log(err)
          loading.close()
          self.$message.error({
            message: i18n.t('message.api.get.error'),
            duration: 10000,
            showClose: true,
            offset: 100
          })
        })
    },

    loadCellsByTag(values) {
      if (values && values.length > 0) this.tag = values[values.length - 1]
      else this.tag = ''
      this.loadData()
    },

    loadClassification() {
      let self = this
      let params = {
        filter: {
          where: {
            item_type: {
              inq: ['table', 'view', 'collection', 'mongo_view']
            }
          }
        }
      }
      metadataDefinitions
        .get(params)
        .then((result) => {
          if (result && result.data) {
            let items = result.data || []
            let rootNode = {
              children: []
            }
            find_children(rootNode, items)
            self.treeData.splice(0, self.treeData.length)
            self.treeData.push(...rootNode.children)
          }
        })
        .catch(log)

      function find_children(parent, items) {
        if (!items || !items.length) return

        parent.children = parent.children || []
        for (let i = 0; i < items.length; i++) {
          let item = items[i]
          if (item.parent_id === parent.id || (!parent.id && !item.parent_id)) {
            item.selected = false
            parent.children.push(item)
            items.splice(i, 1)
            i--
          }
        }
        if (parent.children.length > 0) {
          for (let j = 0; j < parent.children.length; j++) {
            find_children(parent.children[j], items)
          }
        } else {
          delete parent.children
        }
      }
    },

    filterNode(node, keyword) {
      if (!keyword) return true
      return node.label.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    }
  }
}
</script>

<style lang="less">
@import '../../editor/data-map/style/data-map';
.data-map-container {
  .e-classification {
    padding: 20px;
    .el-tree-node__label {
      font-size: 12px;
    }
    .el-tree-node__content {
      border-bottom: 1px dotted #ddd;
    }

    .e-header {
    }
  }
}
</style>
<style scoped lang="less">
.source-color {
  background: #fcf9fe;
  border: 1px solid #dedede;
}
.target-color {
  background: #ebf7fc;
  border: 1px solid #b1e4f8;
}
.api-color {
  background: #fbecec;
  border: 1px solid #f7dddd;
}
.data-map-info {
  width: 100px;
  height: 105px;
  border-radius: 6px;
  opacity: 0.8;
  position: absolute;
  top: 25px;
  right: 25px;
  border: 1px solid #dedede;
  font-size: 12px;
  margin: 20px;
  ul li {
    float: left;
    width: 140px;
    margin-top: 15px;
    margin-left: 15px;
    span {
      display: inline-block;
    }
    .circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      vertical-align: middle;
      margin-right: 5px;
    }
  }
}
</style>
