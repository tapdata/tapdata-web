<template>
  <div class="upload-file">
    <input
      ref="file"
      type="file"
      class="visually-hidden opacity-0"
      @change="upload($event)"
      :accept="accept"
    />
    <div @click="clickItem"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: 'UploadFile',
  props: {
    accept: {
      type: String,
    },
    upload: {
      type: Function,
    },
  },
  methods: {
    clickItem() {
      this.$refs.file.click()
    },
  },
}
</script>
