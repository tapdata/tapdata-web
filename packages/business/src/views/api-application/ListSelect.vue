<template>
  <AsyncSelect
    v-bind="$attrs"
    v-model:value="form.value"
    :method="getData"
    :current-label="form.label"
    filterable
    @change="handleChange"
  >
  </AsyncSelect>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { AsyncSelect } from '@tap/form'
import { appApi } from '@tap/api'

export default {
  name: 'ListSelect',
  components: { AsyncSelect },
  props: {
    value: {
      type: [String, Number],
    },
    params: {
      type: Object,
      default: () => {
        return {}
      },
    },
    format: {
      type: Function,
    },
  },
  data() {
    return {
      form: {
        label: '',
        value: '',
      },
    }
  },
  watch: {
    value(v) {
      if (this.form.value !== v) {
        this.form.value = v
        this.form.label = this.label
      }
    },
  },
  methods: {
    handleChange(val, opt) {
      const { label } = opt
      this.form.label = label
      $emit(
        this.$emit('update:value', this.form.value).$emit(
          'update:label',
          this.form.label
        ),
        'change',
        val,
        opt
      )
    },

    async getData(filter = {}) {
      const { page, size } = filter
      let params = {
        where: {
          item_type: 'app',
        },
        order: 'createTime DESC',
        limit: size,
        skip: (page - 1) * size,
      }

      const { label } = filter.where || {}
      if (label) {
        Object.assign(params.where, {
          value: label,
        })
      }

      let res = await appApi.get({
        filter: JSON.stringify(Object.assign(params, this.params)),
      })

      res.items = res.items.map((t) => {
        return {
          label: t.value,
          value: t.id,
          data: t,
        }
      })

      if (this.format) {
        res.items = this.format(res.items)
      }

      return res
    },
  },
  emits: ['change', 'update:label', 'update:value'],
}
</script>
