<script>
import Form from './Form.vue'

export default {
  name: 'Editor',
  components: { Form },
  emits: ['success'],
  data() {
    return {
      visible: false,
      taskId: '',
      loading: false,
    }
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.$refs.form?.init()
      })
    },

    open(id) {
      this.taskId = id
      this.init()
      this.visible = true
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      this.$refs.form.submit()
    },

    handleSuccess() {
      this.$emit('success')
      this.handleClose()
    },
  },
}
</script>

<template>
  <ElDialog
    :title="
      taskId
        ? $t('packages_business_shared_cache_edit')
        : $t('packages_business_shared_cache_create')
    "
    :model-value="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="1200px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <Form
      ref="form"
      v-model:loading="loading"
      :task-id="taskId"
      @success="handleSuccess"
    />
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton :loading="loading" type="primary" @click="handleSave">{{
          $t('public_button_save')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>
