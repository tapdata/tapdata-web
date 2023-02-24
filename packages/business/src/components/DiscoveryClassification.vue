<template>
  <div class="classification" :class="{ expand: isExpand }">
    <div class="classification-header pl-0">
      <div class="search-box">
        <ElInput size="mini" v-model:value="filterText">
          <template v-slot:suffix>
            <span class="el-input__icon h-100 ml-1">
              <VIcon size="14">search</VIcon>
            </span>
          </template>
        </ElInput>
      </div>
    </div>
    <ClassificationTree
      v-bind="$attrs"
      class="tree-block pr-3"
      v-loading="loadingTree"
    />
  </div>
</template>

<script>
import { VIcon } from '@tap/component'

import ClassificationTree from './ClassificationTree.vue'

export default {
  components: { ClassificationTree, VIcon },
  data() {
    return {
      searchFalg: false,
      isExpand: true,
      filterText: '',
      treeData: [],
      default_expanded: false,
      expandedKeys: [],
      loadingTree: false,
      props: {
        key: 'id',
        label: 'name',
      },
      isActive: true,

      dialogConfig: {
        type: 'add',
        id: '',
        gid: '',
        label: '',
        title: '',
        itemType: 'resource',
        desc: '',
        visible: false,
      },

      nodeName: '',
      parent_id: '',
      title: '',
      iconMap: {
        table: 'table',
        defaultApi: 'apiServer_navbar',
      },
    }
  },
}
</script>

<style lang="scss" scoped>
$nodeH: 28px;
.classification {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 20px; /*// height: 22px;*/
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: map-get($bgColor, white);
  border-radius: 3px; /*// overflow: hidden;*/ /*// box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);*/
  .btn-expand {
    // padding: 2px 3px;
    // color: map-get($fontColor, light);
    transform: rotate(0);
    box-sizing: border-box;
    // background: #eff1f4;
    border: 0;
  }
  .no-expand {
    position: absolute;
    left: 18px;
    top: 4px;
  }
  .toggle {
    margin-top: 16px;
    // color: map-get($color, lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 12px 0 20px 0;
    // border-right: 1px solid map-get($borderColor, light);
    .btn-expand {
      position: absolute;
      top: 0;
      left: 19px;
      transform: rotate(180deg);
      .icon {
        font-size: 16px;
      }
    }

    .btn-addIcon {
      position: absolute;
      top: 2px;
      right: 12px;
      font-size: 12px;
      color: map-get($fontColor, light);
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: map-get($fontColor, light);
        font-size: 16px;
        height: 66%;
        margin-top: 0px;
        border-top-width: 1px;
        border-radius: 3px;
        cursor: pointer;
        &:hover {
          color: map-get($color, primary);
        }
      }
    }
    .btn-query {
      position: absolute;
      right: 54px;
      .icon-fangdajing {
        font-size: 16px;
        color: map-get($fontColor, light);
        &:hover {
          color: map-get($color, primary);
        }
      }
    }
  }

  /*头部样式*/
  .classification-header {
    position: relative;
    padding: 0 12px;
    // background: map-get($bgColor, normal);
    // border-bottom: 1px solid #dedee4;
    font-size: 12px;
    line-height: 31px;
    display: flex;
    width: 214px;
    flex-direction: column;
    .title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 14px;
      justify-content: space-between;
      color: map-get($fontColor, dark);
      // background-color: #eff1f4;
    }

    .search-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3px;
    }
  }
  .tree-block {
    position: relative;
    width: 100%;
    flex: 1;
    //padding: 0 10px;
    overflow: auto;
  }

  .create {
    padding: 5px 10px;
    font-size: 12px;
    // color: map-get($color, primary);
    cursor: pointer;
  }
}
</style>
