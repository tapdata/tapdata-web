<template>
  <VerficationForm
    class="g-panel-container"
    :remoteFunc="remoteFunc"
    :optionsFunc="optionsFunc"
    :dataflowFunc="dataflowFunc"
    :metaDataFunc="metaDataFunc"
    :submitFunc="submitFunc"
  ></VerficationForm>
</template>
<script>
import VerficationForm from 'web-core/views/verification/Form.vue'
export default {
  components: { VerficationForm },
  methods: {
    remoteFunc(params) {
      return this.$axios.get('tm/api/Inspects/findOne', {
        params
      })
    },
    optionsFunc(params) {
      return this.$axios.get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(params)))
    },
    dataflowFunc(params) {
      return this.$axios.get('tm/api/DataFlows/findOne?filter=' + encodeURIComponent(JSON.stringify(params)))
    },
    metaDataFunc(params) {
      return this.$axios.get(
        'tm/api/MetadataInstances/findInspect?filter=' + encodeURIComponent(JSON.stringify(params))
      )
    },
    submitFunc(id, params) {
      return this.$axios[id ? 'patch' : 'post']('tm/api/Inspects', params)
    }
  }
}
</script>
