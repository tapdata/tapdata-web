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
          label: i18n.t('dfs_guide_scenes_kuayunshujushi'),
          value: 'Real-time synchronization of cross-cloud data'
        },
        {
          label: i18n.t('dfs_guide_scenes_shujurucangjia'),
          value: 'Data warehousing to speed up query'
        },
        {
          label: i18n.t('dfs_guide_scenes_bendishujushang'),
          value: 'Local data to the cloud'
        },
        {
          label: i18n.t('dfs_guide_scenes_yigoushujuku'),
          value: 'Heterogeneous database synchronization'
        },
        {
          label: i18n.t('dfs_guide_scenes_qitachangjing'),
          value: 'other scenes'
        },
        {
          label: i18n.t('dfs_guide_scenes_meiyoutedingde'),
          value: 'no specific needs'
        }
      ]
    }
  }
}
</script>

<template>
  <div class="scenes">
    <div class="flex justify-content-center align-items-center">
      <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    </div>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">{{ $t('dfs_guide_index_qingxuanzeninxiang') }}</div>
    <el-checkbox-group
      class="scenes-wrap flex flex-column mt-4"
      v-model="scenes"
      size="small"
      @change="$emit('handleScenes', scenes)"
    >
      <el-checkbox class="mb-4" v-for="(item, index) in list" :key="index" :label="item.value" border>{{
        item.label
      }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<style scoped lang="scss">
.scenes-wrap {
  ::v-deep {
    .el-checkbox {
      margin-right: 0;
    }
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0;
    }
  }
}
</style>
