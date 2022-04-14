<template>
  <div class="table-selector">
    <div class="candidate-panel selector-panel">
      <div class="selector-panel__header">
        <div>
          <ElCheckbox></ElCheckbox>
          <span>待复制表</span>
          <span>(1/100)</span>
        </div>
        <ElLink type="primary">
          <span>重新加载</span>
          <i class="el-icon-refresh-left"></i>
        </ElLink>
      </div>
      <div v-loading="loading" class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput placeholder="请输入搜索内容..." suffix-icon="el-icon-search" v-model="searchKeyword"></ElInput>
        </div>
        <ElCheckboxGroup
          v-model="checked"
          v-show="connectionId && !loading && filteredData.length"
          class="selector-panel__list"
        >
          <RecycleScroller
            ref="scroller"
            class="selector-panel__scroller"
            :item-size="36"
            :buffer="50"
            :items="filteredData"
          >
            <template #default="{ item }">
              <ElCheckbox class="selector-panel__item" :label="item" :key="item">
                <span>{{ item }}</span>
              </ElCheckbox>
            </template>
          </RecycleScroller>
        </ElCheckboxGroup>
      </div>
    </div>
    <div class="checked-panel selector-panel">
      <div class="selector-panel__header"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-selector {
  display: flex;
  min-height: 400px;
  overflow: hidden;
}
.selector-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.selector-panel__header {
  display: flex;
  align-items: center;
}
.selector-panel__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.selector-panel__list {
  flex: 1;
}
.selector-panel__scroller {
  height: 100%;
}
.selector-panel__item {
  line-height: 36px;
}
</style>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'

export default {
  components: { RecycleScroller },
  props: {
    connectionId: String
  },
  data() {
    return {
      loading: false,
      searchKeyword: '',
      keyProp: '',
      checked: [],
      tables: []
    }
  },
  computed: {
    filteredData() {
      let reg = new RegExp(this.searchKeyword, 'i')
      return this.tables.filter(item => reg.test(item))
    }
  },
  created() {
    let id = this.connectionId
    if (id) {
      this.getTables()
    }
  },
  methods: {
    getTables() {
      this.loading = true
      this.$api('MetadataInstances')
        .getTables(this.connectionId)
        .then(res => {
          let tables = res.data || []
          tables = tables.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
          this.tables = tables
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
