<template>
  <Drawer
    v-loading="loading"
    class="shared-cache-details"
    :visible.sync="visible"
    v-bind="$attrs"
    @visible="handleVisible"
  >
    <div v-if="details.id" class="shared-cache-details--header flex pb-3"></div>
  </Drawer>
</template>

<script>
import { Drawer } from '@tap/component'

export default {
  name: 'Details',

  components: { Drawer },

  data() {
    return {
      loading: false,
      visible: false,
      details: {
        id: '',
        name: '',
        cacheKeysArr: [],
        fields: []
      },
      info: []
    }
  },

  methods: {
    getData(id) {
      this.visible = true
    },
    handleVisible() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: $fontBaseTitle;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: $fontBaseTitle;
      color: map-get($fontColor, dark);
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: map-get($bgColor, normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: map-get($bgColor, white);
  }
}
</style>
