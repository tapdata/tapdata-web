<template>
  <AsyncSelect
    v-model="form.value"
    v-bind="$attrs"
    :method="getData"
    :current-label="form.label"
    filterable
    @change="handleChange"
  >
  </AsyncSelect>
</template>

<script>
import { AsyncSelect } from '@tap/form'
import { appApi } from '@tap/api'

export default {
  name: 'ListSelect',

  components: { AsyncSelect },

  props: {
    value: {
      type: [String, Number]
    },
    type: {
      type: String,
      default: 'connection'
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

  mounted() {
    this.form.value = this.value
  },

  methods: {
    handleChange(val, opt) {
      const { label } = opt
      this.form.label = label
      this.$emit('update:value', this.form.value).$emit('update:label', this.form.label).$emit('change', val, opt)
    },

    async getData() {
      const map = {
        connection: this.getConnectionList,
        app: this.getAppList
      }

      return await map[this.type]?.(...arguments)
    },

    async getConnectionList() {},

    async getAppList(filter = {}) {
      const { page, size } = filter
      let params = {
        where: {
          item_type: 'app'
        },
        order: 'createTime DESC',
        limit: size,
        skip: (page - 1) * size
      }

      const { label } = filter.where || {}
      if (label) {
        Object.assign(params.where, {
          'listtags.value': label
        })
      }

      let res = await appApi.get({
        filter: JSON.stringify(Object.assign(params, this.params))
      })

      if (this.format) {
        res.items = this.format(res.items)
      }

      return res
    }
  }
}
</script>
