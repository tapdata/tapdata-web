<template>
  <section>
    <ElButton
      size="mini"
      plain
      class="btn-refresh position-absolute"
      style="right: 145px; top: 41px"
      @click.stop="dialogVisible = true"
    >
      <VIcon class="text-primary">edit-outline</VIcon>
    </ElButton>
    <List :isMetaData="true" :readOnly="true"></List>
    <Dialog v-if="dialogVisible" :visible.sync="dialogVisible"></Dialog>
  </section>
</template>

<script>
import List from './List'
import Dialog from './Dialog'
import VIcon from 'web-core/components/VIcon'

export default {
  name: 'FieldMapping',
  components: { List, Dialog, VIcon },
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
