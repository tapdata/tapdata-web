<template>
  <section class="external-storage-wrapper">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click="openDialog()">
          <span>创建外存</span>
        </ElButton>
      </div>
      <ElTableColumn show-overflow-tooltip min-width="180" label="外存名称" prop="name"></ElTableColumn>
      <ElTableColumn show-overflow-tooltip min-width="100" label="外存类型" prop="typeFmt"></ElTableColumn>
      <ElTableColumn show-overflow-tooltip min-width="300" label="外存信息" prop="uri"></ElTableColumn>
      <ElTableColumn show-overflow-tooltip min-width="120" label="创建时间" prop="createTimeFmt"></ElTableColumn>
      <ElTableColumn width="120" :label="$t('column_operation')">
        <template #default="{ row }">
          <!-- <ElButton type="text" :disabled="!row.canEdit" @click="openDialog(row)">{{ $t('button_edit') }}</ElButton>
          <ElDivider direction="vertical"></ElDivider> -->
          <ElButton type="text" :disabled="!row.canDelete" @click="remove(row)">{{ $t('button_delete') }}</ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <ElDialog append-to-body :visible.sync="dialogVisible" :title="form.id ? '编辑外存' : '创建外存'">
      <ElForm class="" ref="form" label-position="left" label-width="120px" size="mini" :model="form" :rules="rules">
        <ElFormItem label="外存名称" prop="name">
          <ElInput v-model="form.name"></ElInput>
        </ElFormItem>
        <ElFormItem required label="外存类型">
          <ElSelect v-model="form.type">
            <ElOption label="MongoDB" value="mongodb"></ElOption>
            <ElOption label="RocksDB" value="rocksdb"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="form.type === 'mongodb'" label="外存表名" prop="table">
          <ElInput v-model="form.table"></ElInput>
        </ElFormItem>
        <ElFormItem label="存储路径" prop="uri">
          <ElInput v-model="form.uri" type="textarea" resize="none"></ElInput>
        </ElFormItem>
        <ElFormItem label="设为默认">
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
        callback(new Error('请输入外存表名称'))
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
        name: [{ required: true, message: '请输入外存名称', trigger: 'blur' }],
        uri: [{ required: true, message: '请输入存储路径', trigger: 'blur' }],
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
      let typeOptions = [{ label: '全部', value: '' }]
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
          placeholder: '请输入名称',
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
      const flag = await this.$confirm('确认删除外存？', '', {
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
