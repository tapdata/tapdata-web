<template>
  <el-drawer
    class="task-drawer"
    ref="drawer"
    :visible.sync="visible"
    :title="$t('dataForm.title')"
    size="40%"
    :withHeader="false"
    :before-close="handleClose"
  >
    <div class="task-drawer-wrap" v-loading="previewLoading">
      <!-- <div class="bar">
        <button type="button" class="el-button back-btn-icon-box el-button--default" @click="handleClose">
          <span>
            <VIcon class="back-btn-icon">arrow-right-circle</VIcon>
          </span>
        </button>
        <span class="back-btn-text">{{ $t('task_preview_title') }}</span>
      </div> -->
      <header class="header">
        <div class="tab">
          <div class="img-box">
            <img src="../../../assets/images/migrate/headImage.png" />
          </div>
          <div class="content">
            <div class="name fs-6">{{ previewData.name }}</div>
            <div class="fs-8 py-1 desc">
              {{ $t('task_details_desc') }}: <span>{{ previewData.description }}</span>
            </div>
            <div class="status">
              <!-- <img :src="getSatusImgSrc(previewData.status)" alt="" /> -->
              {{ $t('task_preview_status_' + previewData.status) }}
            </div>
          </div>
        </div>
      </header>
      <ul class="info-list">
        <li v-for="item in previewList" :key="item.label">
          <img class="label-img" :src="getImgByData(item.label)" />
          <div class="label-text">
            <div class="label">{{ $t('task_preview_' + item.label) }}:</div>
            <div
              class="value align-items-center align-middle"
              :class="{ 'align-top': item.value && item.value.length > 15 }"
            >
              {{ item.value }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'MigratePreview',
  props: {
    id: {
      required: true,
      value: String
    },
    // databaseType: {
    //   required: true,
    //   value: String
    // },
    visible: {
      required: true,
      value: String
    }
  },
  data() {
    return {
      previewData: {},
      previewList: [],
      data: {},
      name: '',
      status: '',
      progress: 0,
      showProgress: false,
      dialogTestVisible: false,
      previewLoading: false,
      userId: ''
    }
  },
  watch: {
    visible: {
      handler() {
        if (this.visible) {
          this.getData(this.id)
        }
        this.showProgress = false
      }
    }
  },
  created() {
    this.getData(this.id)
  },
  methods: {
    async getData(id) {
      this.loading = true
      this.$api('DataFlows')
        .get([id])
        .then(res => {
          if (res) {
            let previewData = []
            this.previewData = res.data
            for (let item in res.data) {
              if (item === 'setting') {
                let setting = res.data[item]
                res.data['sync_type'] = setting.sync_type
                item = 'sync_type'
              }
              if (['createUser', 'sync_type', 'id', 'createTime', 'startTime'].includes(item)) {
                if (['createTime', 'startTime'].includes(item)) {
                  res.data[item] = this.$moment(res.data[item]).format('YYYY-MM-DD HH:mm:ss')
                }
                previewData.push({ label: item, value: res.data[item] })

                // this.getSatusImgSrc(res.data.status)
              }
            }
            this.previewList = previewData
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getImgByData(data) {
      return require(`@/assets/images/migrate/${data}.png`)
    },
    getSatusImgSrc(status) {
      return require(`@/assets/icons/colorSvg/${status}.png`)
    },
    handleClose() {
      this.$emit('previewVisible', false)
    }
  }
}
</script>

<style scoped lang="scss">
.task-drawer {
  .task-drawer-wrap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
  .header {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
    border-bottom: 1px solid #eee;
  }
  .test-progress {
    width: 94.5%;
    margin: 0 10px 10px 30px;
  }
  .tab {
    display: flex;
    justify-content: flex-start;
    padding-bottom: 10px;
    padding-top: 10px;
    .img-box {
      display: flex;
      width: 20px;
      height: 20px;
      justify-content: center;
      align-items: center;
      background: #fff;
      //border: 1px solid #dedee4;
      border-radius: 3px;
      margin: 5px 20px 0 30px;
      img {
        width: 100%;
      }
    }
    .content {
      margin-left: 10px;
      font-weight: 500;
      margin-top: 4px;
      width: 100%;
      .name {
        color: #000;
        font-weight: 400;
      }
      .desc {
        color: rgba(0, 0, 0, 0.6);
        span {
          color: #000;
        }
      }
    }
    .status {
      font-size: 12px;
      padding-bottom: 2px;
      border-top-width: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }
  }
  .label-img {
    float: left;
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 15px;
    margin-top: 2px;
  }

  .schema-load {
    color: #999;
    display: inline-block;
    margin-left: 20px;
    font-size: 12px;
    font-weight: normal;
  }
  .info-list {
    flex: 1;
    overflow-y: auto;
    max-height: 690px;
    margin: 0 auto;
    padding-left: 30px;
    width: 100%;
    box-sizing: border-box;
    li {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-bottom: 10px;
      .label-text {
        width: 100%;
        margin-right: 16px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f2f2f2;
        .label {
          width: 100%;
          text-align: left;
          color: rgba(0, 0, 0, 0.6);
          font-size: 12px;
        }
        .value {
          display: inline-block;
          width: 100%;
          padding-top: 5px;
          color: #666;
          font-size: 12px;
          color: #000;
          word-break: break-all;
        }
      }
    }
  }
  .bar {
    display: block;
    width: 100%;
    height: 30px;
    background: #f5f5f5;
    border-bottom: 1px solid #dedee4;
  }
  .back-btn-icon-box {
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    line-height: 1;
    font-weight: normal;
    font-size: 14px;
    color: red;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    border: 0;
    border-radius: 0;
    box-sizing: border-box;
    background: #409eff;
    transition: 0.1s;
    -webkit-appearance: none;
    -webkit-box-sizing: border-box;
    -webkit-transition: 0.1s;
  }
  .back-btn-icon-box:hover {
    background: #6dc5e8;
  }
  .back-btn-icon {
    color: #fff;
  }
  .back-btn-text {
    padding-left: 10px;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.connection-drawer {
  .top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
    .el-drawer.rtl {
      top: 48px;
    }
  }
  .no-top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
  }
  .test-progress {
    .el-progress-bar__outer {
      border-radius: 0;
    }
    .el-progress-bar__inner {
      border-radius: 0;
    }
    margin-bottom: 10px;
  }
  .el-drawer__body {
    overflow: hidden;
  }
}
</style>
