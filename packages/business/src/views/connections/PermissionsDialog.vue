<template>
  <ElDialog
    :title="$t('packages_business_connections_permissionsdialog_lianjiequanxianshe')"
    width="700px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <SchemaToForm
      ref="schemaToForm"
      :schema="schema"
      :scope="formScope"
      :colon="true"
      class="w-100"
      label-width="120"
    />

    <span slot="footer" class="dialog-footer">
      <ElButton @click="handleClose">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton type="primary" @click="handleSave">{{ $t('public_button_save') }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import { action } from '@formily/reactive'

import { SchemaToForm } from '@tap/form'
import { dataPermissionApi, usersApi } from '@tap/api'
import i18n from '@tap/i18n'

export default {
  name: 'UsedTaskDialog',

  components: { SchemaToForm },

  data() {
    return {
      visible: false,
      row: {},
      formScope: {
        useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },

        async loadRoleList(field, val) {
          try {
            let filter = {
              limit: 1000
            }

            const usedId = val?.map(t => t.roleId) || []

            const { items = [] } = await usersApi.role({
              filter: JSON.stringify(filter)
            })
            return items.map(item => {
              return {
                label: item.name,
                value: item.id,
                disabled: usedId.includes(item.id)
              }
            })
          } catch (e) {
            return []
          }
        }
      },
      schema: {
        type: 'object',
        properties: {
          permissions: {
            type: 'array',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayTable',
            // default: [
            //   {
            //     roleId: '',
            //     checked: []
            //   }
            // ],
            items: {
              type: 'object',
              properties: {
                c1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: i18n.t('packages_business_connections_permissionsdialog_shouquanjuese'),
                    align: 'center',
                    asterisk: false,
                    width: 200
                  },
                  properties: {
                    roleId: {
                      type: 'string',
                      loading: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        filterable: true
                      },
                      'x-reactions': [`{{useAsyncDataSource(loadRoleList, 'dataSource', $values.permissions)}}`]
                    }
                  }
                },
                c2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: i18n.t('packages_business_connections_permissionsdialog_gongnengquanxian'),
                    align: 'center',
                    asterisk: false
                  },
                  properties: {
                    checked: {
                      type: 'array',
                      'x-editable': true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Checkbox.Group',
                      'x-component-props': {
                        class: 'inline-flex flex-wrap',
                        onChange: `{{ () => !!$self.value.length && !$self.value.includes('View') && $self.value.unshift('View') }}`
                      },
                      enum: [
                        {
                          label: i18n.t('public_button_check'),
                          value: 'View',
                          disabled: `{{ $self.value.length > 1 }}`
                        },
                        {
                          label: i18n.t('public_button_edit'),
                          value: 'Edit'
                        },
                        {
                          label: i18n.t('public_button_delete'),
                          value: 'Delete'
                        }
                      ]
                    }
                  }
                },
                c3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    width: 80,
                    title: i18n.t('public_operation'),
                    align: 'center'
                  },
                  properties: {
                    remove: {
                      type: 'void',
                      'x-component': 'ArrayTable.Remove'
                    }
                  }
                }
              }
            },
            properties: {
              addition: {
                type: 'void',
                title: i18n.t('packages_business_connections_permissionsdialog_tianjiashouquan'),
                'x-component': 'ArrayTable.Addition'
              }
            }
          }
        }
      }
    }
  },

  methods: {
    async loadData() {
      const roleList = (await this.formScope.loadRoleList()) || []
      const filter = {
        dataType: 'Connections',
        dataId: this.row.id
      }
      dataPermissionApi.permissions(filter).then((data = []) => {
        const permissions = data
          .map(t => {
            return {
              checked: t.actions,
              roleId: t.typeId
            }
          })
          .filter(t => roleList.some(role => role.value === t.roleId))

        this.$refs.schemaToForm.getForm()?.setValues({
          permissions
        })
      })
    },

    open(row = {}) {
      this.visible = true
      this.row = row
      this.loadData()
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      if (!this.row?.id) {
        return
      }

      const getFormValues = this.$refs.schemaToForm?.getFormValues() || {}
      const filter = {
        dataId: this.row.id,
        dataType: 'Connections',
        actions:
          getFormValues.permissions?.map(t => {
            return {
              type: 'Role',
              typeId: t.roleId,
              actions: t.checked || []
            }
          }) || []
      }
      dataPermissionApi.postPermissions(filter).then(() => {
        this.$message.success(this.$t('public_message_save_ok'))
        this.handleClose()
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
