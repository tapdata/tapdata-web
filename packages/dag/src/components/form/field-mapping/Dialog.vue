<script>
import List from './List.vue'

export default {
  name: 'Dialog',
  components: { List },
  props: ['visible'],
  emits: ['update:visible'],
  data() {
    return {
      dialogVisible: false,
      loadingSave: false,
    }
  },
  methods: {
    save() {
      this.loadingSave = true
      this.$refs.fieldMappingList.save(true)
    },
    updateVisible() {
      this.loadingSave = false
      this.$emit('update:visible', false)
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
  },
}
</script>

<template>
  <el-dialog
    :title="$t('packages_form_field_mapping_dialog_bianjituiyanjie')"
    :model-value="visible"
    width="70%"
    append-to-body
    class="field-mapping-table-dialog"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <List
      v-if="visible"
      ref="fieldMappingList"
      :read-only="false"
      @update-visible="updateVisible"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog()">{{
          $t('packages_form_field_mapping_dialog_quxiao')
        }}</el-button>
        <el-button type="primary" :loading="loadingSave" @click="save(true)">{{
          $t('packages_form_field_mapping_dialog_queding')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.field-mapping-table-dialog) {
  .table-box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .table-form {
      width: 56%;
      .el-form-item {
        margin-bottom: 12px;
      }
      .tip {
        padding-left: 40px;
      }
    }
    .table-example {
      width: 36%;
      h3 {
        padding-bottom: 20px;
      }
      p {
        padding-bottom: 10px;
      }
    }
  }
}
</style>
