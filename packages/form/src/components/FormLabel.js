import { VIcon } from '@tap/component'

export const FormLabel = {
  render() {
    return (
      <div class="e-label">
        <label class="el-form-item__label">{this.$t('editor_cell_link_copySourceDatabase')}</label>
        <el-popover
          class="align-middle lh-1"
          placement="top-start"
          width="400"
          trigger="hover"
          scopedSlots={{
            reference: () => <VIcon color="#999">tishi</VIcon>
          }}
        >
          <span>{this.$t('editor_cell_link_formTip')}</span>
        </el-popover>
      </div>
    )
  }
}
