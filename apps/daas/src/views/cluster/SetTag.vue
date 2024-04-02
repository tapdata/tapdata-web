<template>
  <el-dialog
    :title="$t('dataExplorer_tag_title')"
    :visible="visible"
    width="600px"
    :close-on-click-modal="false"
    @closed="$emit('closed')"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-wrap gap-2 mb-2 rounded-lg p-3" style="background-color: #f5f6f7">
      <template v-if="tagList.length">
        <el-tag closable disable-transitions v-for="tagId in tagList" :key="tagId" @close="handleCloseTag(tagId)">{{
          tagMap[tagId]
        }}</el-tag>
      </template>
      <div v-else class="mx-auto">请选择标签</div>
    </div>

    <ElTree
      node-key="groupId"
      :props="treeProps"
      :expand-on-click-node="false"
      :data="tagData"
      ref="tree"
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
    <span slot="footer" class="dialog-footer">
      <el-button class="message-button-cancel" @click="$emit('update:visible', false)" size="mini">{{
        $t('public_button_cancel')
      }}</el-button>
      <el-button type="primary" @click="handleAdd" size="mini">{{ $t('public_button_save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'SetTag',
  props: {
    visible: Boolean,
    tagData: Array,
    treeProps: Object,
    tagMap: Object,
    tagList: Array
  },
  methods: {
    handleCheckChange(data, isCheck) {
      // this.tagList = this.tagList || []
      // if (this.tagList.length > 0) {
      //   this.tagList.map((k, index) => {
      //     if (k.id === data.id) {
      //       this.tagList.splice(index, 1)
      //     }
      //   })
      // }
      // let node = {
      //   id: data.id,
      //   value: data.value
      // }
      // this.tagList.push(node)
      const index = this.tagList.indexOf(data.groupId)

      if (isCheck) {
        index < 0 && this.tagList.push(data.groupId)
      } else {
        this.tagList.splice(index, 1)
      }

      // if (~index) {
      //   this.tagList.splice(index, 1)
      // } else {
      //   this.tagList.push(data.groupId)
      // }
    },
    handleAdd() {},
    handleCancel() {},
    handleCloseTag(id) {
      this.$refs.tree.setChecked(id, false)
      /*const index = this.tagList.indexOf(id)
      if (~index) {
        this.tagList.splice(index, 1)
      }*/
    }
  }
}
</script>

<style lang="scss" scoped></style>
