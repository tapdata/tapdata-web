<template>
  <div class="scenes h-100 flex flex-column">
    <div class="flex justify-content-center align-items-center">
      <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    </div>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      {{ $t('dfs_guide_index_qingxuanzeninxiang') }}
    </div>
    <el-checkbox-group
      class="scenes-wrap flex flex-column overflow-auto gap-4 flex-1 min-h-0 pr-2"
      :model-value="scenes"
      size="small"
      @input="$emit('handleScenes', $event)"
    >
      <el-checkbox v-for="(item, index) in list" :key="index" :label="item.value" border>{{ item.label }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import { VIcon } from '@tap/component'
import i18n from '@/i18n'

export default {
  name: 'Account',
  components: { VIcon },
  props: ['scenes'],
  data() {
    return {
      list: [
        {
          label: i18n.t('dfs_guide_scenes_1'),
          value: 'MDB-MV'
        },
        {
          label: i18n.t('dfs_guide_scenes_2'),
          value: 'DB-REP'
        },
        {
          label: i18n.t('dfs_guide_scenes_3'),
          value: 'DB-SYNC'
        },
        {
          label: i18n.t('dfs_guide_scenes_4'),
          value: 'DB-KAFKA'
        },
        {
          label: i18n.t('dfs_guide_scenes_5'),
          value: 'QUERY-ACC'
        },
        {
          label: i18n.t('dfs_guide_scenes_6'),
          value: 'CLOUD-MOVE'
        },
        {
          label: i18n.t('dfs_guide_scenes_7'),
          value: 'CENTRAL-STORE'
        },
        {
          label: i18n.t('dfs_guide_scenes_8'),
          value: 'EXPLORE'
        }
      ]
    }
  },
  emits: ['handleScenes']
}
</script>

<style lang="scss" scoped>
.scenes-wrap {
  :deep(.el-checkbox) {
    margin-right: 0;
  }

  :deep(.el-checkbox.is-bordered + .el-checkbox.is-bordered) {
    margin-left: 0;
  }

  :deep(.el-checkbox.is-bordered.el-checkbox--small .el-checkbox__label) {
    line-height: 20px;
  }
}
</style>
