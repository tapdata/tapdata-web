<template>
  <ElDialog
    width="600px"
    custom-class="import-upload-dialog"
    :title="$t('modules_dialog_import_title')"
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
  >
    <ElForm ref="form" :model="importForm" class="applications-form" label-width="100px">
      <ElFormItem :label="$t('modules_dialog_condition') + ':'">
        <el-radio v-model="importForm.upsert" :label="1">{{ $t('modules_dialog_overwrite_data') }}</el-radio>
        <el-radio v-model="importForm.upsert" :label="0">{{ $t('modules_dialog_skip_data') }}</el-radio>
      </ElFormItem>
      <ElFormItem :label="$t('modules_dialog_group') + ':'">
        <ElSelect v-model="importForm.tag" multiple size="mini" class="w-75">
          <ElOption v-for="item in classifyList" :label="item.value" :value="item.id" :key="item.id"></ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('modules_dialog_file') + ':'">
        <ElUpload
          class="upload-demo"
          ref="upload"
          :action="importForm.action"
          :accept="importForm.accept"
          :file-list="importForm.fileList"
          :auto-upload="false"
          :on-success="handleSuccess"
          :on-change="handleChange"
        >
          <ElLink type="primary" plain slot="trigger" size="mini">
            <VIcon class="mr-1 link-primary">upload</VIcon>
            {{ $t('modules_dialog_upload_files') }}</ElLink
          >
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <span slot="footer" class="dialog-footer">
      <ElButton @click="handleClose" size="mini">{{ $t('button_cancel') }}</ElButton>
      <ElButton type="primary" @click="submitUpload()" size="mini">{{ $t('button_confirm') }}</ElButton>
    </span>
  </ElDialog>
</template>
<script>
import Cookie from '@tap/shared/src/cookie'
import VIcon from '@/components/VIcon'
export default {
  name: 'Upload',
  components: {
    VIcon
  },
  props: {
    type: {
      required: true,
      value: String
    }
  },
  data() {
    return {
      dialogVisible: false,
      classifyList: [],
      downType: '',
      importForm: {
        tag: [],
        fileList: [],
        action: '',
        upsert: 1,
        accept: '.gz'
      }
    }
  },
  created() {
    if (this.type === 'api') {
      this.downType = 'APIServer'
    } else if (this.type === 'Inspect') {
      this.downType = 'Inspect'
    } else {
      this.downType = 'dataflow'
    }
    this.accessToken = Cookie.get('token')
    this.getClassify()
  },
  methods: {
    show() {
      this.dialogVisible = true
    },

    // 上传文件成功失败钩子
    handleChange(file) {
      this.importForm.fileList = [file]
      if (this.type === 'api') {
        this.importForm.action =
          window.location.origin +
          window.location.pathname +
          'api/MetadataInstances/upload?upsert=' +
          this.importForm.upsert +
          '&listtags=' +
          encodeURIComponent(JSON.stringify(this.importForm.tag)) +
          `&type=${this.downType}` +
          `&access_token=${this.accessToken}`
      } else {
        this.importForm.action =
          window.location.origin +
          window.location.pathname +
          `api/Task/batch/import?listtags=${encodeURIComponent(JSON.stringify(this.importForm.tag))}&access_token=` +
          this.accessToken
      }
    },

    // 获取分类
    getClassify() {
      let filter = {
        where: { or: [{ item_type: this.classifyType }] }
      }
      this.$api('MetadataDefinitions')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res) {
            this.classifyList = res?.items || []
          }
        })
    },

    handleSuccess(response) {
      if (response.code === '110500' || response.code === '110401') {
        this.$message.error(this.$t('message_upload_fail'))
      } else {
        this.$message.success(this.$t('message_upload_success'))
      }
    },

    // 上传保存
    submitUpload() {
      this.dialogVisible = false
      this.$refs.upload.submit()
    },

    handleClose() {
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
    }
  }
}
</script>
<style lang="scss">
.import-upload-dialog {
  .upload-demo {
    .el-upload-list {
      .el-upload-list__item.is-success {
        .el-icon-close {
          display: none;
        }
      }
      .el-upload-list__item-name {
        &:hover {
          color: map-get($color, primary);
        }
        i {
          font-size: 18px;
          color: map-get($color, primary);
        }
      }
      .el-upload-list__item-status-label {
        right: 50px;
        top: 7px;
      }
      .el-upload-list__item:hover {
        background-color: initial;
      }
      .el-icon-close:hover {
        color: map-get($color, primary);
      }
      .el-icon-close:before {
        content: '';
      }
    }
  }
}
</style>
