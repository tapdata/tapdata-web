<script>
import { appApi } from '@tap/api'
import { AsyncSelect } from '@tap/form'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

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
  emits: ['change', 'update:label', 'update:value'],
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
    handleChange(opt) {
      const { label } = opt
      this.form.label = label
      $emit(
        this.$emit('update:value', this.form.value).$emit(
          'update:label',
          this.form.label,
        ),
        'change',
        val,
        opt,
      )
    },

    async getData(filter = {}) {
      const { page, size } = filter
      const params = {
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

      const res = await appApi.get({
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
}
</script>

<template>
  <AsyncSelect
    v-bind="$attrs"
    v-model="form.value"
    :method="getData"
    :current-label="form.label"
    filterable
    @option-select="handleChange"
  />
</template>
