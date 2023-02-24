<template>
  <el-dialog
    :title="$t('connection_form_creat_connection')"
    :visible="dialogVisible"
    :append-to-body="true"
    width="848px"
    custom-class="connection-dialog"
    :before-close="handleClose"
  >
    <ConnectionTypeSelector
      :loading="loading"
      :types="database"
      :otherTypes="otherType"
      :large="true"
      @select="databaseType"
    ></ConnectionTypeSelector>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { databaseTypesApi } from '@tap/api'
import { ConnectionTypeSelector } from '@tap/business'

export default {
  name: 'DatasourceDialog',
  components: {
    ConnectionTypeSelector
  },
  props: {
    dialogVisible: {
      required: true,
      value: Boolean
    },
    allwoType: {
      value: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      database: [],
      otherType: [],
      loading: true
    }
  },
  watch: {
    dialogVisible(v) {
      if (v) {
        this.getDatabaseType()
      }
    }
  },
  created() {
    this.getDatabaseType()
  },
  methods: {
    handleClose() {
      $emit(this, 'dialogVisible', false)
      $emit(this, 'update:dialogVisible', false)
    },
    databaseType(item) {
      $emit(this, 'databaseType', item)
    },
    getDatabaseType() {
      databaseTypesApi
        .get()
        .then(data => {
          if (data) {
            let items = data?.filter(t => !this.database.length || !this.database.some(d => d.pdkHash === t.pdkHash))
            if (!items.length) {
              return
            }
            this.database.push(...items)
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  emits: ['dialogVisible', 'update:dialogVisible', 'databaseType']
}
</script>

<style lang="scss" scoped>
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
      background: map-get($bgColor, normal);
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
  .connection-dialog {
    .el-dialog__body {
      padding: 0 20px 30px 20px;
    }
  }
}
</style>
