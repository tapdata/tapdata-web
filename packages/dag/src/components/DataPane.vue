<template>
  <ElTable :data="tableData" stripe style="width: 100%" height="100%">
    <ElTableColumn prop="date" :label="$t('packages_dag_components_datapane_riqi')" width="180"> </ElTableColumn>
    <ElTableColumn prop="name" :label="$t('packages_dag_components_datapane_xingming')" width="180"> </ElTableColumn>
    <ElTableColumn prop="address" :label="$t('packages_dag_components_datapane_dizhi')"> </ElTableColumn>
  </ElTable>
</template>

<script>
import i18n from '@tap/i18n'

export default {
  name: 'DataPane',
  data() {
    return {
      tableData: [
        {
          date: '2016-05-02',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-04',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-01',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-03',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-03',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-03',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        },
        {
          date: '2016-05-03',
          name: i18n.global.t('packages_dag_components_datapane_wangxiaohu'),
          address: i18n.global.t('packages_dag_components_datapane_shanghaishiputuo')
        }
      ]
    }
  }
}
</script>
