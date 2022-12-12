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
        @input="searchFnc"
      ></ElInput>
    </div>
    <div v-loading="loading" class="field-checkbox__main">
      <div class="list-table__header flex justify-content-between">
        <span>字段</span>
        <ElButton type="text" class="ml-4 color-primary" @click="handleAdd(index)">
          <VIcon> plus</VIcon>
          添加行
        </ElButton>
      </div>
      <div class="list-table__content">
        <div v-for="(item, index) in list" :key="index" class="list-table__line flex mt-3 align-items-center">
          <span class="px-2">{{ index + 1 }}</span>
          <ElSelect v-model="item.source" filterable allow-create class="flex-fill" @change="handleChange">
            <ElOption v-for="op in sourceData" :key="op + 'source'" :label="op" :value="op"></ElOption>
          </ElSelect>
          <ElSelect v-model="item.target" filterable allow-create class="flex-fill ml-5" @change="handleChange">
            <ElOption v-for="op in targetData" :key="op + 'target'" :label="op" :value="op"></ElOption>
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
import { debounce } from 'lodash'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'FieldList',

  props: {
    options: {
      type: Object,
      default: () => {
        return {
          source: [],
          target: []
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
      list: []
    }
  },

  computed: {
    sourceData() {
      return this.options.source.map(t => t.field_name)
    },

    targetData() {
      return this.options.target.map(t => t.field_name)
    }
  },

  mounted() {
    this.loadList()
  },

  methods: {
    searchFnc: debounce(function () {
      console.log('searchFnc')
    }, 100),

    loadList() {
      const { source, target } = this.data
      const { sourceData, targetData } = this
      const haveData = source.length > 0
      let list = sourceData.map((t, i) => {
        // let flag = true
        // if (haveData && !source.includes(t)) {
        //   flag = false
        // }
        return {
          // checkbox: flag,
          // originSource: t,
          source: t,
          // originTarget: targetData[i],
          target: targetData[i]
        }
      })
      this.list = list
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
