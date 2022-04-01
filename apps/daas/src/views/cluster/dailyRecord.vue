<template>
  <section class="clusterManagement-wrap">
    <TablePage ref="table" row-key="id" class="clusterManagement-list" :remoteMethod="getDataApi">
      <div class="header" slot="header">
        <div class="page-header-title">
          <span class="title">{{ $t('cluster.statusLog') }}</span>
          <div class="serviceCluMangeBtn" @click="goClusterManagement">
            {{ $t('cluster.serviceCluMange') }}
          </div>
        </div>
      </div>
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-date-picker
              type="daterange"
              size="mini"
              range-separator="-"
              :start-placeholder="$t('cluster.selectDate')"
              :end-placeholder="$t('cluster.selectDate')"
              :value="[searchParams.startDate, searchParams.closeDate]"
              @change="handleChangeDate"
            ></el-date-picker>
          </li>
          <li>
            <el-select
              v-model="searchParams.ip"
              size="mini"
              :placeholder="$t('cluster.placeholderSelect')"
              @input="table.fetch(1)"
            >
              <el-option v-for="item in ipList" :label="item.value" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </li>
          <li>
            <el-select
              v-model="searchParams.serverType"
              size="mini"
              :placeholder="$t('cluster.placeholderSelect')"
              @input="table.fetch(1)"
            >
              <el-option
                v-for="item in serverTypeList"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              ></el-option>
            </el-select>
          </li>
          <li>
            <el-select
              v-model="searchParams.level"
              size="mini"
              :placeholder="$t('cluster.placeholderSelect')"
              @input="table.fetch(1)"
            >
              <el-option
                v-for="item in levelList"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              ></el-option>
            </el-select>
          </li>
          <li>
            <el-button type="text" class="restBtn" size="mini" @click="rest()">
              {{ $t('button.reset') }}
            </el-button>
          </li>
        </ul>
      </div>
      <el-table-column
        prop="last_updated"
        :label="$t('cluster.time')"
        :formatter="dateFormat"
        width="260"
      ></el-table-column>
      <el-table-column prop="hostname" :label="$t('cluster.hostName')" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ip" :label="$t('cluster.ipAddress')" width="150"></el-table-column>
      <el-table-column prop="uuid" :label="$t('cluster.uniqueEncode')" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="threadName" :label="$t('cluster.serviceType')" width="100"></el-table-column>
      <el-table-column prop="level" :label="$t('cluster.level')" width="100">
        <template slot-scope="scope">
          <span :class="scope.row.level === 'ERROR' ? 'red' : ''" disable-transitions>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" :label="$t('cluster.logs')" :show-overflow-tooltip="true"></el-table-column>
    </TablePage>
  </section>
</template>
<script>
import TablePage from '@/components/TablePage'
let timeout = null
export default {
  components: { TablePage },
  data() {
    return {
      searchParams: {
        startDate: '',
        closeDate: '',
        level: '',
        serverType: '',
        ip: ''
      },
      tableData: [],
      levelList: [
        { label: 'INFO', value: 'INFO' },
        { label: 'WARN', value: 'WARN' },
        { label: 'ERROR', value: 'ERROR' }
      ],
      serverTypeList: [
        { label: 'engine', value: 'engine' },
        { label: 'management', value: 'management' },
        { label: 'apiServer', value: 'apiServer' },
        { label: 'tapdataAgent', value: 'tapdataAgent' }
      ],
      ipList: []
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
    this.getIpFn()
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    // 获取ip
    getIpFn() {
      this.$api('cluster')
        .get()
        .then(res => {
          if (res.data.items) {
            res.data.items.forEach(item => {
              this.ipList.push({ value: item.systemInfo.ip })
            })
          }
        })
    },
    // 获取数据
    getDataApi({ page }) {
      let { current, size } = page
      let { startDate, closeDate, level, serverType, ip } = this.searchParams
      let where = {}
      startDate && (where['date.gt'] = startDate)
      closeDate && (where['date.lt'] = closeDate)
      level && (where.level = level)
      serverType && (where.threadName = serverType)
      ip && (where.level = ip)
      where.loggerName = 'tapdataAgent'
      let filter = {
        order: 'last_updated DESC',
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return this.$api('logs')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res.data.total || 0,
            data: res.data?.items || []
          }
        })
    },
    rest() {
      this.searchParams = {
        startDate: '',
        closeDate: '',
        level: '',
        serverType: '',
        ip: ''
      }
      this.table.fetch(1)
    },
    handleChangeDate(times) {
      this.form.timing.start = times[0]
      this.form.timing.end = times[1]
      this.table.fetch(1)
    },
    dateFormat(row, column) {
      const daterc = row[column.property]
      if (daterc != null) {
        const dateMat = new Date(daterc)
        const year = dateMat.getFullYear()
        const month = dateMat.getMonth() + 1
        const day = dateMat.getDate()
        const hh = dateMat.getHours()
        const mm = dateMat.getMinutes()
        const ss = dateMat.getSeconds()
        const timeFormat =
          year +
          '-' +
          (month < 10 ? '0' + month : month) +
          '-' +
          (day < 10 ? '0' + day : day) +
          ' ' +
          (hh < 10 ? '0' + hh : hh) +
          ':' +
          (mm < 10 ? '0' + mm : mm) +
          ':' +
          (ss < 10 ? '0' + ss : ss)
        return timeFormat
      }
    },
    //运行日志
    goClusterManagement() {
      this.$router.push({
        name: 'clusterManagement'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.clusterManagement-wrap {
  height: 100%;
  .clusterManagement-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
  }
  .title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }
  .serviceCluMangeBtn {
    font-size: 14px;
    color: #409eff;
    cursor: pointer;
    float: right;
    font-weight: normal;
  }
}
</style>
