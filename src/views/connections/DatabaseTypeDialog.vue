<template>
  <el-dialog
    :title="$t('connection.createNewDataSource')"
    :visible="dialogVisible"
    :append-to-body="true"
    width="770px"
    :before-close="handleClose"
  >
    <ConnectionTypeSelector
      :types="database"
      :commingTypes="comingAllowDatabase"
      :otherTypes="otherType"
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
        'jira',
        'dameng',
        'hive',
        'tcp_udp'
      ],
      comingAllowDatabase: [], // 即将上线
      otherType: [
        'gridfs',
        'dummy db',
        'rest api',
        'custom_connection',
        'file'
      ],
      typeMap: TYPEMAP
    }
  },
  created() {
    let allowDataType = window.getSettingByKey('ALLOW_CONNECTION_TYPE') || []
    let comingAllowDataType =
      window.getSettingByKey('COMING_ONLINE_CONNECTION_TYPE') || []
    let allwoType = this.allwoType
    if (allwoType && allwoType.length) {
      allowDataType = allowDataType.filter(val => {
        return this.allwoType.includes(val)
      })
    }
    this.comingAllowDatabase =
      comingAllowDataType.filter(type => this.database.includes(type)) || []
    this.database =
      allowDataType.filter(type => this.database.includes(type)) || []
    this.otherType =
      allowDataType.filter(type => this.otherType.includes(type)) || []
  },
  methods: {
    getImgByType,
    handleClose() {
      this.$emit('dialogVisible', false)
      this.$emit('update:dialogVisible', false)
    },
    databaseType(type) {
      this.$emit('databaseType', type)
      this.$store.commit('createConnection', { databaseType: type })
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  .title {
    color: #999;
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
      background: #fafafa;
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
          color: #fff;
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
</style>
