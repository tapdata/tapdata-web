<template>
  <div>
    <ElRadioGroup v-model="model.mqQueueOrTopic" size="small">
      <ElRadioButton label="Topic" :disabled="model.mqType === '1'">{{
        $t('components_MqQueueOrTopic_zhuTi')
      }}</ElRadioButton>
      <ElRadioButton label="Queue" :disabled="model.mqType === '2'">{{
        $t('components_MqQueueOrTopic_duiLie')
      }}</ElRadioButton>
    </ElRadioGroup>
    <div class="fb-radio-tip mb-8">
      <i class="el-icon-info color-primary"></i
      ><span class="fb-radio-tip__text">{{ $t('components_MqQueueOrTopic_zhuTiHeDuiLie') }}</span>
    </div>
    <ElForm :model="model" ref="kennenform" @submit.native.prevent>
      <ElFormItem
        v-if="model.mqQueueOrTopic === 'Topic'"
        :rules="[
          {
            required: true,
            message: $t('dataForm_form_mq_mqTopicSet') + $t('gl_form_can_not_be_empty'),
            trigger: ['blur', 'change']
          }
        ]"
        prop="mqTopicSet"
      >
        <ElInput v-model="model.mqTopicSet" :placeholder="$t('dataForm_form_mq_mqTopicSet')" size="small"></ElInput>
        <div class="fb-radio-tip">
          <i class="el-icon-info color-primary"></i
          ><span class="fb-radio-tip__text">{{ $t('connection_form_mq_topic_tip') }}</span>
        </div>
      </ElFormItem>
      <ElFormItem
        v-if="model.mqQueueOrTopic === 'Queue'"
        :rules="[
          {
            required: true,
            message: $t('dataForm_form_mq_mqQueueSet') + $t('gl_form_can_not_be_empty'),
            trigger: ['blur', 'change']
          }
        ]"
        prop="mqQueueSet"
      >
        <ElInput v-model="model.mqQueueSet" :placeholder="$t('dataForm_form_mq_mqQueueSet')" size="small"></ElInput>
        <div class="fb-radio-tip">
          <i class="el-icon-info color-primary"></i
          ><span class="fb-radio-tip__text">{{ $t('connection_form_mq_queue_tip') }}</span>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script>
export default {
  name: 'MqQueueOrTopic',
  props: {
    value: {
      type: Object,
      require: true,
      default: () => {}
    }
  },
  data() {
    return {
      model: {
        mqQueueOrTopic: '',
        mqTopicSet: '',
        mqQueueSet: ''
      }
    }
  },
  mounted() {
    this.model = this.value
  },
  watch: {
    'value.mqType'(v) {
      if (v === '1') {
        this.model.mqQueueOrTopic = 'Queue'
      } else if (v === '2') {
        this.model.mqQueueOrTopic = 'Topic'
      }
    }
  },
  methods: {
    validate(callback) {
      this.$refs.kennenform.validate(valid => {
        callback?.(valid)
      })
    }
  }
}
</script>
