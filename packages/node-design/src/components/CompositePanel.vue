<template>
  <div class="composite-panel flex">
    <div class="composite-panel-tabs border-end">
      <div
        v-for="(item, i) in tabItems"
        :key="i"
        class="composite-panel-tab p-3 flex justify-center align-center cursor-pointer"
        :class="{ active: activeTab === i }"
        tabindex="0"
        aria-selected="true"
        role="tab"
        @click="handleActiveTab(i)"
      >
        <ElTooltip placement="right" :content="item.title" :open-delay="300">
          <VIcon size="20">{{ item.name }}</VIcon>
        </ElTooltip>
      </div>
    </div>
    <div class="composite-panel-tabs-content h-100 border-end">
      <div class="composite-panel-tabs-header px-2 flex justify-space-between align-center border-bottom">
        <div class="composite-panel-tabs-header-title">{{ tabItems[activeTab].title }}</div>
        <div class="composite-panel-tabs-header-actions"></div>
      </div>
      <div class="composite-panel-tabs-body"></div>
    </div>
  </div>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import 'web-core/assets/icons/svg/component.svg'
import 'web-core/assets/icons/svg/outline.svg'
import 'web-core/assets/icons/svg/history.svg'

export default {
  name: 'CompositePanel',
  components: { VIcon },

  data() {
    return {
      tabItems: [
        {
          name: 'component',
          title: '组件'
        },
        {
          name: 'outline',
          title: '大纲'
        },
        {
          name: 'history',
          title: '历史记录'
        }
      ],
      activeTab: 0
    }
  },

  methods: {
    handleActiveTab(index) {
      this.activeTab = index
    }
  }
}
</script>

<style scoped lang="scss">
.composite-panel {
  width: 350px;

  &-tabs-content {
    width: 300px;
  }

  &-tabs-header {
    height: 48px;
  }

  &-tab {
    position: relative;
    width: 48px;
    height: 48px;

    &:hover {
      color: map-get($color, primary);
    }

    &.active {
      color: map-get($color, primary);
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background-color: map-get($color, primary);
      }
    }
  }
}
</style>
