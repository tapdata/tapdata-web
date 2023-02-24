<template>
  <Drawer class="sw-table-drawer" v-model:visible="visible" width="850px">
    <header v-if="detailData">
      <div class="table-name mb-4">{{ detailData.name }}</div>
      <span class="mr-2">
        <VIcon class="tree-item-icon" size="18">table</VIcon>
        <span class="table-dec-txt">Table</span></span
      >
      <span class="ml-8">
        <span>{{ detailData.sourceType }}</span></span
      >
      <span class="ml-8"
        ><span class="table-dec-label">模型最后更新时间：</span
        ><span class="table-dec-txt">{{ detailData.lastUpdAt }}</span></span
      >
    </header>
    <section class="mt-6">
      <el-tabs v-model:value="activeName" @tab-click="handleClick">
        <el-tab-pane label="OverView" name="overView">
          <section class="mt-2">
            <div class="mb-4">
              <span class="table-dec-label mb-4">Table Description：</span
              ><span class="table-dec-txt">Lorem ipsum dolor sit</span>
            </div>
            <el-row>
              <el-col :span="4">
                <div class="table-dec-label">Rows</div>
                <div class="table-dec-txt mt-4">2.7M</div>
              </el-col>
              <el-col :span="4">
                <div class="table-dec-label">Columns</div>
                <div class="table-dec-txt mt-4">2.7M</div>
              </el-col>
              <el-col :span="4">
                <div class="table-dec-label">Storage Size</div>
                <div class="table-dec-txt mt-4">27M</div>
              </el-col>
              <el-col :span="6">
                <div class="table-dec-label">Connection</div>
                <div class="table-dec-txt mt-4" v-if="detailData">
                  {{ detailData.connectionName }}
                </div>
              </el-col>
            </el-row>
          </section>
          <section class="mt-6">
            <el-tabs v-model:value="activeNameItems" @tab-click="handleClick">
              <el-tab-pane label="Columns Preview" name="columnsPreview">
                <VTable
                  class="discovery-page-table"
                  :columns="columnsPreview"
                  :data="tableFields"
                  :has-pagination="false"
                >
                  <template v-slot:empty>
                    <div>
                      {{ $t('packages_dag_dag_dialog_field_mapping_no_data') }}
                    </div>
                  </template>
                </VTable>
              </el-tab-pane>
              <el-tab-pane label="Sample Data" name="sampleData">Schema</el-tab-pane>
            </el-tabs>
          </section>
          <section class="mt-6">
            <div class="change-history mb-4">Change History</div>
            <ul>
              <li>
                <span>2023-02-03 12:21:34</span>
                <span class="ml-8">Lucy</span>
                <span class="ml-8">新增了标签603</span>
              </li>
              <li class="mt-2">
                <span>2023-02-03 12:21:34</span>
                <span class="ml-8">Lucy</span>
                <span class="ml-8">新增了标签603</span>
              </li>
            </ul>
          </section>
        </el-tab-pane>
        <el-tab-pane label="Schema" name="schema">
          <VTable class="discovery-page-table" :columns="columns" :data="tableFields" :has-pagination="false">
            <template v-slot:empty>
              <div>
                {{ $t('packages_dag_dag_dialog_field_mapping_no_data') }}
              </div>
            </template>
          </VTable>
        </el-tab-pane>
        <el-tab-pane label="Tasks" name="tasks">Tasks</el-tab-pane>
        <el-tab-pane label="APIs" name="apis">APIs</el-tab-pane>
        <el-tab-pane label="Lineage" name="lineage">APIs</el-tab-pane>
      </el-tabs>
    </section>
  </Drawer>
</template>

<script>
import { Drawer } from '@tap/component'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import { VTable } from '@tap/component'
import { discoveryApi } from '@tap/api'
import i18n from '@/i18n'
import dayjs from 'dayjs'
export default {
  name: 'TablePreview',
  components: { Drawer, VTable, NodeIcon },
  data() {
    return {
      visible: false,
      activeName: 'overView',
      activeNameItems: 'columnsPreview',
      loading: false,
      detailData: {},
      tableFields: [],
      columnsPreview: [
        {
          label: i18n.t('metadata_name'),
          prop: 'name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'dataType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc'
        }
      ],
      columns: [
        {
          label: i18n.t('metadata_name'),
          prop: 'name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'dataType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_zhujian'),
          prop: 'primaryKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_waijian'),
          prop: 'foreignKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_suoyin'),
          prop: 'index'
        },
        {
          label: i18n.t('meta_table_not_null'),
          prop: 'notNull'
        },
        {
          label: i18n.t('meta_table_default'),
          prop: 'defaultValue'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumingcheng'),
          prop: 'businessName'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewuleixing'),
          prop: 'businessType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc'
        }
      ]
    }
  },
  methods: {
    open(row) {
      this.visible = true
      this.getTableStorage(row)
    },
    getTableStorage(row) {
      discoveryApi
        .overViewStorage(row.id)
        .then(res => {
          this.detailData = res
          this.detailData['lastUpdAt'] = this.detailData['lastUpdAt']
            ? dayjs(this.detailData['lastUpdAt']).format('YYYY-MM-DD HH:mm:ss')
            : '-'
          this.tableFields = res?.fields || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClick() {}
  }
}
</script>

<style lang="scss" scoped>
.sw-table-drawer {
  padding: 24px;
  .table-name {
    font-weight: 500;
    font-size: 32px;
    color: #1d2129;
  }
  .table-dec-label {
    font-weight: 400;
    color: #535f72;
  }
  .table-dec-txt {
    font-weight: 500;
    color: #1d2129;
  }
  .change-history {
    font-weight: 500;
    font-size: 18px;
    color: #1d2129;
  }
}
</style>
