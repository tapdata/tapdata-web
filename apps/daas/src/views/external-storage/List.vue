<template>
  <section class="external-storage-wrapper">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click="openDialog()">
          <span{{ $t('daas_external_storage_list_chuangjianwaicun') }}/span>
        </ElButton>
      </div>
      <ElTableColumn
        show-overflow-tooltip
        min-width="180"
        :label="$t('daas_external_storage_list_waicunmingcheng')"
        prop="name"
      ></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="100"
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
      <ElTableColumn width="120" :label="$t('column_operation')">
        <template #default="{ row }">
          <!-- <ElButton type="text" :disabled="!row.canEdit" @click="openDialog(row)">{{ $t('button_edit') }}</ElButton>
          <ElDivider direction="vertical"></ElDivider> -->
          <ElButton type="text" :disabled="!row.canDelete" @click="remove(row)">{{ $t('button_delete') }}</ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <ElDialog
      append-to-body
      :visible.sync="dialogVisible"
      :title="
        form.id ? $t('daas_external_storage_list_bianjiwaicun') : $t('daas_external_storage_list_chuangjianwaicun')
      "
    >
      <ElForm class="" ref="form" label-position="left" label-width="120px" size="mini" :model="form" :rules="rules">
        <ElFormItem :label="$t('daas_external_storage_list_waicunmingcheng')" prop="name">
          <ElInput v-model="form.name"></ElInput>
        </ElFormItem>
        <ElFormItem required :label="$t('daas_external_storage_list_waicunleixing')">
          <ElSelect v-model="form.type">
            <ElOption label="MongoDB" value="mongodb"></ElOption>
            <ElOption label="RocksDB" value="rocksdb"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          v-if="form.type === 'mongodb'"
          :label="$t('daas_external_storage_list_waicunbiaoming')"
          prop="table"
        >
          <ElInput v-model="form.table"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('daas_external_storage_list_cunchulujing')" prop="uri">
          <ElInput v-model="form.uri" type="textarea" resize="none"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('daas_external_storage_list_sheweimoren')">
          <ElSwitch v-model="form.defaultStorage"></ElSwitch>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="dialogVisible = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submit">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>
<script>
import i18n from '@/i18n'

import dayjs from 'dayjs'
import { cloneDeep } from 'lodash'

import { externalStorageApi } from '@tap/api'
import { TablePage } from '@tap/business'
import { FilterBar } from '@tap/component'

export default {
  components: { TablePage, FilterBar },
  data() {
    var checkTable = (rule, value, callback) => {
      if (this.form.type === 'mongodb' && value === '') {
        callback(new Error(i18n.t('daas_external_storage_list_qingshuruwaicun2')))
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
        keyword: ''
      },
      typeMapping: {
        mongodb: 'MongoDB',
        rocksdb: 'RocksDB',
        memory: 'MEM'
      },
      dialogVisible: false,
      form: {},
      rules: {
        name: [{ required: true, message: i18n.t('daas_external_storage_list_qingshuruwaicun'), trigger: 'blur' }],
        uri: [{ required: true, message: i18n.t('daas_external_storage_list_qingshurucunchu'), trigger: 'blur' }],
        table: [{ validator: checkTable, trigger: 'blur' }]
      }
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  created() {
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
    this.getFilterItems()
  },
  methods: {
    getFilterItems() {
      let typeOptions = [{ label: i18n.t('select_option_all'), value: '' }]
      for (const key in this.typeMapping) {
        const label = this.typeMapping[key]
        typeOptions.push({
          label,
          value: key
        })
      }
      this.filterItems = [
        {
          label: this.$t('connection_list_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: typeOptions
        },
        {
          placeholder: i18n.t('daas_data_discovery_previewdrawer_qingshurumingcheng'),
          key: 'keyword', //输入搜索名称
          type: 'input'
        }
      ]
    },
    getData({ page }) {
      let { current, size } = page
      let { type, keyword } = this.searchParams
      let where = {}

      if (keyword && keyword.trim()) {
        where['name'] = { like: keyword, options: 'i' }
      }
      type && (where.type = type)

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return externalStorageApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(item => {
            item.typeFmt = this.typeMapping[item.type] || '-'
            item.createTimeFmt = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') || '-'
            return item
          })
          return {
            total: data?.total,
            data: list
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
            defaultStorage: false
          }
      this.$nextTick(() => {
        this.$refs?.form?.clearValidate()
      })
    },
    submit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true
          let { id, name, type, table, uri, defaultStorage } = this.form
          let params = {
            id,
            name,
            type,
            table,
            uri,
            defaultStorage
          }
          const catchFunc = () => {
            this.loading = false
          }
          if (id) {
            await externalStorageApi.updateById(id, params).catch(catchFunc)
          } else {
            await externalStorageApi.post(params).catch(catchFunc)
          }
          this.table.fetch()
          this.dialogVisible = false
          this.loading = false
        }
      })
    },
    async remove(row) {
      const flag = await this.$confirm(i18n.t('daas_external_storage_list_querenshanchuwai'), '', {
        type: 'warning',
        showClose: false
      })
      if (flag) {
        await externalStorageApi.delete(row.id)
        this.table.fetch()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.external-storage-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>
