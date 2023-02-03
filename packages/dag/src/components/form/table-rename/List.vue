<template>
  <RecycleScroller v-bind="$attrs">
    <template v-slot="{ item: name }">
      <div class="name-list-item flex align-center position-relative">
        <div class="flex-1 px-4 text-truncate">
          <span :title="name">{{ name }}</span>
        </div>
        <div
          class="flex-1 px-4 text-truncate"
          :class="{
            'color-primary': !!nameMap[name]
          }"
        >
          <InnerInput
            :nameMap="nameMap"
            :readOnly="disabled"
            :value="nameMap[name] || name"
            @change="handleChange(name, $event)"
          ></InnerInput>
          <!--<input
            class="name-list-item-input px-2"
            :readOnly="disabled"
            :value="nameMap[name] || name"
            @change="handleChange"
          />-->
        </div>
        <VIcon size="12" class="name-list-item-center font-color-light"> left </VIcon>
      </div>
    </template>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const InnerInput = {
  /*template: `
    <input
      class="name-list-item-input px-2"
      :readOnly="readOnly"
      :value="val"
      @change="$emit('change')"
    />
  `,*/
  name: 'InnerInput',
  props: ['value', 'readOnly', 'nameMap'],
  data() {
    return {
      val: null
    }
  },
  watch: {
    value(val) {
      this.val = val
      console.log('watch:value', this.value) // eslint-disable-line
    }
  },
  created() {
    this.val = this.value
  },
  render() {
    return (
      <input
        class="name-list-item-input px-2"
        readOnly={this.readOnly}
        value={this.val}
        onChange={ev => this.$emit('change', ev)}
      />
    )
  }
}

export default {
  name: 'List',
  props: ['nameMap', 'tableData', 'updateName', 'emitChange', 'disabled'],
  components: { RecycleScroller, InnerInput },
  methods: {
    handleChange(name, event) {
      const val = event.target.value
      console.log('this.nameMap', this.nameMap) // eslint-disable-line
      if (val) {
        if (this.tableData.includes(val) || Object.values(this.nameMap).includes(val)) {
          event.target.value = this.nameMap[name] || name
          return
        }
        this.updateName(val, name)
        this.emitChange()
      } else {
        event.target.value = name
        if (this.nameMap[name]) {
          this.$delete(this.nameMap, name)
          this.emitChange()
        }
      }
    }
  }
}
</script>
