<script>
import { metadataInstancesApi } from '@tap/api'
import noData from '@tap/assets/images/noData.png'

import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { debounce } from 'lodash-es'
import { mapState } from 'vuex'

import List from './List.vue'

export default {
  name: 'FieldInference',

  components: { OverflowTooltip, List },

  props: {
    nodeId: {
      require: true,
    },
    hideNav: {
      type: Boolean,
      default: false,
    },
    includesDataTypes: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      navLoading: false,
      position: 0,
      selected: {},
      navList: [],
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1,
      },
      searchTable: '',
      searchField: '',
      noData,
    }
  },

  computed: {
    ...mapState('dataflow', ['transformLoading']),
  },

  mounted() {
    this.loadData()
  },

  methods: {
    async getData(op = {}) {
      const nodeId = this.nodeId
      if (!nodeId) return
      let data = {
        items: [],
        total: 0,
      }
      try {
        const params = Object.assign(
          {
            nodeId,
            fields: [
              'original_name',
              'fields',
              'qualified_name',
              'name',
              'indices',
            ],
            page: 1,
            pageSize: 20,
          },
          op,
        )
        data = await metadataInstancesApi.nodeSchemaPage(params)
      } catch {
        // catch
      }
      return data
    },

    async loadData(resetSelect = false) {
      this.navLoading = true
      const { size, current } = this.page
      const res = await this.getData({
        page: current,
        pageSize: size,
        tableFilter: this.searchTable,
        filterType: this.activeClassification,
      })
      const { items, total } = res
      if (this.includesDataTypes.length) {
        const types = this.includesDataTypes.map((t) => t.split(/[[(]/)?.[0])
        items.forEach((el) => {
          el.fields = el.fields.filter((t) =>
            types.includes(t.data_type.split(/[[(]/)?.[0]),
          )
        })
      }
      this.navList = items

      this.page.total = total
      this.page.count = total ? Math.ceil(total / this.page.size) : 1
      if (resetSelect) {
        this.handleSelect(this.position)
      } else {
        this.handleSelect()
      }
      this.navLoading = false
    },

    refresh() {
      this.loadData()
    },

    filterFields() {
      const item = this.navList[this.position]
      let fields = item?.fields
      const findPossibleDataTypes = item?.findPossibleDataTypes || {}
      if (this.searchField) {
        fields = item.fields.filter((t) =>
          t.field_name.toLowerCase().includes(this.searchField?.toLowerCase()),
        )
      }
      this.selected = Object.assign({}, item, { fields, findPossibleDataTypes })
    },

    handleSelect(index = 0) {
      this.position = index
      this.filterFields()
    },

    handleSearchTable: debounce(function () {
      this.loadData()
    }, 200),

    handleSearchField: debounce(function () {
      this.filterFields()
    }, 200),
  },
}
</script>

<template>
  <div v-loading="transformLoading" class="field-inference">
    <div class="field-inference__main flex">
      <div v-if="!hideNav" class="field-inference__nav flex flex-column">
        <ElInput
          v-model="searchTable"
          :placeholder="
            $t('packages_form_field_mapping_list_qingshurubiaoming')
          "
          clearable
          class="p-2"
          @input="handleSearchTable"
        >
          <template #prefix>
            <ElIcon><ElIconSearch /></ElIcon>
          </template>
        </ElInput>
        <div
          v-loading="navLoading"
          class="nav-list flex-fill font-color-normal"
        >
          <ul v-if="navList.length">
            <li
              v-for="(item, index) in navList"
              :key="index"
              :class="{ active: position === index }"
              class="flex align-items-center justify-content-between"
              @click="handleSelect(index)"
            >
              <div class="task-form-text-box pl-2 inline-block flex-1 min-w-0">
                <OverflowTooltip
                  class="w-100 text-truncate target"
                  :text="item.name"
                  placement="right"
                />
              </div>
            </li>
          </ul>
          <div
            v-else
            class="task-form-left__ul flex flex-column align-items-center"
          >
            <div class="table__empty_img" style="margin-top: 22%">
              <img style="" :src="noData" />
            </div>
            <div class="noData">{{ $t('public_data_no_data') }}</div>
          </div>
        </div>
        <ElPagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          small
          class="flex mt-3 p-0 din-font mx-auto"
          layout="total, prev, slot, next"
          :total="page.total"
          :pager-count="5"
          @current-change="loadData"
        >
          <div class="text-center">
            <span class="page__current" style="min-width: 22px">{{
              page.current
            }}</span>
            <span class="icon-color" style="min-width: 22px">/</span>
            <span class="icon-color" style="min-width: 22px">{{
              page.count
            }}</span>
          </div>
        </ElPagination>
      </div>
      <div class="field-inference__content flex-fill flex flex-column">
        <div class="flex align-items-center p-2">
          <ElInput
            v-model="searchField"
            :placeholder="
              $t('packages_form_field_mapping_list_qingshuruziduan')
            "
            clearable
            @input="handleSearchField"
          >
            <template #prefix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
          <ElButton circle class="ml-2 rounded-4" @click="refresh">
            <template #icon>
              <VIcon>refresh</VIcon>
            </template>
          </ElButton>
        </div>
        <List ref="list" :data="selected" class="content__list flex-fill" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.field-inference__main {
  height: 60vh;
  border: 1px solid #f2f2f2;
  border-radius: 4px;
}
.field-inference__nav {
  width: 210px;
  border-right: 1px solid #f2f2f2;
}
.field-inference__content {
  width: 0;
}
.nav-list {
  overflow: hidden auto;
  li {
    background-color: var(--color-white);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid var(--border-light);
    border-left: 2px solid transparent;
    &:hover,
    &.active {
      background: var(--bg-disactive);
      cursor: pointer;
      border-left-color: var(--color-primary);
    }
    .task-form-text-box {
      //width: 140px;
      .target {
        height: 40px;
        line-height: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.table__empty_img {
  width: 80px;
  height: 80px;
  img {
    width: 100%;
    height: 100%;
  }
}
.btn-refresh {
  padding: 0;
  height: 28px;
  width: 28px;
  min-width: 28px;
  font-size: 16px;
  &:hover,
  &.is-plain:focus:hover {
    border-color: var(--color-primary);
    background-color: var(--color-white);
  }
}
.content__list {
  height: 0;
}
.page__current {
  width: 22px;
  height: 22px;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-primary);
  line-height: 22px;
  background-color: var(--bg-pageCount);
}
</style>
