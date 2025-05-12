<script>
import { modulesApi } from '@tap/api'
import ApiForm from '@tap/business/src/views/data-server/Drawer.vue'
import i18n from '@tap/i18n'

import { generateId } from '@tap/shared'
import axios from 'axios'
import { cloneDeep } from 'lodash-es'
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'

export default {
  name: 'CreateRestApi',
  components: { ApiForm },
  props: {
    host: String,
    value: Boolean,
    params: Object,
  },
  data() {
    return {
      loading: false,
      visible: this.value,
    }
  },
  watch: {
    value(v) {
      this.visible = v
      if (v) {
        this.open()
      }
    },
  },
  methods: {
    open() {
      const basePath =
        Math.floor(Math.random() * 26 + 10).toString(36) + generateId(10) // 首位要求小写字母
      const formData = {
        status: 'pending',
        basePath,
        path: `/api/${basePath}`,
        connectionName: this.params.from.name,
        connectionType: this.params.from.database_type,
        connectionId: this.params.from.id,
        tableName: this.params.tableName,
        pathAccessMethod: this.data?.pathAccessMethod || 'default',
        appValue: this.params.to?.id || '',
        appLabel: this.params.to?.value || '',
      }
      this.$nextTick(() => {
        this.$refs.apiForm.open(formData)
      })
    },
    // 保存，新建和修改
    handleSave() {
      this.$refs.apiForm.save()
    },
    handleVisible(v) {
      this.$emit('update:value', v)
    },
    async onSaved(data) {
      data.status = 'pending'
      this.loading = true
      data = await modulesApi.patch(data)
      data.status = 'active'
      data = await modulesApi.patch(data)
      this.loading = false
      this.handleVisible(false)
      this.$emit('save', data, this.params.to)
    },
  },
}
</script>

<template>
  <ElDialog
    v-model="visible"
    custom-class="t-dialog"
    width="600"
    :close-on-click-modal="false"
    @update:model-value="handleVisible"
  >
    <template #header>
      <span class="fs-6 fw-sub font-color-dark">
        {{ $t('packages_business_chuangjianfuwu') }}
      </span>
    </template>

    <ApiForm
      ref="apiForm"
      tag="div"
      class="pb-0"
      :params="params"
      :host="host"
      in-dialog
      @update:loading="loading = $event"
      @save="onSaved"
    />

    <template #footer>
      <div>
        <el-button @click="handleVisible(false)">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button type="primary" @click="handleSave()">{{
          $t('public_button_save')
        }}</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.t-dialog.el-dialog {
  position: absolute;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 64px);
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto !important;
  overflow: hidden;
  .el-dialog__header {
    padding: 24px !important;
  }
  .el-dialog__body {
    padding: 0 24px !important;
    margin-bottom: 24px;
    overflow-y: auto;
  }
  .el-dialog__footer {
    padding: 0 24px 24px !important;
  }
}
</style>
