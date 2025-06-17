<script>
import { appApi } from '@tap/api'
import { InfiniteSelect as AsyncSelect } from '@tap/form/src/components/infinite-select'

export default {
  name: 'ListSelect',
  components: { AsyncSelect },
  props: {
    value: {
      type: [String, Number],
    },
    label: {
      type: String,
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
    value: {
      handler(v) {
        this.form.value = v
        this.form.label = this.label
      },
      immediate: true,
    },
  },
  methods: {
    handleChange(opt) {
      const { label } = opt
      this.form.label = label
      this.$emit('update:value', this.form.value)
      this.$emit('update:label', this.form.label)
      this.$emit('change', this.form.value, opt)
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
    lazy
    @option-select="handleChange"
  />
</template>
