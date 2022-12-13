<template>
  <div class="field-checkbox">
    <div class="field-checkbox__header mb-4">
      <!--      <ElSelect v-model="type">-->
      <!--        <ElOption label="全部" value="all"></ElOption>-->
      <!--        <ElOption label="未勾选" value="false"></ElOption>-->
      <!--        <ElOption label="已勾选" value="true"></ElOption>-->
      <!--      </ElSelect>-->
      <ElInput
        class="search-input"
        v-model="keyword"
        prefix-icon="el-icon-search"
        placeholder="请输入字段名"
        clearable
      ></ElInput>
    </div>
    <div v-loading="loading" class="field-checkbox__main">
      <div class="list-table__header flex justify-content-between">
        <span>字段</span>
        <ElButton type="text" class="ml-4 color-primary" @click="handleAdd">
          <VIcon> plus</VIcon>
          添加行
        </ElButton>
      </div>
      <div class="list-table__content">
        <div
          v-for="(item, index) in getFilterList()"
          :key="index"
          class="list-table__line flex mt-3 align-items-center"
        >
          <span class="px-2">{{ index + 1 }}</span>
          <ElSelect v-model="item.source" filterable allow-create class="flex-fill" @change="handleChange">
            <ElOption v-for="op in sourceItems" :key="op + 'source'" :label="op" :value="op"></ElOption>
          </ElSelect>
          <ElSelect v-model="item.target" filterable allow-create class="flex-fill ml-5" @change="handleChange">
            <ElOption v-for="op in targetItems" :key="op + 'target'" :label="op" :value="op"></ElOption>
          </ElSelect>
          <ElButton type="text" class="mx-2 px-2 color-primary" @click="handleDelete(index)">
            <VIcon> delete</VIcon>
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'FieldList',

  props: {
    options: {
      type: Object,
      default: () => {
        return {
          sourceId: '',
          targetId: '',
          sourceTable: '',
          targetTable: ''
        }
      }
    },
    data: {
      type: Object,
      default: () => {
        return {
          source: [],
          target: []
        }
      }
    }
  },

  data() {
    return {
      type: 'all',
      keyword: '',
      loading: false,
      list: [],
      sourceItems: [],
      targetItems: []
    }
  },

  mounted() {
    this.loadFields()
  },

  methods: {
    loadList() {
      const { source, target } = this.data
      const { sourceItems, targetItems } = this

      const loadData = !!source?.length
      let sourceList = loadData ? cloneDeep(source) : cloneDeep(sourceItems)
      let targetList = loadData ? cloneDeep(target) : cloneDeep(targetItems)

      this.list = sourceList.map((t, i) => {
        return {
          source: t,
          target: targetList[i]
        }
      })
    },

    getItem() {
      return {
        source: '',
        target: ''
      }
    },

    handleChange() {
      this.$emit('change', this.list)
    },

    handleDelete(index) {
      this.list.splice(index, 1)
      this.handleChange()
    },

    handleAdd() {
      this.list.unshift(this.getItem())
      this.handleChange()
    },

    loadFields() {
      const { sourceId, targetId, sourceTable, targetTable } = this.options
      if (!sourceId || !targetId) return
      const sourceParams = {
        where: {
          meta_type: 'table',
          sourceType: 'SOURCE',
          original_name: sourceTable,
          'source._id': sourceId
        },
        limit: 1
      }
      const targetParams = {
        where: {
          meta_type: 'table',
          sourceType: 'SOURCE',
          original_name: targetTable,
          'source._id': targetId
        },
        limit: 1
      }

      this.loading = true
      metadataInstancesApi
        .tapTables({
          filter: JSON.stringify(sourceParams)
        })
        .then(sourceItems => {
          this.sourceItems = Object.values(sourceItems.items[0]?.nameFieldMap || {}).map(t => t.fieldName)
          metadataInstancesApi
            .tapTables({
              filter: JSON.stringify(targetParams)
            })
            .then(targetItems => {
              this.targetItems = Object.values(targetItems.items[0]?.nameFieldMap || {}).map(t => t.fieldName)
            })
            .finally(() => {
              this.loadList()
              this.loading = false
            })
        })
        .catch(() => {
          this.loadList()
          this.loading = false
        })
    },

    getFilterList() {
      const { keyword } = this
      return this.list.filter(t => (t.source + t.target).includes(keyword))
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  width: 350px;
}
.list-table__content {
  height: 200px;
  overflow-y: auto;
}
.list-table__header {
  padding-left: 40px;
  padding-right: 16px;
  line-height: 32px;
  background: #dfdfdf;
}
</style>
