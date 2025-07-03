<script>
import { metadataInstancesApi } from '@tap/api'
import i18n from '@tap/i18n'
import { cloneDeep } from 'lodash-es'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

export default {
  name: 'FieldDialog',
  components: { DynamicScroller, DynamicScrollerItem },
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  emits: ['save'],
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
      dynamicSchemaMap: {},
    }
  },
  methods: {
    async loadList(item = {}) {
      const source = item.source?.columns || []
      const target = item.target?.columns || []

      if (source?.length) {
        const list = []
        source.forEach((el, i) => {
          list.push({
            source: el,
            target: target[i],
          })
        })
        this.list = list.filter((t) => t.source || t.target)
        return
      }

      if (!item.target.nodeId) {
        this.loading = true
        this.sourceFields = await this.getFields(
          item.source.table,
          item.source.connectionId,
        )
        this.targetFields = await this.getFields(
          item.target.table,
          item.target.connectionId,
        )

        const list = this.sourceFields.map((el) => {
          const findTarget =
            this.targetFields.find((t) => t.value === el.value) || {}
          findTarget.used = true
          return {
            source: el.value,
            target: findTarget.value || '',
          }
        })

        list.push(
          ...this.targetFields
            .filter((t) => !t.used)
            .map((t) => ({ source: '', target: t.value })),
        )
        this.list = list
        this.loading = false
        return
      }

      // 加载目标的字段
      const params = {
        nodeId: item.target.nodeId,
        tableFilter: item.target.table,
        page: 1,
        pageSize: 1,
      }
      this.loading = true
      const nodeSchemaPage = await metadataInstancesApi.nodeSchemaPage(params)
      const sourceNodeSchemaPage = await metadataInstancesApi.nodeSchemaPage({
        nodeId: item.source.nodeId,
        tableFilter: item.source.table,
        page: 1,
        pageSize: 1,
      })
      const fieldMap = {}
      const nodeSchemaPageFields = nodeSchemaPage.items?.[0]?.fields || []
      nodeSchemaPageFields.forEach((t) => {
        fieldMap[t.original_field_name] = t.field_name
      })

      this.sourceFields = cloneDeep(
        (sourceNodeSchemaPage.items?.[0]?.fields || []).map((t) => {
          return {
            id: t.id,
            key: t.id,
            label: t.original_field_name,
            value: t.original_field_name,
            field_name: t.original_field_name,
            primary_key_position: t.primary_key_position,
          }
        }),
      )

      this.targetFields = cloneDeep(
        nodeSchemaPageFields.map((t) => {
          return {
            id: t.id,
            key: t.id,
            label: t.field_name,
            value: t.field_name,
            field_name: t.field_name,
            primary_key_position: t.primary_key_position,
          }
        }),
      )

      const sourceList = this.sourceFields
      const targetList = this.targetFields.map((t) => {
        t.used = false
        return t
      })

      const list = Object.keys(fieldMap).map((t) => {
        return {
          source: t,
          target: fieldMap[t],
        }
      })

      // sourceList未匹配的字段，独立一行
      list.push(
        ...sourceList
          .filter((t) => !fieldMap[t.value])
          .map((t) => {
            return {
              source: t.value,
              target: t.value,
            }
          }),
      )

      // targetList未匹配的字段，独立一行
      list.push(
        ...targetList
          .filter((t) => !Object.values(fieldMap).includes(t.value))
          .map((t) => {
            return {
              source: t.value,
              target: t.value,
            }
          }),
      )

      this.list = list
      this.loading = false
    },

    open(item = {}, index, dynamicSchemaMap = {}) {
      this.index = index
      const { source = false, target = false } = dynamicSchemaMap
      this.sourceDynamicSchema = source
      this.targetDynamicSchema = target
      this.loadList(item)
      this.visible = true
    },

    getItem() {
      return {
        source: '',
        target: '',
      }
    },

    handleAdd() {
      this.list.unshift(this.getItem())
    },

    handleDelete(index) {
      this.list.splice(index, 1)
    },

    getFilterList() {
      const k = this.keyword.toLowerCase()
      const arr = cloneDeep(this.list)
      return arr
        .filter((t) => (t.source + t.target).toLowerCase().includes(k))
        .map((t, i) => {
          t.id = `${t.source}_${t.target}_${i}`
          return t
        })
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      if (this.list.some((t) => !t.source || !t.target)) {
        this.$message.error(
          i18n.t('packages_business_components_fielddialog_ziduanbuyunxu'),
        )
        return
      }
      this.$emit('change', cloneDeep(this.list), this.index)
      this.handleClose()
    },

    async getFields(table, connectionId) {
      const targetMetadataInstances = await metadataInstancesApi.tapTables({
        filter: JSON.stringify({
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            original_name: table,
            'source._id': connectionId,
          },
          limit: 1,
        }),
      })

      return Object.values(
        targetMetadataInstances.items[0]?.nameFieldMap || {},
      ).map((t) => {
        return {
          id: t.id,
          label: t.fieldName,
          value: t.fieldName,
          field_name: t.fieldName,
          primary_key_position: t.primaryKey,
        }
      })
    },
  },
}
</script>

<template>
  <ElDialog
    :title="$t('packages_business_components_fielddialog_zidingyiziduan')"
    :model-value="visible"
    :append-to-body="true"
    width="1200px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <div v-if="visible">
      <div class="mb-4">
        <ElInput
          v-model="keyword"
          class="search-input"
          prefix-icon="el-icon-search"
          :placeholder="
            $t('packages_business_components_fieldbox_qingshuruziduan')
          "
          clearable
        />
      </div>
      <div class="position-relative">
        <div class="list-table__header flex justify-content-between">
          <span>{{ $t('packages_business_components_fieldbox_ziduan') }}</span>
          <ElButton text class="ml-4 color-primary" @click="handleAdd">
            <VIcon> plus</VIcon
            >{{
              $t('packages_business_components_fieldbox_tianjiahang')
            }}</ElButton
          >
        </div>
        <div v-loading="loading">
          <DynamicScroller
            ref="virtualScroller"
            :items="getFilterList()"
            :min-item-size="46"
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
                <div
                  v-memo="[fItem.id, fItem.source, fItem.target]"
                  class="list-table__line flex pt-3 align-items-center"
                >
                  <div class="line__index mr-2 text-center">
                    {{ fIndex + 1 }}
                  </div>
                  <ElSelectV2
                    v-model="fItem.source"
                    :item-size="30"
                    :options="sourceFields"
                    :class="['flex-fill', { 'empty-data': !fItem.source }]"
                    :allow-create="sourceDynamicSchema"
                    :placeholder="
                      sourceDynamicSchema
                        ? $t('packages_business_select_placeholder')
                        : $t('public_select_placeholder')
                    "
                    filterable
                    class="flex-fill"
                  />
                  <ElSelectV2
                    v-model="fItem.target"
                    :item-size="34"
                    :options="targetFields"
                    :class="['flex-fill ml-5', { 'empty-data': !fItem.target }]"
                    :allow-create="targetDynamicSchema"
                    :placeholder="
                      targetDynamicSchema
                        ? $t('packages_business_select_placeholder')
                        : $t('public_select_placeholder')
                    "
                    filterable
                  />
                  <ElButton
                    text
                    class="mx-2 px-2 color-primary"
                    @click="handleDelete(fIndex)"
                  >
                    <VIcon>delete</VIcon>
                  </ElButton>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" @click="handleSave">{{
          $t('public_button_save')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.el-select {
  &.empty-data {
    :deep(.el-input__inner) {
      border-color: #d44d4d;
    }
  }
}
.list-table__content {
  max-height: 450px;
}
.line__index {
  width: 36px;
}
</style>
