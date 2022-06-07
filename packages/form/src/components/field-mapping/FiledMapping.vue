<template>
  <section>
    <ElLink type="primary" class="position-absolute" style="right: 10px; top: 41px" @click.stop="dialogVisible = true">
      {{ $t('button_edit') }}
    </ElLink>
    <List :isMetaData="true" :readOnly="true"></List>
    <Dialog v-if="dialogVisible" :visible.sync="dialogVisible"></Dialog>
  </section>
</template>

<script>
import List from './List'
import Dialog from './Dialog'

export default {
  name: 'FieldMapping',
  components: { List, Dialog },
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>
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
    border-color: map-get($color, primary);
    background-color: map-get($color, disable);
  }
}
</style>
