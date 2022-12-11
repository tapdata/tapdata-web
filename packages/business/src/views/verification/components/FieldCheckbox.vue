<template>
  <div class="field-checkbox">
    <div class="field-checkbox__header flex">
      <ElSelect v-model="type">
        <ElOption label="全部" value="all"></ElOption>
        <ElOption label="未勾选" value="false"></ElOption>
        <ElOption label="已勾选" value="true"></ElOption>
      </ElSelect>
      <ElInput
        class="search-input ml-4"
        v-model="keyword"
        prefix-icon="el-icon-search"
        placeholder="请输入字段名"
        size="mini"
        clearable
        @input="searchFnc"
      ></ElInput>
    </div>
    <div v-loading="loading" class="field-checkbox__main">
      <div class="list-table__header">
        <ElCheckbox v-model="allCheckbox" @change="handleCheckbox"></ElCheckbox>
        <span>字段</span>
      </div>
      <div class="list-table__content">
        <div v-for="(item, index) in list" :key="index" class="list-table__line">
          <ElCheckbox v-model="item.checkbox" @change="handleChange"></ElCheckbox>
          <ElSelect v-model="item.source" @change="handleChange">
            <ElOption v-for="op in sourceData" :key="op + 'source'" :label="op" :value="op"></ElOption>
          </ElSelect>
          <ElSelect v-model="item.target" @change="handleChange">
            <ElOption v-for="op in targetData" :key="op + 'target'" :label="op" :value="op"></ElOption>
          </ElSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'FieldCheckbox',

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
      list: [],
      // sourceData: [],
      // targetData: [],
      allCheckbox: false
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
        let flag = true
        if (haveData && !source.includes(t)) {
          flag = false
        }
        return {
          checkbox: flag,
          originSource: t,
          source: t,
          originTarget: targetData[i],
          target: targetData[i]
        }
      })
      this.list = list
    },

    handleCheckbox() {},

    handleChange() {
      console.log('this.list', this.list)
      this.$emit('change', this.list)
    }
  }
}
</script>

<style lang="scss" scoped>
.list-table__content {
  height: 200px;
  overflow-y: auto;
}
</style>
