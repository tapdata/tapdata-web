<template>
  <div class="database">
    <el-radio-group v-if="!hideType && otherTypes.length" class="pb-5" v-model="type" @change="changeType">
      <el-radio-button label="sourcedata">{{ $t('connection_form_data_source') }}</el-radio-button>
      <el-radio-button label="other">Other Type</el-radio-button>
    </el-radio-group>
    <template v-if="type === 'sourcedata'">
      <ul class="database-ul position-relative" :class="[large ? 'customNthChild' : 'primaryNthChild']">
        <li v-for="item in types" :key="item.type" @click="$emit('select', item)">
          <div class="img-box">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
          </div>
          <ElTooltip class="item" effect="dark" :content="item.name" placement="bottom">
            <div class="content">
              <div class="content__name">{{ item.name }}</div>
            </div>
          </ElTooltip>
        </li>
        <li
          v-for="(item, itemIndex) in comingTypes"
          :key="item.type"
          class="item--disabled"
          :style="getComingItemStyle(itemIndex)"
        >
          <div>
            <div class="img-box">
              <ElImage :src="$util.getConnectionTypeDialogImg(item.type)" />
            </div>
            <!--            <ElTooltip class="item" effect="dark" :content="item.name" placement="bottom">-->
            <div class="content">
              <div class="content__name">{{ item.name }}</div>
            </div>
            <!--            </ElTooltip>-->
          </div>
        </li>
        <div v-if="comingTypes.length > 0" class="coming-desc" :style="getComingDescStyle()">
          <div class="coming-desc__content">
            <div class="mb-2">{{ comingDesc1 }}</div>
            <div>{{ comingDesc2 }}</div>
          </div>
        </div>
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
    return {
      type: 'sourcedata',
      comingDesc1: this.$t('connection_selector_desc1'),
      comingDesc2: this.$t('connection_selector_desc2'),
      comingTypes: [
        { name: 'Oracle', type: 'oracle' },
        { name: 'Elasticsearch', type: 'elasticsearch' },
        { name: 'Redis', type: 'redis' },
        { name: 'PostgreSQL', type: 'postgres' },
        { name: 'SQL Server', type: 'sqlserver' },
        { name: 'GBase 8s', type: 'gbase-8s' },
        { name: 'Sybase ASE', type: 'sybase ase' },
        { name: 'GaussDB200', type: 'gaussdb200' },
        { name: 'IBM Db2', type: 'db2' },
        { name: 'Memory Cache', type: 'mem_cache' },
        { name: 'KunDB', type: 'kundb' },
        { name: 'Custom connection', type: 'custom_connection' },
        { name: 'REST API', type: 'rest api' },
        { name: 'Dummy DB', type: 'dummy db' },
        { name: 'GridFS', type: 'gridfs' },
        { name: 'Kafka', type: 'kafka' },
        { name: 'MariaDB', type: 'mariadb' },
        { name: 'MySQL PXC', type: 'mysql pxc' },
        { name: 'jira', type: 'jira' },
        { name: 'DM DB', type: 'dameng' },
        { name: 'Hive', type: 'hive' },
        { name: 'TCP/IP', type: 'tcp_udp' },
        { name: 'MQ', type: 'mq' },
        { name: 'HBase', type: 'hbase' },
        { name: 'KUDU', type: 'kudu' },
        { name: 'Greenplum', type: 'greenplum' },
        { name: 'TiDB', type: 'tidb' },
        { name: 'SAP HANA', type: 'hana' },
        { name: 'ClickHouse', type: 'clickhouse' },
        { name: 'File(s)', type: 'file' },
        { name: 'ADB MySQL', type: 'adb_mysql' },
        { name: 'ADB PostgreSQL', type: 'adb_postgres' },
        { name: 'Hazelcast Cloud', type: 'hazelcast_cloud_cluster' }
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
    },
    getComingItemStyle(index) {
      let count = 9
      let result = {}
      let comingLen = this.comingTypes.length
      let typesLen = this.types.length
      let row = Math.ceil(typesLen / count) // 支持数据源的行数
      let allRow = Math.ceil((comingLen + typesLen) / count) // 所有数据源的行数
      let col = typesLen % count // 支持数据源，多出的列数
      let allCol = (comingLen + typesLen) % count // 所有数据源，多出的列数
      // 第一行，第一个元素
      if (index === 0) {
        result['border-top-left-radius'] = '8px'
      }
      // 第一行，最后一个元素
      if (typesLen + index + 1 === count * (col ? row : row + 1)) {
        result['border-top-right-radius'] = '8px'
      }
      if (col !== 0) {
        // 第二行，第一个元素
        if (index + typesLen === count * row) {
          result['border-top-left-radius'] = '8px'
        }
      }
      // 最后一行，第一个元素
      if (typesLen + index + 1 - 1 === count * (allRow - 1)) {
        result['border-bottom-left-radius'] = '8px'
      }
      // 最后一行，最后一个元素
      if (index === comingLen - 1) {
        result['border-bottom-right-radius'] = '8px'
      }
      if (allCol !== 0) {
        // 倒数第二行,最后一个元素
        if (typesLen + index + 1 === count * (allRow - 1)) {
          result['border-bottom-right-radius'] = '8px'
        }
      }
      return result
    },
    getComingDescStyle() {
      let result = {}
      let count = 9
      let height = 122
      let typesLen = this.types.length
      let row = Math.ceil(typesLen / count) // 支持数据源的行数
      result.top = (row + 1) * height + 'px'
      return result
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
      width: 109px;
      padding: 12px 0;
      text-align: center;
    }
    .item--disabled {
      background: rgba(0, 0, 0, 0.2);
      cursor: default;
      &:nth-of-type(1) {
        border-top-left-radius: 8px;
      }
      .img-box {
        background: inherit;
        cursor: inherit;
        &:hover {
          background: inherit;
        }
      }
    }
    .img-box {
      margin: 0 auto;
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
      //max-width: 82px;
      .content__name {
        margin: 0 auto;
        max-width: 78px;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-word;
        cursor: default;
        overflow: hidden;
        font-weight: 500;
        font-size: 12px;
        color: map-get($fontColor, dark);
      }
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
      padding-left: 0;
    }
  }
  .primaryNthChild {
    li:nth-child(6n + 1) {
      margin-left: 0;
      padding-left: 0;
    }
  }
  .coming-desc {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .coming-desc__content {
    padding: 16px 32px;
    border-radius: 4px;
    letter-spacing: 1px;
    font-weight: bold;
    font-size: 37px;
    color: rgba(0, 0, 0, 0.4);
    text-align: center;
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
