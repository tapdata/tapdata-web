<template>
  <ElDialog
    width="600px"
    custom-class="import-upload-dialog"
    :title="$t('packages_business_modules_dialog_import_title')"
    :close-on-click-modal="false"
    v-model:visible="dialogVisible"
    :before-close="handleClose"
  >
    <ElForm ref="form" :model="importForm" class="applications-form" label-width="100px">
      <ElFormItem :label="$t('packages_business_modules_dialog_condition') + ':'">
        <el-radio v-model="importForm.upsert" :label="1">{{
          $t('packages_business_modules_dialog_overwrite_data')
        }}</el-radio>
        <el-radio v-model="importForm.upsert" :label="0">{{
          $t('packages_business_modules_dialog_skip_data')
        }}</el-radio>
      </ElFormItem>
      <ElFormItem :label="$t('packages_business_modules_dialog_group') + ':'">
        <ElSelect v-model:value="importForm.tag" multiple size="mini" class="w-75">
          <ElOption v-for="item in classifyList" :label="item.value" :value="item.id" :key="item.id"></ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('packages_business_modules_dialog_file') + ':'">
        <ElUpload
          class="w-75"
          ref="upload"
          :action="importForm.action"
          :accept="importForm.accept"
          :file-list="importForm.fileList"
          :auto-upload="false"
          :on-success="handleSuccess"
          :on-change="handleChange"
          :on-remove="handleRemove"
        >
          <template v-slot:trigger>
            <ElLink class="align-top" type="primary" plain size="mini">
              <VIcon class="mr-1 link-primary">upload</VIcon>
              {{ $t('packages_business_modules_dialog_upload_files') }}</ElLink
            >
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <template v-slot:footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose" size="mini">{{ $t('packages_business_button_cancel') }}</ElButton>
        <ElButton type="primary" @click="submitUpload()" size="mini">{{
          $t('packages_business_button_confirm')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import Cookie from '@tap/shared/src/cookie'
import { VIcon } from '@tap/component'
import { metadataDefinitionsApi } from '@tap/api'
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
    this.accessToken = Cookie.get('access_token')
    this.getClassify()
  },
  methods: {
    show() {
      this.dialogVisible = true
    },

    // 上传文件成功失败钩子
    handleChange(file) {
      /*if (!file.name.endsWith('.json.gz')) {
      this.$message.warning('请选择名称以[.json.gz]结尾的文件')
      this.$refs.upload.clearFiles()
      return
    }*/
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
          this.accessToken +
          `&cover=${!!this.importForm.upsert}`
      }
    },

    // 获取分类
    getClassify() {
      let filter = {
        where: { or: [{ item_type: this.type }] }
      }
      metadataDefinitionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.classifyList = data?.items || []
        })
    },

    handleSuccess(response) {
      if (response.code !== 'ok') {
        this.$message.error(response.message || this.$t('packages_business_message_upload_fail'))
      } else {
        this.$message.success(this.$t('packages_business_message_upload_success'))
        $emit(this, 'success')
      }
      this.$refs.upload.clearFiles()
    },

    // 上传保存
    submitUpload() {
      if (this.importForm.fileList?.length === 0) {
        this.$message.error(this.$t('packages_business_message_upload_msg'))
        return
      }
      this.dialogVisible = false
      this.$refs.upload.submit()
    },
    //删除文件
    handleRemove(file, fileList) {
      this.importForm.fileList = fileList
    },

    handleClose() {
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
    }
  },
  emits: ['success']
}
</script>

<style lang="scss">
.import-upload-dialog {
  .el-upload-list {
    .el-upload-list__item {
      line-height: 28px;
      background-color: map-get($bgColor, disable);
      &:hover {
        background-color: map-get($bgColor, disable);
      }
      &.is-success {
        .el-icon-close {
          display: none;
        }
      }
    }
    .el-upload-list__item-name {
      margin-right: 28px;
      background-color: unset;
    }
    .el-upload-list__item-name {
      &:hover {
        color: map-get($color, primary);
      }
      i {
        color: map-get($color, primary);
      }
    }
    .el-icon-upload-success {
      vertical-align: middle;
    }
    .el-icon-close {
      top: 7px;
      &:hover {
        color: map-get($color, primary);
      }
    }
  }
}
</style>
