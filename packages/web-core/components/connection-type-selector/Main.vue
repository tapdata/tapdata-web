<template>
  <div class="database">
    <el-radio-group v-if="!hideType && otherTypes.length" class="pb-5" v-model="type" @change="changeType">
      <el-radio-button label="sourcedata">{{ $t('connection_form_data_source') }}</el-radio-button>
      <el-radio-button label="other">Other Type</el-radio-button>
    </el-radio-group>
    <template v-if="type === 'sourcedata'">
      <ul class="database-ul" :class="[large ? 'customNthChild' : 'primaryNthChild']">
        <li v-for="item in types" :key="item.type" @click="$emit('select', item)">
          <div class="img-box">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
          </div>
          <ElTooltip class="item" effect="dark" :content="item.name" placement="bottom">
            <div class="content">{{ item.name }}</div>
          </ElTooltip>
        </li>
        <li v-for="item in comingTypes" :key="item.type" class="item--disabled">
          <div class="img-box position-relative">
            <ElImage :src="$util.getConnectionTypeDialogImg(item.type)" />
            <div class="img-box__mask position-absolute">
              <span class="mask-text">{{ item.desc }}</span>
            </div>
          </div>
          <ElTooltip class="item" effect="dark" :content="item.name" placement="bottom">
            <div class="content">{{ item.name }}</div>
          </ElTooltip>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import Cookie from '@tap/shared/src/cookie'

export default {
  name: 'ConnectionTypeSelector',
  props: {
    types: {
      value: Array,
      default: () => {
        return []
      }
    },
    otherTypes: {
      value: Array,
      default: () => {
        return []
      }
    },
    large: {
      value: Boolean,
      default: () => {
        return false
      }
    },
    hideType: {
      type: Boolean
    }
  },
  data() {
    // const $t = this.$t.bind(this)
    return {
      type: 'sourcedata',
      comingTypes: [
        // { name: 'Elasticsearch', type: 'elasticsearch', desc: $t('connection_selector_desc') },
        // { name: 'Redis', type: 'redis', desc: $t('connection_selector_desc') },
        // { name: 'PostgreSQL', type: 'postgres', desc: $t('connection_selector_desc') },
        // { name: 'SQL Server', type: 'sqlserver', desc: $t('connection_selector_desc') },
        // { name: 'GBase 8s', type: 'gbase-8s', desc: $t('connection_selector_desc') },
        // { name: 'Sybase ASE', type: 'sybase ase', desc: $t('connection_selector_desc') },
        // { name: 'GaussDB200', type: 'gaussdb200', desc: $t('connection_selector_desc') },
        // { name: 'IBM Db2', type: 'db2', desc: $t('connection_selector_desc') },
        // { name: 'Memory Cache', type: 'mem_cache', desc: $t('connection_selector_desc') },
        // { name: 'File(s)', type: 'file', desc: $t('connection_selector_desc') },
        // { name: 'Custom connection', type: 'custom_connection', desc: $t('connection_selector_desc') },
        // { name: 'REST API', type: 'rest api', desc: $t('connection_selector_desc') },
        // { name: 'Dummy DB', type: 'dummy db', desc: $t('connection_selector_desc') },
        // { name: 'GridFS', type: 'gridfs', desc: $t('connection_selector_desc') },
        // { name: 'Kafka', type: 'kafka', desc: $t('connection_selector_desc') },
        // { name: 'MariaDB', type: 'mariadb', desc: $t('connection_selector_desc') },
        // { name: 'MySQL PXC', type: 'mysql pxc', desc: $t('connection_selector_desc') },
        // { name: 'jira', type: 'jira', desc: $t('connection_selector_desc') },
        // { name: 'DM DB', type: 'dameng', desc: $t('connection_selector_desc') },
        // { name: 'Hive', type: 'hive', desc: $t('connection_selector_desc') },
        // { name: 'TCP/IP', type: 'tcp_udp', desc: $t('connection_selector_desc') },
        // { name: 'MQ', type: 'mq', desc: $t('connection_selector_desc') },
        // { name: 'HBase', type: 'hbase', desc: $t('connection_selector_desc') },
        // { name: 'KUDU', type: 'kudu', desc: $t('connection_selector_desc') },
        // { name: 'Greenplum', type: 'greenplum', desc: $t('connection_selector_desc') },
        // { name: 'TiDB', type: 'tidb', desc: $t('connection_selector_desc') },
        // { name: 'SAP HANA', type: 'hana', desc: $t('connection_selector_desc') },
        // { name: 'ClickHouse', type: 'clickhouse', desc: $t('connection_selector_desc') },
        // { name: 'KunDB', type: 'kundb', desc: $t('connection_selector_desc') },
        // { name: 'ADB MySQL', type: 'adb_mysql', desc: $t('connection_selector_desc') },
        // { name: 'ADB PostgreSQL', type: 'adb_postgres', desc: $t('connection_selector_desc') },
        // { name: 'Hazelcast Cloud', type: 'hazelcast_cloud_cluster', desc: $t('connection_selector_desc') }
      ]
    }
  },
  methods: {
    changeType(type) {
      this.type = type
    },
    getPdkIcon(item) {
      const token = Cookie.get('token')
      return `/api/pdk/icon?access_token=${token}&pdkHash=${item.pdkHash}`
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  overflow: auto;
  .title {
    color: #999;
    margin-bottom: 32px;
    display: inline-block;
  }
  .database-ul {
    display: flex;
    flex-wrap: wrap;
    li {
      margin-left: 32px;
      margin-bottom: 32px;
      text-align: center;
    }
    .item--disabled {
      .img-box {
        cursor: default;
        &:hover {
          background: #fafafa;
        }
      }
    }
    .img-box {
      width: 78px;
      height: 78px;
      border: 1px solid #dedee4;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      .img-box__mask {
        width: 75px;
        height: 20px;
        top: 5px;
        right: -20px;
        border-radius: 12px;
        align-items: center;
        background: #ff9c00;
        .mask-text {
          font-size: 11px;
          color: #fff;
          font-family: PingFangSC-Regular, PingFang SC;
        }
      }
    }
    .content {
      margin-top: 5px;
      max-width: 82px;
      font-weight: 500;
      font-size: 12px;
      color: map-get($fontColor, dark);
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      cursor: default;
      overflow: hidden;
    }
    .coming-icon {
      width: 46px;
      height: 16px;
      background: #ff9c00;
      border-radius: 7px;
    }
  }
  .customNthChild {
    max-height: 500px;
    li:nth-child(9n + 1) {
      margin-left: 0;
    }
  }
  .primaryNthChild {
    li:nth-child(6n + 1) {
      margin-left: 0;
    }
  }
}
</style>
<style lang="scss">
.database {
  .database-ul {
    .el-image__inner {
      // width: 60px
      width: 30px;
    }
  }
}
</style>
