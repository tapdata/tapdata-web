<template>
  <VerficationForm
    :remoteFunc="remoteFunc"
    :optionsFunc="optionsFunc"
    :dataflowFunc="dataflowFunc"
    :metaDataFunc="metaDataFunc"
    :submitFunc="submitFunc"
  ></VerficationForm>
</template>

<script>
import VerficationForm from 'web-core/views/verification/form.vue'
export default {
  components: { VerficationForm },
  methods: {
    remoteFunc(params) {
      return this.$api('Inspects')
        .findOne(params)
        .then(res => res.data)
    },
    optionsFunc(params) {
      return this.$api('DataFlows')
        .get(params)
        .then(res => res.data)
    },
    dataflowFunc(params) {
      return this.$api('DataFlows')
        .findOne(params)
        .then(res => res.data)
    },
    metaDataFunc(params) {
      return this.$api('MetadataInstances')
        .get(params)
        .then(res => res.data)
    },
    submitFunc(id, params) {
      this.$api('Inspects')
        [id ? 'patch' : 'post'](params)
        .then(res => res.data)
    }
  }
}
</script>
