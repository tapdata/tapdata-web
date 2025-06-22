<script>
import Dialog from './Dialog.vue'
import List from './List.vue'

export default {
  name: 'FieldMapping',
  components: { List, Dialog },
  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      dialogVisible: false,
      updateList: false,
    }
  },
  watch: {
    dialogVisible() {
      this.updateList = !this.dialogVisible
    },
  },
}
</script>

<template>
  <section>
    <ElLink
      type="primary"
      class="position-absolute"
      style="right: 10px; top: 41px"
      :disabled="stateIsReadonly"
      @click.stop="dialogVisible = true"
    >
      {{ $t('public_button_edit') }}
    </ElLink>
    <List
      ref="list"
      :is-meta-data="true"
      :read-only="true"
      :update-list="updateList"
    />
    <Dialog v-if="dialogVisible" v-model:visible="dialogVisible" />
  </section>
</template>

<style lang="scss" scoped>
.btn-refresh {
  padding: 0;
  height: 28px;
  line-height: 27px;
  width: 27px;
  min-width: 27px;
  font-size: 15px;
  &:hover,
  &.is-plain:focus:hover {
    border-color: var(--color-primary);
    background-color: var(--color-disable);
  }
}
</style>
