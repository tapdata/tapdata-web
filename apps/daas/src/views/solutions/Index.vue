<template>
  <div class="solutions flex flex-column">
    <div class="search-row mb-4">
      <ElInput v-model="keyword" clearable :placeholder="$t('solution_error_code')" @input="search(800)">
        <template v-slot:prepend>
          <ElSelect v-model="select" :placeholder="$t('solution_select_placeholder_type')" class="type-select">
            <ElOption v-for="item in selectItems" :key="item.value" :value="item.value" :label="item.label"></ElOption>
          </ElSelect>
        </template>
        <template v-slot:append>
          <ElButton @click="search">
            <ElIcon><ElIconSearch /></ElIcon>
          </ElButton>
        </template>
      </ElInput>
    </div>
    <div class="search-count align-items-center pb-4">
      <span>{{ list.length || 0 }}</span>
      <span class="ml-2">{{ $t('solution_search_result') }}</span>
    </div>
    <div v-loading="loading" class="result-list flex-fill">
      <div class="result-list__content">
        <div v-for="(item, index) in list" :key="index" class="result-item py-6">
          <div class="result-item__title mb-3 fs-5 fw-bolder">
            {{ item.code }}
          </div>
          <div class="result-item__message mb-2 ml-4">
            <div class="mb-1">{{ $t('public_description') }}:</div>
            <div class="font-color-slight ml-4">{{ item.message }}</div>
          </div>
          <ul class="result-item__list ml-4">
            <li v-for="(t, i) in item.solutions" :key="i" class="mb-1">
              <div class="mb-1">{{ $t('solution_search_solutions') }}{{ i + 1 }}:</div>
              <div class="font-color-slight ml-4">{{ t }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { delayTrigger } from '@tap/shared'
import { customerJobLogsApi } from '@tap/api'

export default {
  name: 'Solutions',
  data() {
    const $t = this.$t.bind(this)
    return {
      keyword: '',
      select: 'CustomerJobLogs',
      selectItems: [
        {
          label: $t('solution_customer_job_logs'),
          value: 'CustomerJobLogs',
        },
      ],
      loading: false,
      list: [],
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const { code, type } = this.$route.query || {}
      if (code) {
        this.keyword = code
      }
      switch (type) {
        default:
          this.select = 'CustomerJobLogs'
          break
      }
      this.getData()
    },
    search(debounce) {
      delayTrigger(() => {
        this.getData()
      }, debounce)
    },
    getData() {
      this.loading = true
      let params = {}
      if (this.keyword) {
        params.code = this.keyword
      }
      customerJobLogsApi
        .solutions(params)
        .then((data) => {
          this.list = data || []
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.solutions {
  padding: 24px 0 0 24px;
  font-size: 14px;
}
.search-row {
  .el-input {
    width: 500px;
  }
}
.type-select {
  width: 150px;
}
.search-count {
  width: 650px;
  border-bottom: 1px solid #dfdfdf;
}
.result-list {
  overflow-y: auto;
  height: 0;
}
.result-list__content {
  width: 650px;
}
.result-item {
  &:first-child {
    border-top: none;
  }
  border-top: 1px solid #dfdfdf;
}
</style>
