<script>
import { updateAgent } from '@tap/api'

export default {
  name: 'SetTag',
  props: {
    visible: Boolean,
    tagData: Array,
    treeProps: Object,
    tagMap: Object,
    tagList: Array,
    selection: Array,
  },
  data() {
    return {
      saving: false,
    }
  },
  methods: {
    handleCheckChange(data, isCheck) {
      const index = this.tagList.indexOf(data.groupId)

      if (isCheck) {
        index === -1 && this.tagList.push(data.groupId)
      } else {
        this.tagList.splice(index, 1)
      }
    },
    onOpen() {
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.tagList)
      })
    },
    onClosed() {
      this.$refs.tree.setCheckedKeys([])
      this.$emit('closed')
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleCloseTag(id) {
      this.$refs.tree.setChecked(id, false)
    },
    async handleSave() {
      this.saving = true
      await updateAgent({
        agentId: this.selection,
        groupId: this.tagList,
      }).finally(() => (this.saving = false))
      this.$message.success(this.$t('public_message_save_ok'))
      this.handleClose()
      this.$emit('saved')
    },
  },
}
</script>

<template>
  <el-dialog
    :title="$t('dataExplorer_tag_title')"
    :model-value="visible"
    width="600px"
    :close-on-click-modal="false"
    @open="onOpen"
    @closed="onClosed"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div
      class="flex flex-wrap gap-2 mb-2 rounded-lg p-3"
      style="background-color: #f5f6f7"
    >
      <template v-if="tagList.length">
        <el-tag
          v-for="tagId in tagList"
          :key="tagId"
          closable
          disable-transitions
          @close="handleCloseTag(tagId)"
          >{{ tagMap[tagId] }}</el-tag
        >
      </template>
      <div v-else class="mx-auto">请选择标签</div>
    </div>

    <ElTree
      ref="tree"
      node-key="groupId"
      :props="treeProps"
      :expand-on-click-node="false"
      :data="tagData"
      check-strictly
      show-checkbox
      check-on-click-node
      @check-change="handleCheckChange"
    >
      <template #default="{ data }">
        <span class="flex align-center">
          <VIcon size="14" class="color-primary mr-1">folder-fill</VIcon>
          <span class="table-label">{{ data.name }}</span>
        </span>
      </template>
    </ElTree>

    <template #footer>
      <el-button class="message-button-cancel" @click="handleClose">{{
        $t('public_button_cancel')
      }}</el-button>
      <el-button :disabled="saving" type="primary" @click="handleSave">{{
        $t('public_button_save')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
