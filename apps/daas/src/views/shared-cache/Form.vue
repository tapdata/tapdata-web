<template>
  <section class="shared-cache-form">
    <ElForm>
      <ElFormItem prop="name" :label="$t('shared_cache_name')">
        <ElInput v-model="form.name"></ElInput>
      </ElFormItem>
      <ElFormItem prop="cacheKeys" :label="$t('shared_cache_keys')">
        <ElInput v-model="form.cacheKeys"></ElInput>
      </ElFormItem>
      <ElFormItem prop="connectionId" :label="$t('column_connection')">
        <ElInput v-model="form.connectionId"></ElInput>
      </ElFormItem>
      <ElFormItem prop="tableName" :label="$t('column_table')">
        <ElInput v-model="form.tableName"></ElInput>
      </ElFormItem>
      <ElFormItem prop="fields" :label="$t('shared_cache_fields')">
        <ElInput v-model="form.fields"></ElInput>
      </ElFormItem>
      <ElFormItem prop="maxRows" :label="$t('shared_cache_max_rows')">
        <ElInput v-model="form.maxRows"></ElInput>
      </ElFormItem>
      <ElFormItem prop="ttl" :label="$t('shared_cache_ttl')">
        <ElInput v-model="form.ttl"></ElInput>
      </ElFormItem>
      <ElFormItem prop="ttl" :label="$t('shared_cache_ttl')"> </ElFormItem>
    </ElForm>
  </section>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        cacheKeys: '',
        connectionId: '',
        tableName: '',
        fields: '',
        maxRows: 10000,
        ttl: 7
      }
    }
  },
  methods: {
    submit() {}
  }
}
</script>
