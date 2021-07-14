import VIcon from '@/components/VIcon'

export const FormLabel = {
  render() {
    return (
      <div class="e-label">
        <label class="el-form-item__label">{this.$t('editor.cell.link.copySourceDatabase')}</label>
        <el-popover
          class="align-middle lh-1"
          placement="top-start"
          width="400"
          trigger="hover"
          scopedSlots={{
            reference: () => <VIcon color="#999">tishi</VIcon>
          }}
        >
          <span>{this.$t('editor.cell.link.formTip')}</span>
        </el-popover>
      </div>
    )
  }
}
