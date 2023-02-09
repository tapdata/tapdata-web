<template>
  <div class="database">
    <ElTabs v-model="active">
      <ElTabPane v-for="item in tabs" :key="item.value" :name="item.value" :label="item.label"></ElTabPane>
    </ElTabs>
    <ul v-loading="loading" class="database-ul overflow-auto">
      <li
        v-for="(item, index) in filterList"
        :key="index"
        class="database-item float-start mb-4 cursor-pointer"
        :class="{ active: item.pdkId === selected.pdkId }"
        @click="handleSelect(item)"
      >
        <div class="img-box rounded-3">
          <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
          <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
        </div>
        <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
          <div class="ellipsis text-center font-color-normal">{{ item.name }}</div>
        </ElTooltip>
      </li>
    </ul>
    <div class="text-end">
      <ElButton type="primary" @click="handleSumbit">CONFIGURE</ElButton>
    </div>
  </div>
</template>

<script>
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import { VIcon } from '@tap/component'
import { cloneDeep } from 'lodash'

export default {
  name: 'ConnectionTypeSelector',
  components: { VIcon },
  props: {
    types: {
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
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      active: '',
      selected: {},
      comingTypes: [
        { name: 'MongoDB', type: 'mongodb' },
        { name: 'MySQL', type: 'mysql' },
        { name: 'Oracle', type: 'oracle' },
        { name: 'Elasticsearch', type: 'elasticsearch' },
        { name: 'Redis', type: 'redis' },
        { name: 'PostgreSQL', type: 'postgres' },
        { name: 'SQL Server', type: 'sqlserver' },
        // { name: 'GBase 8s', type: 'gbase-8s' },
        { name: 'Sybase ASE', type: 'sybase ase' },
        { name: 'GaussDB200', type: 'gaussdb200' },
        { name: 'IBM Db2', type: 'db2' },
        { name: 'Memory Cache', type: 'mem_cache' },
        { name: 'KunDB', type: 'kundb' },
        { name: 'Custom connection', type: 'custom' },
        { name: 'REST API', type: 'rest api' },
        { name: 'Dummy', type: 'dummy' },
        { name: 'GridFS', type: 'gridfs' },
        { name: 'Kafka', type: 'kafka' },
        { name: 'MariaDB', type: 'mariadb' },
        { name: 'MySQL PXC', type: 'mysql pxc' },
        { name: 'jira', type: 'jira' },
        { name: 'DM DB', type: 'dameng' },
        { name: 'hive1', type: 'hive1' },
        { name: 'TCP/IP', type: 'tcp_udp' },
        // { name: 'MQ', type: 'mq' },
        { name: 'HBase', type: 'hbase' },
        { name: 'KUDU', type: 'kudu' },
        { name: 'Greenplum', type: 'greenplum' },
        { name: 'TiDB', type: 'tidb' },
        { name: 'SAP HANA', type: 'hana' },
        { name: 'ClickHouse', type: 'clickhouse' },
        { name: 'ADB MySQL', type: 'adb_mysql' },
        { name: 'ADB PostgreSQL', type: 'adb_postgres' },
        { name: 'Hazelcast Cloud', type: 'hazelcast_cloud_cluster' }
      ],
      tabs: [
        {
          label: 'All Connectors',
          value: 'All_Connectors'
        },
        {
          label: 'SaaS Connectors',
          value: 'SaaS_Connectors'
        },
        {
          label: 'Application Connectors',
          value: 'Application_Connectors'
        },
        {
          label: 'Databases Connectors',
          value: 'Databases_Connectors'
        },
        {
          label: 'File Connectors',
          value: 'File_Connectors'
        },
        {
          label: 'My Connectors',
          value: 'My_Connectors'
        }
      ]
    }
  },
  computed: {
    publicList() {
      return this.types.filter(t => t.scope === 'public' && !t.beta)
    },
    betaList() {
      return this.types.filter(t => t.scope === 'public' && t.beta)
    },
    customerList() {
      return this.types.filter(t => t.scope === 'customer')
    },
    filterList() {
      const { active, types } = this
      console.log('filterList', active)
      let list = cloneDeep(types)
      switch (active) {
        case 'All_Connectors':
          break
        case 'SaaS_Connectors':
          list = types.filter(t => t.scope === 'public' && t.beta)
          break
        case 'Application_Connectors':
          break
        case 'Databases_Connectors':
          break
        case 'File_Connectors':
          list = types.filter(t => !['CSV', 'EXCEL', 'JSON', 'XML'].includes(t.database_type))
          break
        case 'My_Connectors':
          list = types.filter(t => t.scope === 'customer')
          break
        default:
          list = types
      }
      return list
    }
  },
  watch: {
    types: {
      deep: true,
      handler() {
        this.getComingTypes()
      }
    }
  },
  created() {
    this.active = this.tabs[0].value
  },
  mounted() {
    this.getComingTypes()
  },
  methods: {
    getPdkIcon(item) {
      return getConnectionIcon(item.pdkHash)
    },

    getComingTypes() {
      this.comingTypes = this.comingTypes.filter(f => !this.types.some(t => t.pdkId === f.type))
    },

    handleSelect(item) {
      this.selected = item
    },

    handleSumbit() {
      this.$emit('select', this.selected)
    }
  }
}
</script>

<style lang="scss" scoped>
.database {
  overflow: auto;
}
.database-item {
  width: 80px;
  flex: 1;
  margin-right: 40px;
  &:nth-child(7n) {
    margin-right: 0;
  }
  &.active,
  &:hover {
    .img-box {
      background: rgba(201, 205, 212, 0.3);
    }
  }
  &.disable {
    .img-box {
      background-color: rgba(242, 242, 242, 0.2);
    }
  }
}
.img-box {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f2f2f2;
}
.el-image {
  width: 50px;
  text-align: center;
}
.my-database__desc {
  background: #f2f2f2;
}
::v-deep {
  .el-tabs__nav-wrap.is-top {
    padding: 0;
  }
}
</style>
