<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="80%"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    :before-close="handleClose"
  >
    <div slot="title" class="text-center font-color-dark fs-2 fw-bold">
      {{ showForm ? 'Configure SaaS Source' : title }}
    </div>
    <div v-if="!showForm" class="px-7 text-center">
      <div class="mb-4 font-color-light">
        Choose a data source connector from below and configure the connection & credentials.
      </div>
      <div class="inline-flex align-items-center mt-2 mb-4">
        <ElCheckbox v-model="settings.showBeta" class="m-0"></ElCheckbox>
        <span class="ml-2">Show Connectors in BETA State</span>
        <ElCheckbox v-model="settings.showAlpha" class="ml-8 mr-0"></ElCheckbox>
        <span class="ml-2">Show Connectors in ALPHA State</span>
      </div>
      <ConnectionSelector
        :loading="loading"
        :types="database"
        :otherTypes="otherType"
        :large="true"
        @select="handleSelect"
      ></ConnectionSelector>
    </div>
    <div v-else class="form__content">
      <div class="mb-4 text-center font-color-light">Connect & Authorize Tapdata to access your Zoho Desk account:</div>
      <ConnectionForm :params="formParams" @back="init" @success="handleSuccess"></ConnectionForm>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'

import { databaseTypesApi } from '@tap/api'
import ConnectionSelector from './Selector'
import ConnectionForm from './Form'

export default {
  name: 'Dialog',
  components: {
    ConnectionSelector,
    ConnectionForm
  },
  props: {
    title: {
      type: String,
      default: () => {
        return 'Choose Data Source Type' || i18n.t('connection_form_creat_connection')
      }
    },
    visible: {
      required: true,
      value: Boolean
    },
    params: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      database: [],
      otherType: [],
      loading: true,
      settings: {
        showBeta: true,
        showAlpha: true
      },
      formParams: {},
      showForm: false,
      timer: null
    }
  },
  watch: {
    visible(v) {
      this.timer && clearInterval(this.timer)
      if (v) {
        this.init()
        this.timer = setInterval(() => {
          this.getDatabaseType(true)
        }, 3000)
      }
    }
  },
  methods: {
    init() {
      this.showForm = false
      this.database = []
      this.formParams = {}
      this.getDatabaseType()
    },
    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },
    handleSelect(item) {
      this.showForm = true
      const { pdkHash } = item
      this.formParams = { pdkHash }
    },
    getDatabaseType(noLoading = false) {
      if (!noLoading) this.loading = true
      databaseTypesApi
        .get()
        .then(data => {
          if (data) {
            let items = data?.filter(
              t => t.connectionType.includes(this.params?.type) && !this.database?.some(d => d.pdkHash === t.pdkHash)
            )
            if (!items.length) {
              return
            }
            this.database.push(...items)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    handleSuccess() {
      this.$emit('success', ...arguments)
      this.handleClose()
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  .title {
    color: map-get($fontColor, slight);
    margin-left: 20px;
    margin-bottom: 20px;
    display: inline-block;
  }
  .item {
    li {
      float: left;
      margin-left: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .img-box {
      display: flex;
      width: 120px;
      height: 70px;
      justify-content: center;
      align-items: center;
      background: rgba(239, 241, 244, 0.2);
      border: 1px solid #dedee4;
      border-radius: 3px;
      cursor: pointer;
      img {
        width: 35%;
      }
      &:hover {
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
      }
      .img-box__mask {
        margin: -1px;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.4);
        .mask-text {
          opacity: 0;
          color: map-get($fontColor, white);
          font-weight: bold;
        }
        &:hover {
          .mask-text {
            opacity: 1;
          }
        }
      }
    }
    .content {
      font-size: 12px;
      margin-top: 5px;
      max-width: 124px;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      overflow: hidden;
    }
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: '';
  }

  .clearfix:after {
    clear: both;
  }

  .clearfix {
    *zoom: 1;
  }
}
::v-deep {
  .ldp-conection-dialog {
    border-radius: 4px;
    .el-dialog__body {
      flex: 1;
      height: 0;
    }
    .el-dialog__body {
      padding: 0;
    }
  }
}
.form__content {
  height: 640px;
}
</style>
