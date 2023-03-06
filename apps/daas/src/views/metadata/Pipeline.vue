<template>
  <!-- mogo视图 start -->
  <section class="pipeline-list-wrap">
    <el-form :model="model" :rules="rules" ref="form" label-position="top">
      <el-form-item :label="$t('metadata_details_pipeline_collection')" prop="collection" required>
        <el-select v-model="model.collection" size="mini">
          <el-option
            v-for="item in collections"
            :key="item.original_name"
            :label="item.original_name"
            :value="item.original_name"
          >
          </el-option>
        </el-select>
        <!-- <el-input
          type="text"
          size="mini"
          v-model="model.collection"
          :placeholder="
            $t('metadata_details_select') +
            $t('metadata_details_pipeline_collection')
          "
        ></el-input> -->
      </el-form-item>
      <el-form-item :label="$t('metadata_details_pipeline_pipeline')" prop="pipeline" required>
        <el-input
          type="textarea"
          size="mini"
          v-model="model.pipeline"
          :placeholder="$t('metadata_details_enter') + $t('metadata_details_pipeline_pipeline')"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div v-show="pipeline_status">
          {{ $t('metadata_details_pipeline_viewStatus') }}:
          {{ pipeline_status }}
        </div>
        <div v-show="pipeline_status == 'failed'">
          {{ $t('metadata_details_pipeline_FailedMessage') }}:
          {{ pipeline_status }}
        </div>
        <div>{{ $t('metadata_details_pipeline_penpinSave') }}</div>
      </el-form-item>
      <el-form-item size="large">
        <div class="btn">
          <el-button type="primary" @click="applicationBtn" size="mini">{{
            $t('metadata_details_pipeline_apply')
          }}</el-button>
          <el-button type="primary" @click="saveSubmit" size="mini">{{ $t('public_button_save') }}</el-button>
        </div>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import { scheduleTasksApi, metadataInstancesApi } from '@tap/api'
export default {
  props: {
    pipelineData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      collections: [],
      pipeline_status: '',
      pipeline_message: '',
      isCoverDialog: false,
      model: {
        collection: '',
        pipeline: ''
      },
      rules: {
        collection: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('metadata_details_pipeline_collection') + this.$t('metadata_details_pipeline_cnot_Empty')
          }
        ],
        pipeline: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('metadata_details_pipeline_pipeline') + this.$t('metadata_details_pipeline_cnot_Empty')
          }
        ]
      }
    }
  },
  created() {
    if (this.pipelineData.pipline) {
      this.model = this.pipelineData.pipline
      this.pipeline_status = this.pipelineData.pipeline_status
      this.pipeline_message = this.pipelineData.pipeline_message
    } else {
      this.$set(this.pipelineData, 'pipline', {})
    }
    // 获取表数据
    let params = {
      filter: {
        where: {
          meta_type: 'collection',
          databaseId: {
            regexp: `^${this.pipelineData.databaseId}$`
          }
        }
      }
    }

    metadataInstancesApi.get(params).then(data => {
      this.collections = data?.items || []
      this.model.collection = this.collections[0].original_name
    })
  },
  methods: {
    // 应用
    applicationBtn() {
      if (this.pipeline_status === 'succeed') {
        this.$confirm(this.$t('metadata_details_pipeline_view_tip'), {
          closeOnClickModal: false,
          confirmButtonText: this.$t('public_button_confirm'),
          confirmButtonClass: this.$t('public_button_cancel'),
          showClose: false
        })
          .then(() => {
            this.applyToDB()
          })
          .finally(() => {
            this.isCoverDialog = false
          })
      } else {
        this.applyToDB()
      }
    },

    // 管道
    applyToDB() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          scheduleTasksApi
            .post({
              task_name: 'mongodb_apply_pipeline',
              task_type: 'MONGODB_APPLY_PIPELINE',
              status: 'waiting',
              task_data: {
                name: this.pipelineData.original_name,
                id: this.pipelineData.id,
                database: this.pipelineData.databaseId,
                collection: this.model.collection,
                pipeline: this.model.pipeline,
                type: 'view',
                isApplication: true,
                dropIfExists: true,
                source: this.pipelineData.source._id
              }
            })
            .then(data => {
              _this.isApplication = data?.task_data.isApplication
              if (_this.pipelineData) _this.$set(_this.pipelineData.pipline, 'isApplication', _this.isApplication)
              this.$message.success(this.$t('metadata_details_pipeline_success'))
            })
        }
      })
    },

    // 保存
    saveSubmit() {
      metadataInstancesApi
        .patchId(this.pipelineData.id, {
          pipline: this.model
        })
        .then(() => {
          this.$message.success(this.$t('message_save_ok'))
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.pipeline-list-wrap {
  height: 100%;
  padding: 0x 30px;
  .btn-create {
    float: right;
  }
}
</style>
<style lang="scss">
.pipeline-list-wrap {
  .el-form {
    .el-form-item {
      .el-form-item__label {
        padding: 0;
        line-height: 30px;
      }
      .el-form-item__content {
        padding-top: 5px;
        line-height: 30px;
        .el-select {
          width: 100%;
        }
      }
      .el-textarea__inner {
        min-height: 200px !important;
      }
      .btn {
        text-align: center;
      }
    }
  }
}
</style>
