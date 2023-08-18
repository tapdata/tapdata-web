<template>
  <div class="h-100">
    <div class="bg-white rounded-lg p-6">
      <!--什么是实时数据中心?-->
      <div class="mb-6">
        <div class="text-lg font-color-dark fw-sub mb-4">{{ $t('packages_ldp_data_hub_intro_title') }}</div>
        <div class="border rounded-lg p-4 flex gap-4 align-center">
          <div class="lh-base flex-1">
            <p class="mb-4">{{ $t('packages_ldp_data_hub_intro_desc1') }}</p>
            <p>{{ $t('packages_ldp_data_hub_intro_desc2') }}</p>
          </div>
          <div style="width: 218px" class="flex-shrink-0">
            <ElImage :src="require('@/assets/image/data_hub_banner.png')"></ElImage>
          </div>
        </div>
      </div>

      <!--哪些应用场景可以使用实时数据中心?-->
      <div class="mb-6">
        <div class="text-lg font-color-dark fw-sub mb-4">{{ $t('packages_ldp_data_hub_intro_scene_title') }}</div>
        <div class="flex gap-4 align-center">
          <div class="lh-base flex-1 border rounded-lg p-4 text-center flex flex-column gap-4 align-center">
            <ElImage class="img-sm" :src="require('@/assets/image/single-view.svg')"></ElImage>
            <div class="font-color-dark fs-6 fw-sub text-center">
              {{ $t('packages_ldp_data_hub_intro_scene_single_view') }}
            </div>
            <div>{{ $t('packages_ldp_data_hub_intro_scene_single_view_sub') }}</div>
          </div>
          <div class="lh-base flex-1 border rounded-lg p-4 text-center flex flex-column gap-4 align-center">
            <ElImage class="img-sm" :src="require('@/assets/image/realtime.svg')"></ElImage>
            <div class="font-color-dark fs-6 fw-sub text-center">
              {{ $t('packages_ldp_data_hub_intro_scene_realtime') }}
            </div>
            <div>{{ $t('packages_ldp_data_hub_intro_scene_realtime_sub') }}</div>
          </div>
          <div class="lh-base flex-1 border rounded-lg p-4 text-center flex flex-column gap-4 align-center">
            <ElImage class="img-sm" :src="require('@/assets/image/api.svg')"></ElImage>
            <div class="font-color-dark fs-6 fw-sub text-center">
              {{ $t('packages_ldp_data_hub_intro_scene_api') }}
            </div>
            <div>{{ $t('packages_ldp_data_hub_intro_scene_single_view_sub') }}</div>
          </div>
        </div>
      </div>

      <!--实时数据中心是如何工作的?-->
      <div class="mb-6">
        <div class="text-lg font-color-dark fw-sub mb-4">{{ $t('packages_ldp_data_hub_intro_how_do') }}</div>
        <div class="flex gap-3 border rounded-lg px-6 py-4">
          <div class="lh-base flex-1 flex gap-2">
            <div class="step-icon rounded-circle text-primary fs-6 fw-sub text-center flex-shrink-0">1</div>
            <div>
              <div class="font-color-dark fs-6 fw-sub mb-1">
                {{ $t('packages_ldp_data_hub_intro_how_do_step1') }}
              </div>
              <div>{{ $t('packages_ldp_data_hub_intro_how_do_step1_sub') }}</div>
            </div>
          </div>
          <ElDivider class="h-auto" direction="vertical"></ElDivider>
          <div class="lh-base flex-1 flex gap-2">
            <div class="step-icon rounded-circle text-primary fs-6 fw-sub text-center flex-shrink-0">2</div>
            <div>
              <div class="font-color-dark fs-6 fw-sub mb-1">
                {{ $t('packages_ldp_data_hub_intro_how_do_step2') }}
              </div>
              <div>{{ $t('packages_ldp_data_hub_intro_how_do_step2_sub') }}</div>
            </div>
          </div>
          <ElDivider class="h-auto" direction="vertical"></ElDivider>
          <div class="lh-base flex-1 flex gap-2">
            <div class="step-icon rounded-circle text-primary fs-6 fw-sub text-center flex-shrink-0">3</div>
            <div>
              <div class="font-color-dark fs-6 fw-sub mb-1">
                {{ $t('packages_ldp_data_hub_intro_how_do_step3') }}
              </div>
              <div>{{ $t('packages_ldp_data_hub_intro_how_do_step3_sub') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <p class="font-color-sslight mb-2 flex align-center gap-1 justify-center">
          <VIcon>info</VIcon>{{ $t('dfs_offline_deployment_tip') }}
        </p>
        <ElButton
          v-if="!isDomesticStation"
          @click="$router.push({ name: 'CreateStorage' })"
          type="primary"
          size="large"
          >{{ $t('packages_ldp_data_hub_subscribe') }}</ElButton
        >
        <ElButton v-else @click="openOfflineDeployment" type="primary" size="large">{{
          $t('dfs_offline_deployment_get')
        }}</ElButton>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Intro',
  data() {
    const isDomesticStation = window.__config__?.station === 'domestic' //默认是国内站 国际站是 international

    return {
      isDomesticStation
    }
  },

  methods: {
    openOfflineDeployment() {
      window.open('https://tapdata.net/tapdata-on-prem/demo.html')
    }
  }
}
</script>

<style lang="scss" scoped>
.img-sm {
  width: 48px;
  height: 48px;
}

.step-icon {
  width: 32px;
  height: 32px;
  line-height: 32px;
  background: #eef6ff;
}
</style>
