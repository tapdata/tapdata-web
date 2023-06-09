<template>
  <ElDialog
    :title="$t('packages_business_components_fielddialog_zidingyiziduan')"
    :visible="visible"
    :append-to-body="true"
    width="1200px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <div v-if="visible">
      <div class="mb-4">
        <ElInput
          class="search-input"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('packages_business_components_fieldbox_qingshuruziduan')"
          clearable
        ></ElInput>
      </div>
      <div class="position-relative">
        <div class="list-table__header flex justify-content-between">
          <span>{{ $t('packages_business_components_fieldbox_ziduan') }}</span>
          <ElButton type="text" class="ml-4 color-primary" @click="handleAdd">
            <VIcon> plus</VIcon>{{ $t('packages_business_components_fieldbox_tianjiahang') }}</ElButton
          >
        </div>
        <div v-loading="loading">
          <DynamicScroller
            :items="getFilterList()"
            :min-item-size="46"
            ref="virtualScroller"
            key-field="id"
            class="list-table__content scroller h-100"
          >
            <template #default="{ item: fItem, index: fIndex, active }">
              <DynamicScrollerItem
                :item="fItem"
                :active="active"
                :data-index="fIndex"
                :size-dependencies="[fItem.id, fItem.source, fItem.target]"
              >
                <div class="list-table__line flex pt-3 align-items-center">
                  <span class="px-2">{{ fIndex + 1 }}</span>
                  <VirtualSelect
                    v-model="fItem.source"
                    :item-size="30"
                    :items="sourceFields"
                    :class="['flex-fill', { 'empty-data': !fItem.source }]"
                    :allow-create="sourceDynamicSchema"
                    :placeholder="
                      sourceDynamicSchema ? $t('packages_business_select_placeholder') : $t('public_select_placeholder')
                    "
                    filterable
                    class="flex-fill"
                  />
                  <VirtualSelect
                    v-model="fItem.target"
                    :item-size="34"
                    :items="targetFields"
                    :class="['flex-fill ml-5', { 'empty-data': !fItem.target }]"
                    :allow-create="targetDynamicSchema"
                    :placeholder="
                      targetDynamicSchema ? $t('packages_business_select_placeholder') : $t('public_select_placeholder')
                    "
                    filterable
                  />
                  <ElButton type="text" class="mx-2 px-2 color-primary" @click="handleDelete(fIndex)">
                    <VIcon> delete</VIcon>
                  </ElButton>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </div>
    </div>
    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton size="mini" type="primary" @click="handleSave">{{ $t('public_button_save') }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

import i18n from '@tap/i18n'
import { appApi, metadataInstancesApi } from '@tap/api'
import { VirtualSelect } from '@tap/component'
import { cloneDeep } from 'lodash'

export default {
  name: 'FieldDialog',

  components: { DynamicScroller, DynamicScrollerItem, VirtualSelect },

  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      index: '',
      keyword: '',
      sourceFields: [],
      targetFields: [],
      sourceDynamicSchema: false,
      targetDynamicSchema: false,
      dynamicSchemaMap: {}
    }
  },

  methods: {
    async loadList(item) {
      const source = item.source.columns || []
      const target = item.target.columns || []

      if (source?.length) {
        let list = []
        source.forEach((el, i) => {
          list.push({
            source: el,
            target: target[i]
          })
        })
        this.list = list.filter(t => t.source || t.target)
        return
      }

      // 加载目标的字段
      const params = {
        nodeId: item.target.nodeId,
        tableFilter: item.target.table,
        page: 1,
        pageSize: 1
      }
      this.loading = true
      const nodeSchemaPage = await metadataInstancesApi.nodeSchemaPage(params)
      let fieldMap = {}
      const nodeSchemaPageFields = nodeSchemaPage.items?.[0]?.fields || []
      nodeSchemaPageFields.forEach(t => {
        fieldMap[t.original_field_name] = t.field_name
      })

      this.sourceFields =
        cloneDeep(
          item.source?.fields?.map(t => {
            return {
              id: t.id,
              key: t.id,
              label: t.original_field_name,
              value: t.original_field_name,
              field_name: t.original_field_name,
              primary_key_position: t.primaryKeyPosition
            }
          })
        ) || []
      this.targetFields =
        cloneDeep(
          item.target?.fields.map(t => {
            return {
              id: t.id,
              key: t.id,
              label: t.original_field_name,
              value: t.original_field_name,
              field_name: t.original_field_name,
              primary_key_position: t.primaryKeyPosition
            }
          })
        ) || []

      let sourceList = this.sourceFields
      let targetList = this.targetFields.map(t => {
        t.used = false
        return t
      })

      let list = Object.keys(fieldMap).map(t => {
        return {
          source: t,
          target: fieldMap[t]
        }
      })

      // sourceList未匹配的字段，独立一行
      list.push(
        ...sourceList
          .filter(t => !fieldMap[t.value])
          .map(t => {
            return {
              source: t.value,
              target: ''
            }
          })
      )

      // targetList未匹配的字段，独立一行
      list.push(
        ...targetList
          .filter(t => !Object.values(fieldMap).includes(t.value))
          .map(t => {
            return {
              source: '',
              target: t.value
            }
          })
      )

      this.list = list
      this.loading = false
    },

    open(item = {}, index, dynamicSchemaMap = {}) {
      this.index = index
      const { source, target } = dynamicSchemaMap
      this.sourceDynamicSchema = source
      this.targetDynamicSchema = target
      this.loadList(item)
      this.visible = true
    },

    getItem() {
      return {
        source: '',
        target: ''
      }
    },

    handleAdd() {
      this.list.unshift(this.getItem())
    },

    handleDelete(index) {
      this.list.splice(index, 1)
    },

    getFilterList() {
      const { keyword } = this
      return this.list
        .filter(t => (t.source + t.target).toLowerCase().includes(keyword.toLowerCase()))
        .map(t => {
          t.id = t.source + t.target
          return t
        })
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      if (this.list.some(t => !t.source || !t.target)) {
        this.$message.error(i18n.t('packages_business_components_fielddialog_ziduanbuyunxu'))
        return
      }
      this.$emit('save', cloneDeep(this.list), this.index)
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  &.empty-data {
    ::v-deep {
      .el-input__inner {
        border-color: #d44d4d;
      }
    }
  }
}

.list-table__content {
  max-height: 450px;
}
</style>
