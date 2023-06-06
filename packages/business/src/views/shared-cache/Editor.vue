<template>
  <ElDialog
    :title="taskId ? $t('packages_business_shared_cache_edit') : $t('packages_business_shared_cache_create')"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="1200px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <Form ref="form" :task-id="taskId" :loading.sync="loading" class="mt-n6" @success="handleSuccess"></Form>
    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton :loading="loading" size="mini" type="primary" @click="handleSave">{{
        $t('public_button_save')
      }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import Form from './Form'

export default {
  name: 'Editor',

  components: { Form },

  data() {
    return {
      visible: false,
      taskId: '',
      loading: false
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
    }
  }
}
</script>
