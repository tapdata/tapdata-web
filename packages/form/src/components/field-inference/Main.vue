<template>
  <div>
    <div class="flex justify-content-end">
      <div v-if="batchRuleCounts" class="flex align-items-center cursor-pointer color-primary" @click="visible = true">
        <VIcon>info</VIcon>
        <span>{{ $t('packages_form_field_inference_main_dangqianyou') }}</span>
        <span class="color-warning px-1 fs-6 fw-bold din-font">{{ batchRuleCounts }}</span>
        <span>{{ $t('packages_form_field_inference_main_gepiliangxiugai') }}</span>
      </div>
      <ElButton type="text" class="ml-3" @click="rollbackAll">{{
        $t('packages_form_field_inference_main_quanbuhuifumo')
      }}</ElButton>
    </div>
    <div class="field-inference flex">
      <div class="field-inference__nav flex flex-column">
        <ElInput
          v-model="searchTable"
          size="mini"
          :placeholder="$t('packages_form_field_mapping_list_qingshurubiaoming')"
          suffix-icon="el-icon-search"
          clearable
          class="p-2"
          @input="handleSearchTable"
        ></ElInput>
        <div class="flex bg-main justify-content-between pl-2" style="height: 40px">
          {{ $t('packages_form_field_mapping_list_biaoming') }}
        </div>
        <div v-loading="navLoading" class="nav-list flex-fill font-color-normal">
          <ul v-if="navList.length">
            <li
              v-for="(item, index) in navList"
              :key="index"
              :class="{ active: position === index }"
              @click="handleSelect(item, index)"
            >
              <div class="task-form-text-box pl-4">
                <OverflowTooltip class="w-100 text-truncate target" :text="item.name" placement="right" />
              </div>
            </li>
          </ul>
          <div v-else class="task-form-left__ul flex flex-column align-items-center">
            <div class="table__empty_img" style="margin-top: 22%"><img style="" :src="noData" /></div>
            <div class="noData">{{ $t('packages_form_dag_dialog_field_mapping_no_data') }}</div>
          </div>
        </div>
        <ElPagination
          small
          class="flex mt-3 din-font mx-auto"
          layout="total, prev, slot, next"
          :current-page.sync="page.current"
          :page-size.sync="page.size"
          :total="page.total"
          :pager-count="5"
          @current-change="loadData"
        >
          <div class="text-center">
            <span class="page__current" style="min-width: 22px">{{ page.current }}</span>
            <span class="icon-color" style="min-width: 22px">/</span>
            <span class="icon-color" style="min-width: 22px">{{ page.count }}</span>
          </div>
        </ElPagination>
      </div>
      <div class="field-inference__main flex-fill flex flex-column">
        <div class="flex align-items-center p-2">
          <ElInput
            v-model="searchField"
            :placeholder="$t('packages_form_field_mapping_list_qingshuruziduan')"
            size="mini"
            suffix-icon="el-icon-search"
            clearable
            @input="handleSearchField"
          ></ElInput>
          <ElButton size="mini" plain class="btn-refresh ml-2" @click="refresh">
            <VIcon>refresh</VIcon>
          </ElButton>
        </div>
        <List
          :form="form"
          :data="selected"
          :show-columns="['index', 'field_name', 'data_type', 'operation']"
          :fieldChangeRules.sync="fieldChangeRules"
          class="flex-fill"
        ></List>
      </div>
    </div>
    <Dialog :visible.sync="visible" :form="form" :fieldChangeRules.sync="fieldChangeRules"></Dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash'

import noData from 'web-core/assets/images/noData.png'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'

import mixins from './mixins'
import List from './List'
import Dialog from './Dialog'

export default {
  name: 'FieldInference',

  components: { OverflowTooltip, List, Dialog },

  mixins: [mixins],

  props: {
    form: Object,
    readOnly: Boolean
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
        count: 1
      },
      searchTable: '',
      searchField: '',
      visible: false,
      fieldChangeRules: [],
      noData
    }
  },

  computed: {
    batchRuleCounts() {
      return this.fieldChangeRules.filter(t => t.scope === 'Node').length
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    async loadData() {
      this.navLoading = true
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
      const { size, current } = this.page
      const { items, total } = await this.getData({
        page: current,
        pageSize: size,
        tableFilter: this.searchTable
      })
      this.navList = items
      this.page.total = total
      this.page.count = total ? Math.ceil(total / this.page.size) : 1
      this.handleSelect(this.navList[0])
      this.navLoading = false
    },

    refresh() {
      this.loadData()
    },

    filterFields() {
      let item = this.navList[this.position]
      let fields = item?.fields
      if (this.searchField) {
        fields = item.fields.filter(t => t.field_name.toLowerCase().includes(this.searchField?.toLowerCase()))
      }
      this.selected = Object.assign({}, item, { fields })
    },

    handleSelect(item, index = 0) {
      this.position = index
      this.filterFields()
    },

    rollbackAll() {
      this.$confirm('您确认要全部恢复默认吗？', '', {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          this.fieldChangeRules = []
          this.handleUpdate()
          this.$message.success('操作成功')
        }
      })
    },

    handleUpdate() {
      this.form.setValuesIn('fieldChangeRules', this.fieldChangeRules)
    },

    handleSearchTable: debounce(function () {
      this.loadData()
    }, 200),

    handleSearchField: debounce(function () {
      this.filterFields()
    }, 200)
  }
}
</script>

<style lang="scss" scoped>
.field-inference {
  height: 60vh;
  border: 1px solid #f2f2f2;
  border-radius: 4px;
}
.field-inference__nav {
  max-width: 210px;
  border-right: 1px solid #f2f2f2;
}
.field-inference__main {
  //width: 0;
}
.nav-list {
  max-width: 210px;
  overflow: hidden auto;
  li {
    background-color: map-get($bgColor, white);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid map-get($borderColor, light);
    border-left: 2px solid transparent;
    &:hover,
    &.active {
      background: map-get($bgColor, disactive);
      cursor: pointer;
      border-left-color: map-get($color, primary);
    }
    .task-form-text-box {
      width: 140px;
      .target {
        font-size: 12px;
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
    border-color: map-get($color, primary);
    background-color: map-get($color, white);
  }
}
</style>
