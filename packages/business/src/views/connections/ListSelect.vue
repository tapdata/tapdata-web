<template>
  <AsyncSelect
    v-model="form.value"
    v-bind="$attrs"
    :method="getData"
    :current-label="form.label"
    @change="handleChange"
  >
  </AsyncSelect>
</template>

<script>
import { AsyncSelect } from '@tap/form'
import { connectionsApi } from '@tap/api'

export default {
  name: 'ListSelect',

  components: { AsyncSelect },

  props: {
    value: {
      type: [String, Number]
    },
    label: {
      type: [String, Number]
    },
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    format: {
      type: Function
    }
  },

  data() {
    return {
      form: {
        label: '',
        value: ''
      }
    }
  },

  watch: {
    value(v) {
      if (this.form.value !== v) {
        this.form.value = v
        this.form.label = this.label
      }
    }
  },

  mounted() {
    this.form.value = this.value
    this.form.label = this.label
  },

  methods: {
    handleChange(val, opt) {
      const { label } = opt
      this.form.label = label
      this.$emit('update:value', this.form.value).$emit('update:label', this.form.label).$emit('change', val, opt)
    },

    async getData(filter = {}) {
      const { page = 1, size = 20 } = filter
      console.log('getData', filter, page, size)
      let params = {
        order: 'createTime DESC',
        limit: size,
        noSchema: 1,
        skip: (page - 1) * size,
        where: {}
      }

      const { label } = filter.where || {}
      if (label) {
        Object.assign(params.where, {
          value: label
        })
      }
      console.log('ooo', Object.assign(params, this.params))
      let res = await connectionsApi.get({
        filter: JSON.stringify(Object.assign(params, this.params))
      })

      console.log('res', res)

      res.items = res.items.map(t => {
        return {
          label: t.name,
          value: t.id,
          data: t
        }
      })

      console.log(' res.items', res.items)

      if (this.format) {
        res.items = this.format(res.items)
      }

      return res
    }
  }
}
</script>
