<template>
  <section class="external-storage-wrapper">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template v-slot:search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        >
        </FilterBar>
      </template>
      <template v-slot:operation>
        <div>
          <ElButton
            class="btn btn-create"
            type="primary"
            size="mini"
            @click="openDialog()"
          >
            <span>{{ $t('daas_external_storage_list_chuangjianwaicun') }}</span>
          </ElButton>
        </div>
      </template>
      <ElTableColumn
        show-overflow-tooltip
        min-width="180"
        :label="$t('daas_external_storage_list_waicunmingcheng')"
        prop="name"
      >
        <template #default="{ row }">
          <ElLink
            style="display: inline"
            type="primary"
            @click.stop="checkDetails(row)"
            >{{ row.name }}</ElLink
          >
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="150"
        :label="$t('daas_external_storage_list_waicunleixing')"
        prop="typeFmt"
      ></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="300"
        :label="$t('daas_external_storage_list_waicunxinxi')"
        prop="uri"
      ></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="120"
        :label="$t('column_create_time')"
        prop="createTimeFmt"
      ></ElTableColumn>
      <ElTableColumn width="220" :label="$t('column_operation')">
        <template #default="{ row }">
          <span class="mr-2">{{
            $t('daas_external_storage_list_sheweimoren')
          }}</span>
          <ElSwitch
            type="text"
            v-model:value="row.defaultStorage"
            :disabled="row.defaultStorage"
            @change="handleDefault(row)"
          ></ElSwitch>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            type="text"
            :disabled="!row.canDelete"
            @click="remove(row)"
            >{{ $t('button_delete') }}</ElButton
          >
        </template>
      </ElTableColumn>
    </TablePage>
    <ElDialog
      append-to-body
      v-model:visible="dialogVisible"
      :title="
        form.id
          ? $t('daas_external_storage_list_bianjiwaicun')
          : $t('daas_external_storage_list_chuangjianwaicun')
      "
    >
      <ElForm
        class=""
        ref="form"
        label-position="left"
        :label-width="labelWidth"
        size="mini"
        :model="form"
        :rules="rules"
      >
        <ElFormItem
          :label="$t('daas_external_storage_list_waicunmingcheng')"
          prop="name"
        >
          <ElInput v-model:value="form.name"></ElInput>
        </ElFormItem>
        <ElFormItem
          required
          :label="$t('daas_external_storage_list_waicunleixing')"
        >
          <ElSelect v-model:value="form.type">
            <ElOption label="MongoDB" value="mongodb"></ElOption>
            <ElOption label="RocksDB" value="rocksdb"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          :label="$t('daas_external_storage_list_cunchulujing')"
          prop="uri"
        >
          <ElInput
            v-model:value="form.uri"
            :placeholder="
              form.type === 'mongodb'
                ? 'Example: mongodb://admin:password@127.0.0.1:27017/mydb?replicaSet=xxx&authSource=admin'
                : 'Example: /xxx/xxx'
            "
            type="textarea"
            resize="none"
          ></ElInput>
        </ElFormItem>
        <ElFormItem
          v-if="form.type === 'mongodb'"
          :label="$t('daas_external_storage_list_waicunbiaoming')"
          required
          prop="table"
        >
          <ElInput v-model:value="form.table"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('daas_external_storage_list_sheweimoren')">
          <ElSwitch v-model:value="form.defaultStorage"></ElSwitch>
        </ElFormItem>
      </ElForm>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton size="mini" @click="dialogVisible = false">{{
            $t('button_cancel')
          }}</ElButton>
          <ElButton type="primary" size="mini" @click="submit">{{
            $t('button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
    <Drawer class="shared-cache-details" v-model:visible="isShowDetails">
      <div v-if="details.id" class="shared-cache-details--header flex pb-3">
        <div class="img-box">
          <VIcon class="icon">text</VIcon>
        </div>
        <div class="flex-fill ml-4 overflow-hidden">
          <div class="fs-6 ellipsis">{{ details.name }}</div>
        </div>
      </div>
      <ul class="mt-2">
        <li v-for="item in info" :key="item.label" class="drawer-info__item">
          <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
          <div class="body ml-4">
            <label class="label">{{ item.label }}</label>
            <p class="value mt-2">{{ item.value || '-' }}</p>
          </div>
        </li>
      </ul>
    </Drawer>
  </section>
</template>

<script>
import i18n from '@/i18n'

import dayjs from 'dayjs'
import { cloneDeep } from 'lodash'
import { toRegExp } from '@tap/shared'

import { externalStorageApi } from '@tap/api'
import { TablePage } from '@tap/business'
import { FilterBar, Drawer } from '@tap/component'

export default {
  components: { TablePage, FilterBar, Drawer },
  data() {
    var checkTable = (rule, value, callback) => {
      if (this.form.type === 'mongodb' && value === '') {
        callback(
          new Error(i18n.t('daas_external_storage_list_qingshuruwaicun2'))
        )
      } else {
        callback()
      }
    }
    return {
      loading: false,
      filterItems: [],
      order: 'createAt DESC',
      searchParams: {
        type: '',
        keyword: '',
      },
      typeMapping: {
        mongodb: 'MongoDB',
        rocksdb: 'RocksDB',
        memory: 'MEM',
      },
      dialogVisible: false,
      form: {},
      rules: {
        name: [
          {
            required: true,
            message: i18n.t('daas_external_storage_list_qingshuruwaicun'),
            trigger: 'blur',
          },
        ],
        uri: [
          {
            required: true,
            message: i18n.t('daas_external_storage_list_qingshurucunchu'),
            trigger: 'blur',
          },
        ],
        table: [{ validator: checkTable, trigger: 'blur' }],
      },
      isShowDetails: false,
      details: '',
      info: [],
      labelWidth: '120px',
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    },
  },
  created() {
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
    this.getFilterItems()
    const { locale } = this.$i18n
    this.labelWidth = locale === 'en' ? '220px' : '120px'
  },
  methods: {
    getFilterItems() {
      let typeOptions = [{ label: i18n.t('select_option_all'), value: '' }]
      for (const key in this.typeMapping) {
        const label = this.typeMapping[key]
        typeOptions.push({
          label,
          value: key,
        })
      }
      this.filterItems = [
        {
          label: this.$t('connection_list_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: typeOptions,
        },
        {
          placeholder: i18n.t(
            'daas_data_discovery_previewdrawer_qingshurumingcheng'
          ),
          key: 'keyword', //输入搜索名称
          type: 'input',
        },
      ]
    },
    getData({ page }) {
      let { current, size } = page
      let { type, keyword } = this.searchParams
      let where = {}

      if (keyword && keyword.trim()) {
        where.name = { like: toRegExp(keyword), options: 'i' }
      }
      type && (where.type = type)

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return externalStorageApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          let list = (data?.items || []).map((item) => {
            const regResult =
              /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
                item.uri
              )
            if (regResult && regResult.groups && regResult.groups.password) {
              const { username, host, database, query } = regResult.groups
              item.uri = `mongodb://${username}:***@${host}/${database}${
                query ? '/' + query : ''
              }`
            }
            item.typeFmt = this.typeMapping[item.type] || '-'
            item.createTimeFmt =
              dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') || '-'
            return item
          })
          return {
            total: data?.total,
            data: list,
          }
        })
    },
    openDialog(row) {
      this.dialogVisible = true
      this.form = row
        ? cloneDeep(row)
        : {
            name: '',
            type: 'mongodb',
            table: '',
            uri: '',
            defaultStorage: false,
          }
      this.$nextTick(() => {
        this.$refs?.form?.clearValidate()
      })
    },
    submit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          let { id, name, type, table, uri, defaultStorage } = this.form
          let params = {
            id,
            name,
            type,
            table,
            uri,
            defaultStorage,
          }
          const catchFunc = () => {
            this.loading = false
          }
          if (id) {
            await externalStorageApi
              .updateById(id, params)
              .then(() => {
                this.table.fetch()
                this.dialogVisible = false
                this.loading = false
              })
              .catch(catchFunc)
          } else {
            await externalStorageApi
              .post(params)
              .then(() => {
                this.table.fetch()
                this.dialogVisible = false
                this.loading = false
              })
              .catch(catchFunc)
          }
        }
      })
    },
    handleDefault(row) {
      externalStorageApi.changeExternalStorage(row.id).then(() => {
        this.$message.success(i18n.t('message_operation_succuess'))
        this.table.fetch()
      })
    },
    async remove(row) {
      const flag = await this.$confirm(
        i18n.t('daas_external_storage_list_querenshanchuwai'),
        '',
        {
          type: 'warning',
          showClose: false,
        }
      )
      if (flag) {
        await externalStorageApi.delete(row.id)
        this.table.fetch()
      }
    },
    checkDetails(row) {
      this.details = row
      this.info = [
        //{ label: this.$t('daas_external_storage_list_waicunmingcheng'), value: row.name, icon: 'createUser' },
        {
          label: this.$t('daas_external_storage_list_waicunleixing'),
          value: row.typeFmt,
          icon: 'name',
        },
        {
          label: this.$t('daas_external_storage_list_waicunbiaoming'),
          value: row.table,
          icon: 'table',
        },
        {
          label: this.$t('column_create_time'),
          value: row.createTimeFmt,
          icon: 'cacheTimeAtFmt',
        },
        {
          label: this.$t('daas_external_storage_list_cunchulujing'),
          value: row.uri,
          icon: 'database',
        },
        {
          label: this.$t('daas_external_storage_list_sheweimoren'),
          value: row.defaultStorage,
          icon: 'record',
        },
      ]
      this.isShowDetails = true
    },
  },
}
</script>

<style lang="scss" scoped>
.external-storage-wrapper {
  height: 100%;
  overflow: hidden;
}
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: map-get($color, danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: $fontBaseTitle;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: $fontBaseTitle;
      color: map-get($fontColor, dark);
    }
  }
}
</style>
