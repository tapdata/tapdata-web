<template>
  <el-dialog
    :title="$t('connection.createNewDataSource')"
    :visible="dialogVisible"
    :append-to-body="true"
    width="1030px"
    custom-class="connection-dialog"
    :before-close="handleClose"
  >
    <ConnectionTypeSelector
      :types="database"
      :otherTypes="otherType"
      :large="true"
      @select="databaseType"
    ></ConnectionTypeSelector>
  </el-dialog>
</template>

<script>
import { getImgByType, TYPEMAP } from './util'
export default {
  name: 'DatasourceDialog',
  props: {
    dialogVisible: {
      required: true,
      value: Boolean
    },
    allwoType: {
      value: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      database: [
        'mysql',
        'oracle',
        'mongodb',
        'sqlserver',
        'postgres',
        'elasticsearch',
        'redis',
        'gbase-8s',
        'sybase ase',
        'gaussdb200',
        'db2',
        'kafka',
        'mariadb',
        'mysql pxc',
        // 'jira',
        'mq',
        'dameng',
        'hive',
        // 'tcp_udp',
        'hbase',
        'kudu',
        'greenplum',
        'tidb',
        'hana',
        'clickhouse',
        'kundb',
        'adb_postgres',
        'adb_mysql',
        'hazelcast_cloud_cluster'
      ],
      otherType: ['gridfs', 'dummy db', 'rest api', 'custom_connection', 'file'],
      typeMap: TYPEMAP
      // automationType: '' //插件化数据源
    }
  },
  created() {
    let allowDataType = window.getSettingByKey('ALLOW_CONNECTION_TYPE') || []
    if (typeof allowDataType === 'string') {
      allowDataType = allowDataType.split(',')
    }
    let allowType = this.allwoType
    if (allowType && allowType.length) {
      allowDataType = allowDataType.filter(val => {
        return this.allwoType.includes(val)
      })
    }
    this.database = allowDataType.filter(type => this.database.includes(type)) || []
    this.otherType = allowDataType.filter(type => this.otherType.includes(type)) || []
    this.getDatabaseType()
  },
  methods: {
    getImgByType,
    handleClose() {
      this.$emit('dialogVisible', false)
      this.$emit('update:dialogVisible', false)
    },
    databaseType(type) {
      if (typeof type === 'object') {
        this.$emit('databaseType', type.type, type)
        this.$store.commit('createConnection', { databaseType: type.type, item: type })
        return
      }
      this.$emit('databaseType', type)
      this.$store.commit('createConnection', { databaseType: type })
    },
    getDatabaseType() {
      this.$api('DatabaseTypes')
        .get()
        .then(res => {
          if (res.data) {
            this.getPdkData(res.data)
          }
        })
    },
    getPdkData(data) {
      this.database.push(...data.filter(t => t.pdkType === 'pdk'))
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  .title {
    color: map-get($fontColor, slight);
    margin-left: 20px;
    margin-bottom: 20px;
    display: inline-block;
  }
  .item {
    li {
      float: left;
      margin-left: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .img-box {
      display: flex;
      width: 120px;
      height: 70px;
      justify-content: center;
      align-items: center;
      background: map-get($bgColor, normal);
      border: 1px solid #dedee4;
      border-radius: 3px;
      cursor: pointer;
      img {
        width: 35%;
      }
      &:hover {
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
      }
      .img-box__mask {
        margin: -1px;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.4);
        .mask-text {
          opacity: 0;
          color: map-get($fontColor, white);
          font-weight: bold;
        }
        &:hover {
          .mask-text {
            opacity: 1;
          }
        }
      }
    }
    .content {
      font-size: 12px;
      margin-top: 5px;
      max-width: 124px;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      overflow: hidden;
    }
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: '';
  }

  .clearfix:after {
    clear: both;
  }

  .clearfix {
    *zoom: 1;
  }
}
::v-deep {
  .connection-dialog {
    .el-dialog__body {
      padding: 20px 20px 30px 20px;
    }
  }
}
</style>
