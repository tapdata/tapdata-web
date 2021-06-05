<template>
  <el-dialog
    :title="$t('dataFlow.createNew')"
    :visible="dialogVisible"
    width="60%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="simple-scene"
  >
    <div class="creat">
      <ul class="item" v-readonlybtn="'Data_SYNC_menu'">
        <li
          v-if="$window.getSettingByKey('SHOW_SIMPLE_SCENE')"
          @click="db2db"
          v-readonlybtn="'SYNC_job_creation'"
        >
          <span class="model">{{ $t('dataFlow.guidingMode') }}</span>
          <div class="content">
            <i class="iconfont icon-shujukuqianyi2"></i>
            <span>
              <span class="tag">{{ $t('dataFlow.databseMigrationHead') }}</span>
              {{ $t('dataFlow.databseMigration') }}</span
            >
          </div>
        </li>
        <li @click="goNew" v-readonlybtn="'SYNC_job_creation'">
          <span class="model">{{ $t('dataFlow.advancedMode') }}</span>
          <div class="content">
            <i class="iconfont icon-shujukuqianyi2"></i>
            <span>
              <span class="tag">{{ $t('dataFlow.databseFreedomHead') }}</span>
              {{ $t('dataFlow.databseFreedom') }}</span
            >
          </div>
        </li>
        <li
          class="marTop25"
          @click="goNewCust"
          v-readonlybtn="'SYNC_job_creation'"
        >
          <div class="content">
            <i class="iconfont icon-renwubianpai2"></i>
            <span>
              <span class="tag">{{ $t('dataFlow.dataMigrationHead') }}</span>
              {{ $t('dataFlow.dataFreedom') }}</span
            >
          </div>
        </li>
      </ul>
      <ul
        class="item more"
        v-show="
          ($has('datasource_menu') && $has('datasource_creation')) ||
          ($has('API_management_menu') && $has('API_creation')) ||
          ($has('Data_verify_menu') && $has('verify_job_creation'))
        "
      >
        <li
          @click="handleConnection"
          v-if="$has('datasource_menu') && $has('datasource_creation')"
        >
          <span class="model">{{ $t('dataFlow.moreFeatures') }}</span>
          <div class="content">
            <i class="iconfont icon-database"></i>
            <span>
              <span class="tag">{{ $t('dataFlow.creatSource') }}</span>
              {{ $t('dataFlow.sourceDescription') }}</span
            >
          </div>
        </li>
        <template v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')">
          <li
            class="marTop25"
            @click="handleModules"
            v-if="$has('API_management_menu') && $has('API_creation')"
          >
            <div class="content">
              <i class="iconfont icon-api2"></i>
              <span>
                <span class="tag">{{ $t('dataFlow.creatApi') }}</span>
                {{ $t('dataFlow.apiDescription') }}</span
              >
            </div>
          </li>
          <li
            class="marTop25"
            @click="handleDataVerification"
            v-if="$has('Data_verify_menu') && $has('verify_job_creation')"
          >
            <div class="content">
              <i class="iconfont icon-hechabidui-copy"></i>
              <span>
                <span class="tag">{{ $t('dataFlow.dataValidation') }}</span>
                {{ $t('dataFlow.datavaliDescription') }}</span
              >
            </div>
          </li>
        </template>
      </ul>
      <div style="clear: both"></div>
    </div>
    <DatabaseTypeDialog
      :dialogVisible="dialogDatabaseTypeVisible"
      @dialogVisible="handleDialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
  </el-dialog>
</template>

<script>
import DatabaseTypeDialog from '@/views/connections/DatabaseTypeDialog'
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
        'jira'
      ] //目前白名单,
    }
  },

  methods: {
    handleClose() {
      this.$emit('update:dialogVisible', false)
    },
    db2db() {
      let routeUrl = this.$router.resolve({
        path: '/job',
        query: { isSimple: true, mapping: 'cluster-clone' }
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },
    goNew() {
      let routeUrl = this.$router.resolve({
        path: '/job',
        query: { mapping: 'cluster-clone' }
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },
    goNewCust() {
      let routeUrl = this.$router.resolve({
        path: '/job',
        query: { mapping: 'custom' }
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
        path: '/module'
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },

    // 跳转数据校验
    handleDataVerification() {
      let routeUrl = this.$router.resolve({
        name: 'dataVerificationCreate'
      })
      window.open(routeUrl.href, '_blank')
      this.handleClose()
    },

    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(type) {
      this.handleDialogDatabaseTypeVisible()
      if (this.whiteList.includes(type)) {
        this.$router.push('connections/create?databaseType=' + type)
      } else {
        top.location.href = '/#/connection'
        localStorage.setItem('connectionDatabaseType', type)
      }
    }
  }
}
</script>

<style scoped lang="scss">
$color: #999999;
.item {
  font-size: 12px;
  overflow: hidden;
  li {
    float: left;
    width: 32%;
    box-sizing: border-box;
    overflow: hidden;
  }
  li.marTop25 {
    margin-top: 25px;
  }
  .model {
    display: block;
    color: $color;
    margin-bottom: 10px;
    margin-left: 20px;
  }
  li {
    .content {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      line-height: 24px;
      margin-right: 15px;
      color: #999;
      cursor: pointer;
      word-break: break-word;
      box-sizing: border-box;
      overflow: hidden;
      border: 1px solid #fff;
      &:hover {
        background: rgba(250, 250, 250, 1);
        border: 1px solid rgba(222, 222, 228, 1);
        box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.21);
        border-radius: 5px;
      }
      .iconfont {
        display: inline-block;
        font-size: 30px;
        margin-right: 10px;
        color: #409eff;
      }
      .tag {
        display: block;
        font-size: 16px;
        color: #409eff;
        font-weight: 400;
        margin-bottom: 10px;
      }
    }
  }
}
.more {
  margin-top: 20px;
}
</style>
<style lang="scss">
.simple-scene {
  .el-dialog__body {
    min-height: 240px;
    padding: 30px 90px;
  }
}
</style>
