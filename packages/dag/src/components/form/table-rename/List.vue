<script lang="jsx">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const InnerInput = {
  name: 'InnerInput',
  props: ['value', 'readOnly'],
  data() {
    return {
      val: null,
    }
  },
  watch: {
    value(val) {
      this.val = val
    },
  },
  created() {
    this.val = this.value
  },
  emits: ['change'],
  render() {
    return (
      <input
        class="name-list-item-input px-2 rounded-4"
        readOnly={this.readOnly}
        value={this.val}
        onChange={(ev) => this.$emit('change', ev)}
      />
    )
  },
}

export default {
  name: 'List',
  components: { RecycleScroller, InnerInput },
  props: [
    'nameMap',
    'tableData',
    'updateName',
    'emitChange',
    'disabled',
    'countByName',
    'globalNameMap',
  ],
  emits: ['change', 'update:value'],
  methods: {
    handleChange(name, event) {
      const val = event.target.value
      if (val) {
        if (
          (this.tableData.includes(val) &&
            (!this.nameMap[val] || this.nameMap[val] === val)) ||
          Object.values(this.nameMap).includes(val)
        ) {
          event.target.value = this.nameMap[name] || name
          return
        }
        this.updateName(val, name)
        this.emitChange()
      } else {
        event.target.value = name
        if (this.nameMap[name]) {
          delete this.nameMap
          this.emitChange()
        }
      }
    },
  },
}
</script>

<template>
  <RecycleScroller v-bind="$attrs">
    <template #default="{ item: name }">
      <div class="name-list-item flex align-center position-relative">
        <div class="flex-1 px-4 text-truncate">
          <span :title="name">{{ name }}</span>
        </div>
        <div class="flex-1 px-4 text-truncate">
          <InnerInput
            :name-map="nameMap"
            :read-only="disabled"
            :value="nameMap[name] || globalNameMap[name] || name"
            :class="{
              'color-primary': !!nameMap[name] || !!globalNameMap[name],
              'color-danger border-danger':
                ((tableData.includes(nameMap[name]) ||
                  tableData.includes(globalNameMap[name])) &&
                  !nameMap[nameMap[name]]) ||
                countByName[nameMap[name] || name] > 1,
            }"
            @change="handleChange(name, $event)"
          />
          <!--<input
                  class="name-list-item-input px-2"
                  :readOnly="disabled"
                  :value="nameMap[name] || name"
                  @change="handleChange"
                />-->
        </div>
        <VIcon size="12" class="name-list-item-center font-color-light">
          left
        </VIcon>
      </div>
    </template>
  </RecycleScroller>
</template>
