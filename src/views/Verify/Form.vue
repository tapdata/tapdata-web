<template>
  <VerficationForm
    class="verify-form-wrapper"
    :remoteFunc="remoteFunc"
    :optionsFunc="optionsFunc"
    :dataflowFunc="dataflowFunc"
    :metaDataFunc="metaDataFunc"
    :submitFunc="submitFunc"
  ></VerficationForm>
</template>
<style lang="scss" scoped>
.verify-form-wrapper {
  background: #fff;
}
</style>
<script>
import VerficationForm from 'web-core/views/verification/Form'
export default {
  components: { VerficationForm },
  methods: {
    remoteFunc(params) {
      return this.$axios.get('tm/api/Inspects/findOne', {
        params
      })
    },
    optionsFunc(params) {
      return this.$axios.get('tm/api/DataFlows', {
        params
      })
    },
    dataflowFunc(params) {
      return this.$axios.get('tm/api/DataFlows/findOne', {
        params
      })
    },
    metaDataFunc(params) {
      return this.$axios.get('tm/api/MetadataInstances', {
        params
      })
    },
    submitFunc(id, params) {
      return this.$axios[id ? 'patch' : 'post']('tm/api/Inspects', params)
    }
  }
}
</script>
