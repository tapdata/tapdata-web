<template>
  <div class="pdk-pane">
    <SchemaToForm ref="schemaToForm" :schema="schemaData" :colon="true"></SchemaToForm>
  </div>
</template>

<script>
import SchemaToForm from './SchemaToForm'
import { DatabaseTypes } from '@tap/api'
import { mapGetters } from 'vuex'
const databaseTypesApi = new DatabaseTypes()

export default {
  name: 'PdkPane',
  props: {
    scope: {}
  },
  components: { SchemaToForm },
  data() {
    return {
      loading: false,
      schemaData: null
    }
  },
  computed: {
    ...mapGetters('dataflow', ['activeNode']),
    pdkHash() {
      return this.activeNode?.attrs?.pdkHash
    }
  },
  watch: {
    pdkHash: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getData()
    },
    getData() {
      databaseTypesApi.pdkHash(this.pdkHash).then(data => {
        // TODO node
        this.schemaData = data?.properties?.connection
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pdk-pane {
  padding: 16px;
}
.scheme-to-form {
  width: 320px;
}
</style>
