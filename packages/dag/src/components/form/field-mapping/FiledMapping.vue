<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import Dialog from './Dialog.vue'
import List from './List.vue'

defineOptions({ name: 'FieldMapping' })

const dataflowStore = useDataflowStore()

const dialogVisible = ref(false)
const updateList = ref(false)

watch(dialogVisible, (val) => {
  updateList.value = !val
})
</script>

<template>
  <section>
    <ElLink
      type="primary"
      class="position-absolute"
      style="right: 10px; top: 41px"
      :disabled="dataflowStore.stateIsReadonly"
      @click.stop="dialogVisible = true"
    >
      {{ $t('public_button_edit') }}
    </ElLink>
    <List :is-meta-data="true" :read-only="true" :update-list="updateList" />
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
