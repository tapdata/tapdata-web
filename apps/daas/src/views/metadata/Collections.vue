<template>
  <!-- 数据集 -->
  <section class="collection-list-wrap">
    <!-- <TablePage
        ref="table"
        row-key="id"
        class="metadata-list"
        :remoteMethod="getData"
        @sort-change="handleSortTable"
      > -->
    <div class="collection-box">
      <div class="table-page-operation-bar">
        <el-button
          v-readonlybtn="'new_model_creation'"
          type="primary"
          class="btn btn-create"
          size="mini"
          @click="openCreateDialog"
        >
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          <span>{{ $t('metadata_details_createCollection') }}</span>
        </el-button>
      </div>
      <!-- 索引表格 start -->
      <el-table ref="table" class="table-page-table" height="100%" v-loading="loading" :data="collectionTableData">
        <el-table-column :label="$t('metadata_details_collectionName')" prop="name">
          <template v-slot="scope">
            <el-button type="text" @click="handleJumpTable(scope.row)" style="padding: 0 10px">{{
              scope.row.name
            }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('metadata_details_opera')" width="120">
          <template v-slot="scope">
            <el-button size="mini" type="text" style="color: #f56c6c" @click="remove(scope.row)">{{
              $t('button_delete')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        class="table-page-pagination"
        layout=" ->,total, sizes, prev, pager, next, jumper"
        v-model:current-page="pageCurrent"
        :page-sizes="[10, 20, 50, 100]"
        v-model:page-size="pageSize"
        :total="pageTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
      <!-- </TablePage> -->
      <!-- 索引表格 end -->
    </div>

    <!-- 创建索引弹窗 start -->
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('metadata_details_createCollection')"
      :close-on-click-modal="false"
      v-model:visible="createDialogVisible"
    >
      <el-form ref="form" :model="createForm" class="dataRule-form">
        <el-form-item :label="$t('metadata_details_collectionName')" props="name">
          <el-input
            type="text"
            size="mini"
            v-model:value="createForm.name"
            :placeholder="$t('dataRule_pleaseSelect') + $t('metadata_details_collectionName')"
          ></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false" size="small">{{ $t('message_cancel') }}</el-button>
          <el-button type="primary" @click="createNewModel()" size="small">{{ $t('message_confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 创建索引弹窗 end -->
  </section>
</template>

<script>
import { metadataInstancesApi } from '@tap/api'
export default {
  // components: {
  //   TablePage
  // },
  props: {
    collectionData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      createDialogVisible: false,
      collectionTableData: [],
      rulesArr: [],
      pageSize: 20,
      pageCurrent: 1,
      pageTotal: 0,
      createForm: {
        name: ''
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取表格数据
    getData() {
      metadataInstancesApi.findTablesById([this.$route.params.id]).then(data => {
        let collections = data?.collections || []
        this.collectionTableData = collections
        this.pageTotal = this.collectionTableData.length
        this.setCurrentPageData(collections)
      })
    },
    openCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        name: ''
      }
    },
    // 跳转表
    handleJumpTable(data) {
      // location.reload()
      this.$router.push({ name: 'metadataDetails', params: { id: data.id } })
      this.$nextTick(() => {
        location.reload()
      })
    },
    // 保存数据集
    createNewModel() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            meta_type: 'collection',
            // original_id: _this.collectionData.id,
            // original_name: _this.createForm.name,
            qualified_name: '',
            // source: _this.collectionData.source,
            // is_deleted: false,
            databaseId: _this.collectionData.id,
            name: _this.createForm.name
          }
          params.qualified_name = _this.collectionData.source.database_uri + '_' + params.name
          params.qualified_name = params.qualified_name
            // eslint-disable-next-line
            .split(/\/|\.|@|\&|:|\?|%|=/)
            .join('_')
          metadataInstancesApi.post(params).then(() => {
            this.createDialogVisible = false
            let page = {
              current: 1,
              size: 20
            }
            this.getData(page)
            this.$message.success(this.$t('message_save_ok'))
          })
          // .catch(() => {
          //   this.$message.error(this.$t('message_save_fail'))
          // })
        }
      })
    },
    // 删除数据集
    remove(item) {
      const h = this.$createElement
      let message = h('p', [this.$t('message_deleteOrNot') + ' ' + item.name])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        metadataInstancesApi.delete(item.id).then(() => {
          this.getData()
          this.$message.success(this.$t('message_deleteOK'))
        })
      })
    },
    // 分页数据处理
    setCurrentPageData(tableData) {
      let begin = (this.pageCurrent - 1) * this.pageSize
      let end = this.pageCurrent * this.pageSize
      this.collectionTableData = tableData.slice(begin, end)
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getData()
      this.setCurrentPageData(this.collectionTableData)
    },
    handleCurrentChange(val) {
      this.pageCurrent = val
      this.getData()
      this.setCurrentPageData(this.collectionTableData)
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-list-wrap {
  height: 100%;
  .collection-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100% - 28px);
    padding: 10px 20px;
    background-color: map-get($bgColor, white);
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
    overflow: hidden;
    .table-page-operation-bar {
      margin-bottom: 10px;
      overflow: hidden;
      .btn-create {
        float: right;
        padding: 7px;
        // background: map-get($bgColor, main);
        i.iconfont {
          font-size: 12px;
        }
        &.btn-create {
          margin-left: 5px;
        }
      }
    }
  }
  .btn-create {
    float: right;
  }
  .fr {
    float: right;
  }
}
</style>

<style lang="scss">
.collection-list-wrap {
  .create-dialog {
    .el-dialog__body {
      .el-form-item.el-form-item--small,
      .el-form-item.el-form-item--mini {
        margin-bottom: 0;
      }
    }
  }

  .table-page-pagination {
    padding-top: 5px;
    box-sizing: border-box;
    border-top: 1px solid #ddd;
    background-color: map-get($bgColor, white);
    td,
    .is-scrolling-left ~ .el-table__fixed {
      border-right: 0;
    }
    th {
      border-right: 1px solid #dcdfe6;
    }
  }
}
</style>
