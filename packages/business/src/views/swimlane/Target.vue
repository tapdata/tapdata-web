<template>
  <div class="p-4 flex-fill min-h-0 overflow-auto">
    <div v-for="(item, index) in list" :key="index" class="wrap__item rounded-2 mb-4">
      <div class="item__header flex p-4">
        <NodeIcon :node="item" :size="20" class="item__icon mt-1 rounded-circle" />
        <div class="flex-fill ml-2">
          <div class="flex justify-content-between">
            <span class="font-color-normal fw-sub fs-6">{{ item.name }}</span>
            <span class="operation-line">
              <VIcon size="16">copy</VIcon>
              <VIcon size="18" class="ml-3">setting</VIcon>
            </span>
          </div>
          <div class="mt-2 font-color-light">Sync data to SelectDB for analytics</div>
        </div>
      </div>
      <div class="item__content py-2 px-4">
        <span class="font-color-sslight">No tasks configured for this target</span>
      </div>
    </div>
  </div>
</template>

<script>
import { connectionsApi } from '@tap/api'
import NodeIcon from '@tap/dag/src/components/NodeIcon'

export default {
  name: 'Target',

  components: { NodeIcon },

  data() {
    return {
      list: []
    }
  },

  created() {
    this.init()
  },

  methods: {
    async init() {
      this.list = await this.getData()
    },

    async getData() {
      let filter = {
        limit: 999,
        where: {
          connection_type: {
            in: ['source_and_target', 'target']
          }
        }
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      return res.items.map(t => {
        const { id, status, name, pdkHash } = t
        return {
          id,
          status,
          name,
          pdkHash
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap__item {
  border: 1px solid #e1e3e9;
}
.item__header {
  border-bottom: 1px solid #e1e3e9;
}
.item__icon {
  //border: 1px solid #4e5969;
}
.operation-line {
  min-width: 50px;
}
</style>
