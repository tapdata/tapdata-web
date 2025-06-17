<script>
import { connectionsApi } from '@tap/api'
import { InfiniteSelect as AsyncSelect } from '@tap/form/src/components/infinite-select'
import { merge } from 'lodash-es'

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
  mounted() {
    this.form.value = this.value
    this.form.label = this.label
  },
  methods: {
    handleChange(val, opt) {
      const { label } = opt
      this.form.label = label
      this.$emit('update:value', this.form.value)
      this.$emit('update:label', this.form.label)
      this.$emit('change', val, opt)
    },

    async getData(filter = {}) {
      const { page = 1, size = 20 } = filter
      const params = {
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

      const res = await connectionsApi.get({
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
}
</script>

<template>
  <AsyncSelect v-model="form.value" :method="getData" :current-label="label" />
</template>
