<script>
import { javascriptFunctionsApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import Upload from '@tap/business/src/components/UploadDialog.vue'
import FilterBar from '@tap/component/src/filter-bar/Main.vue'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'

export default {
  components: {
    PageContainer,
    TablePage,
    Upload,
    FilterBar,
  },
  data() {
    return {
      filterItems: [
        {
          key: 'type',
          slotName: 'type',
        },
        {
          placeholder: this.$t('function_name_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ],
      searchParams: {
        type: undefined,
        keyword: '',
      },
      typeMapping: {
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system'),
      },
      typeOptions: [
        {
          label: this.$t('public_all'),
          value: undefined,
        },
        {
          label: this.$t('function_type_option_custom'),
          value: 'custom',
        },
        {
          label: this.$t('function_type_option_jar'),
          value: 'jar',
        },
        {
          label: this.$t('function_type_option_system'),
          value: 'system',
        },
      ],
      order: 'last_updated DESC',
      multipleSelection: [],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    },
  },
  created() {
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      const { type, keyword } = this.searchParams
      const { current, size } = page
      const where = {
        category: null,
      }
      type && (where.type = type)
      if (keyword) {
        where.function_name = { like: escapeRegExp(keyword), options: 'i' }
      }
      const filter = {
        where,
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
      }
      return javascriptFunctionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          return {
            total: data?.total,
            data: list.map((item) => {
              item.typeFmt = this.typeMapping[item.type]
              item.lastUpdatedFmt = dayjs(item.last_updated).format(
                'YYYY-MM-DD HH:mm:ss',
              )
              return item
            }),
          }
        })
    },
    remove(item) {
      this.$confirm(
        this.$t('function_message_delete_title'),
        this.$t('function_message_delete_content'),
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        javascriptFunctionsApi.delete(item.id).then(() => {
          this.table.fetch()
        })
      })
    },
    toEdit(row) {
      this.$router.push({
        name: 'FunctionEdit',
        params: {
          id: row.id,
        },
      })
    },
    toCreate() {
      this.$router.push({
        name: 'FunctionCreate',
      })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleExport() {
      const ids = this.multipleSelection.map((t) => t.id)
      javascriptFunctionsApi.export(ids)
    },
    handleImport() {
      this.$refs.upload.show()
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-if="searchParams.type !== 'custom'"
        class="ml-4 btn-create"
        @click="
          $router.push({
            name: 'FunctionImport',
          })
        "
      >
        <span>{{ $t('function_button_import_jar') }}</span>
      </ElButton>
      <template v-else>
        <el-button
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'SYNC_job_export'"
          class="btn message-button-cancel"
          @click="handleExport"
        >
          <span> {{ $t('public_button_export') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'SYNC_job_import'"
          class="btn"
          @click="handleImport"
        >
          <span> {{ $t('packages_business_button_bulk_import') }}</span>
        </el-button>
      </template>
      <ElButton
        class="btn-create"
        type="primary"
        @click="
          $router.push({
            name: 'FunctionCreate',
          })
        "
      >
        <span>{{ $t('public_button_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      class="h-100"
      row-key="id"
      :remote-method="getData"
      @sort-change="handleSortTable"
      @selection-change="handleSelectionChange"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        >
          <template #type="{ onChange, item }">
            <el-segmented
              v-model="item.value"
              :options="typeOptions"
              @change="onChange(item, 'change')"
            />
          </template>
        </FilterBar>
      </template>
      <el-table-column
        reserve-selection
        type="selection"
        width="32"
        align="center"
        :selectable="(row) => !row.hasChildren"
      />
      <ElTableColumn
        :label="$t('function_name_label')"
        prop="function_name"
        min-width="300"
      />
      <ElTableColumn
        :label="$t('function_type_label')"
        prop="typeFmt"
        width="160"
      />
      <ElTableColumn
        :label="$t('public_description')"
        prop="describe"
        min-width="300"
      />
      <ElTableColumn
        :label="$t('public_update_time')"
        prop="last_updated"
        sortable="last_updated"
        min-width="180"
      >
        <template #default="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </ElTableColumn>

      <ElTableColumn width="180" :label="$t('public_operation')">
        <template #default="{ row }">
          <ElButton
            text
            type="primary"
            @click="
              $router.push({ name: 'FunctionDetails', params: { id: row.id } })
            "
            >{{ $t('public_button_check') }}</ElButton
          >
          <template v-if="row.type !== 'system'">
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton text type="primary" @click="toEdit(row)">{{
              $t('public_button_edit')
            }}</ElButton>
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton text type="primary" @click="remove(row)">{{
              $t('public_button_delete')
            }}</ElButton>
          </template>
        </template>
      </ElTableColumn>
    </TablePage>
    <!-- 导入 -->
    <Upload
      ref="upload"
      type="Javascript_functions"
      :show-tag="false"
      @success="table.fetch(1)"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.function-list-wrapper {
  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
  }
}
.btn-refresh {
  padding: 0;
  height: 32px;
  line-height: 32px;
  width: 32px;
  min-width: 32px;
  font-size: 16px;
}
</style>
