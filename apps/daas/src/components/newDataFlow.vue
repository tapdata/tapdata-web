<template>
  <ElDialog
    width="700px"
    class="simple-scene"
    :visible="dialogVisible"
    :title="$t('new_advanced_mode')"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div class="create">
      <!-- <div class="model">{{ $t('new_advanced_mode') }}</div> -->
      <ElRow :gutter="20" v-readonlybtn="'Data_SYNC_menu'">
        <ElCol :span="12" class="create-col" v-readonlybtn="'SYNC_job_creation'">
          <div class="create-col-box copy-bg" @click="goNew">
            <div class="flex align-items-center">
              <img src="../assets/images/new/Console_icon_new_data_replication.svg" alt="" />
            </div>

            <div class="pl-4">
              <div class="fs-7 pb-4 font-color-dark fw-sub">{{ $t('new_data_copy') }}</div>
              <div class="fs-8 desc">
                {{ $t('new_data_copy_desc') }}
              </div>
            </div>
            <div>
              <img src="../assets/images/new/Console_icon_arrow1.svg" alt="" />
            </div>
          </div>
        </ElCol>
        <ElCol :span="12" class="create-col" v-readonlybtn="'SYNC_job_creation'">
          <div class="create-col-box development-bg" @click="goNewCust">
            <div class="flex align-items-center">
              <img src="../assets/images/new/Console_icon_new_data_development.svg" alt="" />
            </div>
            <div class="pl-4">
              <div class="fs-7 pb-4 font-color-dark fw-sub">{{ $t('new_data_development') }}</div>
              <div class="fs-8 desc">{{ $t('new_data_development_desc') }}</div>
            </div>
            <div>
              <img src="../assets/images/new/Console_icon_arrow2.svg" alt="" />
            </div>
          </div>
        </ElCol>
      </ElRow>
      <div class="pt-5 fs-7 pb-4 font-color-dark fw-sub">{{ $t('new_more_features') }}</div>
      <ElRow
        :gutter="20"
        v-show="
          ($has('datasource_menu') && $has('datasource_creation')) ||
          ($has('API_management_menu') && $has('API_creation'))
        "
      >
        <ElCol
          :span="12"
          class="more-col"
          v-if="$has('datasource_menu') && $has('datasource_creation')"
          :style="{ minHeight: lang === 'en' ? '190px' : '120px' }"
        >
          <div class="more-col-box p-4" @click="handleConnection">
            <div class="fs-7 pb-4 font-color-dark">
              <div class="flex align-items-center flex-row">
                <img src="../assets/images/new/Console_icon_data_source.svg" alt="" />
                <span class="pl-2 fw-sub">{{ $t('new_create_connection') }}</span>
              </div>
            </div>
            <div class="fs-8 desc" :style="{ minHeight: lang === 'en' ? '120px' : '70px' }">
              <!-- <ElTooltip effect="dark" :content="$t('new_create_connection_desc')" placement="bottom"> -->
              {{ $t('new_create_connection_desc') }}
              <!-- </ElTooltip> -->
            </div>
          </div>
        </ElCol>
        <ElCol
          :span="12"
          class="more-col"
          v-if="$has('API_management_menu') && $has('API_creation')"
          :style="{ minHeight: lang === 'en' ? '190px' : '120px' }"
        >
          <div class="more-col-box p-4" @click="handleModules">
            <div class="fs-7 pb-4 font-color-dark">
              <div class="flex align-items-center flex-row">
                <img src="../assets/images/new/Console_icon_api-fill.svg" alt="" />
                <span class="pl-2 fw-sub">{{ $t('new_create_api') }}</span>
              </div>
            </div>
            <div class="fs-8 desc" :style="{ minHeight: lang === 'en' ? '120px' : '70px' }">
              {{ $t('new_create_api_desc') }}
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>
    <DatabaseTypeDialog
      :dialogVisible="dialogDatabaseTypeVisible"
      @dialogVisible="handleDialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
  </ElDialog>
</template>

<script>
import DatabaseTypeDialog from '@tap/business/src/views/connections/DatabaseTypeDialog'
import { getCurrentLanguage } from '@tap/i18n/src/shared/util'

export default {
  name: 'newDataFlow',
  components: { DatabaseTypeDialog },

  props: {
    dialogVisible: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      dialogDatabaseTypeVisible: false,
      lang: getCurrentLanguage(),
      whiteList: [
        'mysql',
        'oracle',
        'mongodb',
        'sqlserver',
        'postgres',
        'elasticsearch',
        'redis',
        'file',
        'db2',
        'kafka',
        'mariadb',
        'mysql pxc',
        // 'jira',
        'dameng',
        'hive',
        'gbase-8s',
        'sybase ase',
        'gaussdb200',
        'dummy db',
        'rest api',
        'custom_connection',
        'gridfs',
        'mq',
        'tcp_udp',
        'greenplum',
        'tidb',
        'hana',
        'clickhouse',
        'kundb',
        'adb_postgres',
        'adb_mysql',
        'hazelcast_cloud_cluster'
      ] //目前白名单,
    }
  },

  methods: {
    handleClose() {
      this.$emit('update:dialogVisible', false)
    },
    goNew() {
      let routeUrl = this.$router.resolve({
        name: 'MigrateCreate'
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },
    goNewCust() {
      let routeUrl = this.$router.resolve({
        name: 'DataflowNew'
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },
    // 跳转数据源
    handleConnection() {
      this.dialogDatabaseTypeVisible = true
      this.handleClose()
      // let routeUrl = this.$router.resolve({
      // 	path: '/connections?noviceGuide=true'
      // });
      // window.open(routeUrl.href, '_blank');
      // this.handleClose();
    },

    //跳转发布api
    handleModules() {
      let routeUrl = this.$router.resolve({
        name: 'dataServer'
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },

    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(item) {
      this.handleDialogDatabaseTypeVisible()
      const { pdkHash } = item
      let query = { pdkHash }
      this.$router.push({
        name: 'connectionCreate',
        query
      })
    }
  }
}
</script>

<style scoped lang="scss">
$color: map-get($fontColor, slight);
.simple-scene {
  .create {
    .create-col {
      .create-col-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 16px 16px 16px 24px;
        cursor: pointer;
        border-radius: 4px;
        .desc {
          color: rgba(0, 0, 0, 0.43);
          word-break: break-word;
        }
      }
    }
    .more-col {
      .more-col-box {
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #f3f3f3;
        .desc {
          min-height: 90px;
          word-break: break-word;
          color: rgba(0, 0, 0, 0.43);
        }
      }
    }
  }
  .copy-bg {
    background-color: rgba(213, 236, 255, 0.6);
  }
  .development-bg {
    background-color: rgba(194, 245, 255, 0.3);
  }
}
</style>
<style lang="scss">
.simple-scene {
  .el-dialog__title {
    color: map-get($fontColor, dark);
  }
  .el-dialog__body {
    min-height: 240px;
  }
}
</style>
