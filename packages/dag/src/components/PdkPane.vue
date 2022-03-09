<template>
  <div class="pdk-pane">
    <SchemaToForm ref="schemaToForm" :schema="schemaData" :colon="true"></SchemaToForm>
  </div>
</template>

<script>
import SchemaToForm from './SchemaToForm'
import { DatabaseTypes } from '@tap/api'
const databaseTypesApi = new DatabaseTypes()

export default {
  name: 'PdkPane',
  props: {
    activeNode: {
      type: Object
    }
  },
  components: { SchemaToForm },
  data() {
    return {
      loading: false,
      schemaData: null
    }
  },
  watch: {
    activeNode: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },
  methods: {
    init() {
      this.getData()
    },
    getData() {
      databaseTypesApi.pdkHash(this.activeNode?.attrs?.pdkHash).then(data => {
        this.schemaData = data?.properties?.node
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pdk-pane {
  padding: 16px;
}
</style>
