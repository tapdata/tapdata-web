<template>
  <div class="box">
    <div
      class="treeBox"
      v-loading="loading"
      :element-loading-text="$t('dataFlow.dataLoading')"
    >
      <ul>
        <li @dblclick="handleGraph(item)" v-for="item in data" :key="item.id">
          <span
            :class="`iconfont icon ${mapping[item.source.database_type]} ${
              item.source.database_type
            }`"
          ></span>
          <el-tooltip
            class="table-tooltip"
            effect="dark"
            :content="item.label"
            placement="right"
          >
            <span class="text">{{ item.label }}</span>
          </el-tooltip>
        </li>
      </ul>
      <div class="noData" v-if="loadingError">
        <div>
          {{ $t('dataFlow.loadingError')
          }}<span class="clickLoad" @click="clickLoad">{{
            $t('dataVerify.refresh')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import factory from '../../api/factory'
import log from '../../log'

const MetadataInstances = factory('MetadataInstances')

export default {
  name: 'TableSelector',
  data() {
    return {
      loadingError: false,
      count: 0,
      filterText: '',
      data: [],
      default_expanded: false,
      isActive: true,
      props: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      mapping: {
        mysql: 'icon-mysql1',
        oracle: 'icon-ora3',
        db2: 'icon-DB2',
        mongodb: 'icon-mongo1',
        postgres: 'icon-pg1',
        gridfs: 'icon-gridfs2',
        sqlserver: 'icon-sqlserver',
        'gbase-8s': 'icon-gbase',
        'sybase ase': 'icon-sybase'
      },
      loading: false
    }
  },
  mounted() {
    this.loadDataBase()
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    // 点击加载
    clickLoad() {
      this.loadDataBase()
    },
    loadDataBase() {
      let self = this
      let filter = {
        where: {
          meta_type: {
            in: ['database', 'ftp']
          },
          'source.database_type': {
            in: [
              'mysql',
              'mongodb',
              'db2',
              'oracle',
              'postgres',
              'gridfs',
              'file',
              'sqlserver',
              'gbase-8s',
              'sybase ase'
            ]
          },
          is_deleted: false
        },
        order: 'original_name ASC',
        fields: {
          id: true,
          label: true,
          meta_type: true,
          original_name: true,
          source: true,
          'source._id': true,
          'source.user_id': true,
          'source.name': true,
          'source.database_type': true,
          'source.status': true
        }
      }
      let params = {
        filter: JSON.stringify(filter)
      }
      self.loading = true
      MetadataInstances.get(params)
        .then((res) => {
          if (res.data) {
            // self.data.splice(0, self.data.length);
            self.data = []
            res.data.forEach((record) => {
              self.data.push({
                id: record.id,
                label: record.name || record.original_name,
                meta_type: record.meta_type,
                source: record.source || ''
              })
            })
            log('TableSelector.loadDataBase', self.data)
          }
          self.loadingError = false
        })
        .catch(() => {
          self.loadingError = true
          this.$message.error('MetadataInstances error')
        })
        .finally(() => {
          self.loading = false
        })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleGraph(data) {
      log('tableSelect handleGraph', data)
      let mapping = {
        database: 'app.Database',
        gridfs: 'app.GridFSNode',
        file: 'app.FileNode'
      }

      let formData = {}
      let schema = {}
      if (data.meta_type === 'database') {
        if (
          data.source.database_type &&
          ['gridfs', 'file'].includes(data.source.database_type)
        ) {
          formData = {
            connectionId: data.source._id,
            name: data.source.name || data.label,
            type: data.source.database_type
          }
        } else {
          formData = {
            connectionId: data.source._id,
            name: data.source.name || data.label,
            database_type: data.source.database_type
          }
        }
      } else if (data.meta_type === 'ftp') {
        formData = {
          connectionId: data.source._id || data.source.id,
          name: data.source.name || data.label,
          type: data.source.database_type
        }
      }

      this.count = this.count + 50
      let cell = ''
      if (['database', 'ftp'].includes(data.meta_type)) {
        if (
          data.source.database_type &&
          ['gridfs', 'file'].includes(data.source.database_type)
        ) {
          let dataType = data.source.database_type
          cell = this.editor.graph.createCell(
            mapping[dataType],
            formData,
            schema
          )
        } else {
          cell = this.editor.graph.createCell(
            mapping[data.meta_type],
            formData,
            schema
          )
        }
      }
      let databaseShape = {
        mysql: 'static/editor/o-mysql.svg',
        oracle: 'static/editor/o-ora.svg',
        db2: 'static/editor/o-db2.svg',
        mongodb: 'static/editor/o-mongo.svg',
        postgres: 'static/editor/o-pg.svg',
        sqlserver: 'static/editor/o-sqlserver.svg',
        'gbase-8s': 'static/editor/o-gbase.svg',
        'sybase ase': 'static/editor/o-sybase.svg'
      }
      let coordinates = this.editor.graph.getClientOffset()
      cell.position(coordinates.x + 400, coordinates.y + this.count + 160)
      cell.attr('image/xlinkHref', databaseShape[data.source.database_type])
      this.editor.graph.addCell(cell)
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  width: 234px;
  background: #fafafa;
  ul {
    li {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      cursor: pointer;
      overflow: hidden;
      color: #606266;
      text-overflow: ellipsis;
      font-size: 12px;
      width: 210px;
      height: 40px;
      background: #fff;
      box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.11);
      border-radius: 3px;
      margin-left: 9px;
      margin-right: 15px;
      margin-top: 7px;
      padding-right: 2px;
      .icon {
        width: 24px;
        height: 24px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 3px;
        text-align: center;
        line-height: 24px;
        margin-left: 6px;
      }
      .text {
        display: inline-block;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &:hover {
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.ts-icon {
  color: #333;
}
.ts-tree {
  /*设置文字不能被选中     以下为css样式*/
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.table-tooltip {
  display: inline-block;
  width: 180px;
}
.mysql {
  color: #4a94c6;
}
.oracle {
  color: #da4136;
}
.db2 {
  color: #2bc1e8;
}
.postgres {
  color: #2f638f;
}
.mongodb {
  color: #85c47c;
}
.gridfs {
  color: #4aaf47;
}
.sqlserver {
  color: #2f638f;
}
.gbase-8s {
  color: #85c47c;
}
.sybase ase {
  color: #4aaf47;
}
.noData {
  height: calc(100% - 60px);
  padding-top: 9%;
  color: #999;
  font-size: 12px;
  background-color: #fff;
  div {
    text-align: center;
  }
  .clickLoad {
    cursor: pointer;
    color: #48b6e2;
  }
}
</style>
<style scoped>
/*头部样式*/
.metadata-header {
  width: 232px;
  height: 31px;
  background: #f1f1f1;
  border-bottom: 1px solid #dedee4;
  font-size: 12px;
  line-height: 31px;
  padding-left: 8px;
  display: flex;
}
</style>
