<template>
  <section class="function-list-wrapper h-100">
    <TablePage
      ref="table"
      class="h-100"
      row-key="id"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
      @selection-change="handleSelectionChange"
    >
      <template v-slot:search>
        <ul class="search-bar">
          <li class="item">
            <ElRadioGroup v-model:value="searchParams.type" @input="table.fetch(1)">
              <ElRadioButton label="">{{ $t('public_select_option_all') }}</ElRadioButton>
              <ElRadioButton v-for="(label, value) in typeMapping" :key="value" :label="value"
                >{{ label }}
              </ElRadioButton>
            </ElRadioGroup>
          </li>
          <li class="item">
            <ElButton plain class="btn-refresh" @click="table.fetch()">
              <el-icon><el-icon-refresh /></el-icon>
            </ElButton>
          </li>
        </ul>
      </template>
      <template v-slot:operation>
        <div>
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
              :disabled="$disabledReadonlyUserBtn()"
              v-readonlybtn="'SYNC_job_export'"
              class="btn message-button-cancel"
              @click="handleExport"
            >
              <span> {{ $t('public_button_export') }}</span>
            </el-button>
            <el-button
              v-readonlybtn="'SYNC_job_import'"
              class="btn"
              :disabled="$disabledReadonlyUserBtn()"
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
        </div>
      </template>
      <el-table-column
        reserve-selection
        type="selection"
        width="45"
        align="center"
        :selectable="(row) => !row.hasChildren"
      >
      </el-table-column>
      <ElTableColumn :label="$t('function_name_label')" prop="function_name" min-width="300"> </ElTableColumn>
      <ElTableColumn :label="$t('function_type_label')" prop="typeFmt" width="160"> </ElTableColumn>
      <ElTableColumn :label="$t('public_description')" prop="describe" min-width="300"> </ElTableColumn>
      <ElTableColumn :label="$t('public_update_time')" prop="last_updated" sortable="last_updated" min-width="180">
        <template v-slot="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </ElTableColumn>

      <ElTableColumn width="180" :label="$t('public_operation')">
        <template #default="{ row }">
          <ElLink type="primary" @click="$router.push({ name: 'FunctionDetails', params: { id: row.id } })">{{
            $t('public_button_check')
          }}</ElLink>
          <template v-if="row.type !== 'system'">
            <ElDivider direction="vertical"></ElDivider>
            <ElLink type="primary" @click="toEdit(row)">{{ $t('public_button_edit') }}</ElLink>
            <ElDivider direction="vertical"></ElDivider>
            <ElLink type="primary" @click="remove(row)">{{ $t('public_button_delete') }}</ElLink>
          </template>
        </template>
      </ElTableColumn>
    </TablePage>
    <!-- 导入 -->
    <Upload type="Javascript_functions" :show-tag="false" ref="upload" @success="table.fetch(1)"></Upload>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { javascriptFunctionsApi } from '@tap/api'
import { TablePage } from '@tap/business'
import Upload from '@tap/business/src/components/UploadDialog'

export default {
  components: {
    TablePage,
    Upload,
    ElIconRefresh,
  },
  data() {
    return {
      searchParams: {
        type: '',
      },
      typeMapping: {
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system'),
      },
      order: 'last_updated DESC',
      multipleSelection: [],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { type } = this.searchParams
      let { current, size } = page
      let where = {
        category: null,
      }
      type && (where.type = type)
      let filter = {
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
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map((item) => {
              item.typeFmt = this.typeMapping[item.type]
              item.lastUpdatedFmt = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              return item
            }),
          }
        })
    },
    remove(item) {
      this.$confirm(this.$t('function_message_delete_content'), this.$t('function_message_delete_title'), {
        type: 'warning',
      }).then((resFlag) => {
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

<style lang="scss" scoped>
.function-list-wrapper {
  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
    .btn-refresh {
      padding: 0;
      height: 32px;
      line-height: 32px;
      width: 32px;
      min-width: 32px;
      font-size: 16px;
    }
  }
}
</style>
