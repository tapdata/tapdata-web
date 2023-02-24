<template>
  <el-dialog
    :title="$t('packages_form_field_mapping_dialog_bianjituiyanjie')"
    :model-value="visible"
    width="70%"
    append-to-body
    custom-class="field-mapping-table-dialog"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <List v-if="visible" ref="fieldMappingList" :readOnly="false" @updateVisible="updateVisible"></List>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog()">{{ $t('packages_form_field_mapping_dialog_quxiao') }}</el-button>
        <el-button type="primary" :loading="loadingSave" @click="save(true)">{{
          $t('packages_form_field_mapping_dialog_queding')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import List from './List'

export default {
  name: 'Dialog',
  components: { List },
  props: ['visible'],
  data() {
    return {
      dialogVisible: false,
      loadingSave: false
    }
  },
  methods: {
    save() {
      this.loadingSave = true
      this.$refs.fieldMappingList.save(true)
    },
    updateVisible() {
      this.loadingSave = false
      $emit(this, 'update:visible', false)
    },
    closeDialog() {
      $emit(this, 'update:visible', false)
    }
  },
  emits: ['update:visible']
}
</script>

<style lang="scss" scoped>
::v-deep {
  .field-mapping-table-dialog {
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
}
</style>
