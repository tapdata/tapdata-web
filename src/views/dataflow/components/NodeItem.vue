<template>
  <div class="node-item-wrap">
    <div class="node-item">
      <div class="node-icon">
        <ElImage draggable="false" :src="`static/editor/${data.icon}.svg`"></ElImage>
      </div>
      <div class="node-content">
        <div class="node-title text-truncate">{{ data.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NodeItem',

  props: {
    data: Object
  },

  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.node-item-wrap {
  cursor: pointer;

  &:hover {
    background-color: var(--primary-hover-l);
  }

  &:last-child .node-item {
    border-bottom: 0;
  }

  .node-item {
    display: flex;
    align-items: center;
    padding: 11px 8px 11px 0;
    margin-left: 15px;
    margin-right: 12px;
    border-bottom: 1px solid #dbdfe7;

    .node-icon {
      width: 26px;
      height: 26px;
      margin-right: 12px;
      flex-shrink: 0;

      .el-image {
        width: 100%;
        height: 100%;
      }
    }

    .node-content {
      flex: 1 1;
      overflow: hidden;
    }

    .node-title {
      font-weight: 500;
      font-size: 12px;
      line-height: 18px;
      margin-right: 5px;
    }

    .node-desc {
      margin-top: 2px;
      font-size: 11px;
      line-height: 16px;
      font-weight: 400;
      color: #7d7d87;
    }
  }
}
</style>
