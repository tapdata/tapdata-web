<template>
  <div class="database">
    <ul class="flex mb-4">
      <li
        v-for="item in tabs"
        :key="item.value"
        :class="[
          { 'bg-primary text-white': active === item.value },
          { 'bg-color-main text-main': active !== item.value }
        ]"
        class="mr-4 py-1 px-4 rounded-2 cursor-pointer"
        @click="handleTab(item)"
      >
        {{ item.label }}
      </li>
    </ul>
    <div v-if="active === 'formal'">
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in types"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
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
      <div class="mt-5 mb-3">
        <VIcon class="color-primary mr-2" size="14">info</VIcon>
        <span class="fs-8 font-color-light">试用版暂不支持以下数据源 更多请使用正式</span>
      </div>
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li v-for="item in comingTypes" :key="item.type" class="database-item float-start mb-4">
          <div class="img-box bg-color-disable opacity-25 rounded-3">
            <ElImage :src="$util.getConnectionTypeDialogImg(item.type)" />
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-slight">{{ item.name }}</div>
          </ElTooltip>
        </li>
      </ul>
    </div>
    <div v-else-if="active === 'beta'">
      <div class="my-4 fs-8">
        注意：Beta版主要来自开源社区的贡献，TapaData对其做了基本的测试，使用过程中可能会出现错误，如有问题可联系技术支持
      </div>
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in types"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
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
    </div>
    <div v-else>
      <div class="my-database__desc my-4 p-2 font-color-light fs-8">
        <div>注意：这里是您自己上传的数据源插件，如果要用于生产任务，请在GitHub上提交源代码</div>
        <div>交由TapaData进行全面的质量测试，以保证插件的稳定性和质量</div>
      </div>
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in types"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
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
    </div>
  </div>
</template>

<script>
import { getConnectionIcon } from '../views/connections/util'
import { VIcon } from '@tap/component'

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
      active: 'formal',
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
        { name: 'Custom connection', type: 'custom_connection' },
        { name: 'REST API', type: 'rest api' },
        { name: 'Dummy', type: 'dummy' },
        { name: 'GridFS', type: 'gridfs' },
        { name: 'Kafka', type: 'kafka' },
        { name: 'MariaDB', type: 'mariadb' },
        { name: 'MySQL PXC', type: 'mysql pxc' },
        { name: 'jira', type: 'jira' },
        { name: 'DM DB', type: 'dameng' },
        { name: 'Hive', type: 'hive' },
        { name: 'TCP/IP', type: 'tcp_udp' },
        // { name: 'MQ', type: 'mq' },
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
      ],
      tabs: [
        {
          label: '正式版',
          value: 'formal'
        },
        {
          label: 'Beta版',
          value: 'beta'
        },
        {
          label: '我的数据源',
          value: 'my'
        }
      ]
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

    handleTab(item) {
      this.active = item.value
    }
  }
}
</script>

<style lang="scss" scoped>
.database {
  width: 804px;
  overflow: auto;
}
.database-item {
  width: 80px;
  flex: 1;
  margin-right: 40px;
  &:nth-child(7n) {
    margin-right: 0;
  }
  &:hover {
    .img-box {
      background: rgba(0, 0, 0, 0.2);
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
}
.my-database__desc {
  background: #f2f2f2;
}
</style>
