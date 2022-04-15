<template>
  <div class="table-selector">
    <div class="candidate-panel selector-panel">
      <div class="selector-panel__header">
        <div class="flex-1">
          <ElCheckbox
            v-model="isCheckAll"
            :indeterminate="!isCheckAll && checked.length > 0"
            @input="checkAll"
          ></ElCheckbox>
          <span class="ml-3">{{ $t('component_table_selector_candidate_label') }}</span>
          <span class="font-color-slight ml-2">({{ checked.length }}/{{ totalTableCount }})</span>
        </div>

        <span v-if="showProgress" class="ml-2"><VIcon>loading</VIcon> {{ progress }} %</span>
        <ElLink v-else type="primary" :disabled="stateIsReadonly" @click="reload()">
          <span>{{ $t('button_reload') }}</span>
          <i class="el-icon-refresh-left ml-1"></i>
        </ElLink>
        <ConnectionTest ref="test"></ConnectionTest>
      </div>
      <div v-loading="loading" class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput
            v-model="searchKeyword"
            suffix-icon="el-icon-search"
            :placeholder="$t('common_placeholder_search_input')"
          ></ElInput>
        </div>
        <ElCheckboxGroup
          v-model="checked"
          v-show="connectionId && !loading && filteredData.length"
          class="selector-panel__list"
          @input="checkedChange"
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
    <div class="selector-center">
      <div class="selector-btns">
        <span class="btn-transfer">
          <i class="el-icon-arrow-right"></i>
        </span>
        <span class="btn-transfer mt-4">
          <i class="el-icon-arrow-left"></i>
        </span>
      </div>
    </div>
    <div class="checked-panel selector-panel">
      <div class="selector-panel__header">
        <span>{{ $t('component_table_selector_checked_label') }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-selector {
  display: flex;
  min-height: 400px;
  height: 100%;
  overflow: hidden;
}
.selector-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f2f2f2;
  border-radius: 2px;
  overflow: hidden;
}
.selector-panel__header {
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  line-height: 40px;
  color: map-get($fontColor, light);
  font-size: 14px;
}
.selector-panel__body {
  padding: 16px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.selector-panel__search {
  padding: 0 16px;
}
.selector-panel__list {
  margin-top: 16px;
  flex: 1;
}
.selector-panel__scroller {
  height: 100%;
}
.selector-panel__item {
  padding: 0 16px;
  width: 100%;
  line-height: 36px;
  &:hover {
    background-color: #f5f7fa;
  }
}
.selector-center {
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .selector-btns {
    width: 28px;
  }
  .btn-transfer {
    display: inline-block;
    margin: 0;
    padding: 0;
    min-width: 28px;
    width: 28px;
    line-height: 28px;
    border-radius: 2px;
    font-size: 14px;
    background: #f2f3f5;
    color: #333c4a;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: map-get($color, primary);
      color: #fff;
    }
  }
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
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,

      loading: false,
      isCheckAll: false,
      totalTableCount: 0,
      searchKeyword: '',
      keyProp: '',
      checked: [],
      tables: [],
      showProgress: false,
      progress: '',
      loadFieldsStatus: 'finished'
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
    checkAll(flag) {
      if (flag) {
        this.checked = this.tables
      } else {
        this.checked = []
      }
    },
    checkedChange() {
      let checked = this.checked
      if (checked.length === this.tables.length) {
        this.isCheckAll = true
      } else {
        this.isCheckAll = false
      }
    },
    getTables() {
      this.loading = true
      this.$api('MetadataInstances')
        .getTables(this.connectionId)
        .then(res => {
          let tables = res.data || []
          this.totalTableCount = tables.length
          tables = tables.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
          this.tables = tables
        })
        .finally(() => {
          this.loading = false
        })
    },
    //重新加载模型
    async reload() {
      this.$root.checkAgent(() => {
        let config = {
          title: this.$t('connection_reload_schema_confirm_title'),
          Message: this.$t('connection_reload_schema_confirm_msg')
        }
        this.$confirm(config.Message + '?', config.title, {
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.testSchema()
          }
        })
      })
    },
    //请求测试
    testSchema() {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      this.$api('connections')
        .updateById(this.sourceId, parms)
        .then(res => {
          if (this?.$refs?.test) {
            let data = res?.data
            this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
            this.$refs.test.start(data, false, true)
            this.getProgress()
          }
        })
    },
    getProgress() {
      this.$api('connections')
        .getNoSchema(this.sourceId)
        .then(res => {
          let data = res?.data
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              this.getTables() //更新schema
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            setTimeout(() => {
              if (this?.$refs?.test) {
                this.getProgress()
              }
            }, 1000)
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection_reload_schema_fail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    }
  }
}
</script>
