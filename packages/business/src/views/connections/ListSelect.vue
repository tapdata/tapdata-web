<template>
  <AsyncSelect
    v-bind="$attrs"
    v-model:value="form.value"
    :method="getData"
    :current-label="form.label"
    @change="handleChange"
  >
  </AsyncSelect>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { merge } from 'lodash-es'
import { AsyncSelect } from '@tap/form'
import { connectionsApi } from '@tap/api'

export default {
  name: 'ListSelect',
  components: { AsyncSelect },
  props: {
    value: {
      type: [String, Number],
    },
    label: {
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
  mounted() {
    this.form.value = this.value
    this.form.label = this.label
  },
  methods: {
    handleChange(val, opt) {
      const { label } = opt
      this.form.label = label
      $emit(this.$emit('update:value', this.form.value).$emit('update:label', this.form.label), 'change', val, opt)
    },

    async getData(filter = {}) {
      const { page = 1, size = 20 } = filter
      let params = {
        order: 'createTime DESC',
        limit: size,
        noSchema: 1,
        skip: (page - 1) * size,
        where: {},
      }

      const { label } = filter.where || {}
      if (label) {
        Object.assign(params.where, {
          name: label,
        })
      }

      let res = await connectionsApi.get({
        filter: JSON.stringify(merge(params, this.params)),
      })

      res.items = res.items.map((t) => {
        return {
          label: t.name,
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
