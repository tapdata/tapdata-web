<template>
  <aside
    v-show="node || connection"
    v-resize.left="{
      minWidth: 500,
      maxWidth: 800
    }"
    class="layout-sidebar --right border-start"
  >
    <component
      v-if="node || connection"
      :is="componentName"
      @deselectConnection="$emit('deselectConnection')"
    />
  </aside>
</template>

<script>
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import { nodeComs } from '@/nodes/loader'
import { mapGetters } from 'vuex'

export default {
  name: 'RightSidebar',

  directives: {
    resize
  },

  data() {
    return {}
  },

  components: { ...nodeComs },

  computed: {
    ...mapGetters('dataflow', {
      node: 'activeNode',
      connection: 'activeConnection'
    }),

    componentName() {
      if (this.node) {
        return this.node.type + 'Attribute'
      } else if (this.connection) {
        return 'databaseLinkAttribute'
      }
      return null
    }

    /*node() {
      return this.$store.getters.activeNode
    }*/
  }
}
</script>

<style lang="scss">
.layout-sidebar {
  .attr-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    &-header {
      display: flex;
      align-items: center;
      width: 100%;
      height: 24px;
      line-height: 24px;
      background-color: #f1f1f1;

      .header-icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        text-align: center;
        background-color: var(--primary);
        cursor: pointer;
        color: #fff;
      }

      .header-txt {
        font-size: 12px;
      }
    }

    &-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 20px;
      height: 0;

      .e-form {
        .addTxt {
          float: right;
          display: inline-block;
          height: 30px;
          line-height: 30px;
          font-size: 12px;
          color: #48b6e2;
        }

        .el-form-item {
          margin-bottom: 10px;
        }

        .el-form-item__label {
          line-height: 30px;
          padding: 0;
          font-size: 12px;
        }

        .el-form-item__content {
          width: 100%;
          line-height: 30px;

          .el-select {
            width: 100%;
          }

          .el-input__inner {
            width: 100%;
            height: 30px;
            line-height: 30px;
          }

          .el-input__inner::-webkit-input-placeholder {
            font-size: 12px;
          }

          .el-textarea__inner {
            font-size: 12px;
          }

          .el-input__icon {
            line-height: 30px;
          }
        }
      }
    }
  }
}
</style>
