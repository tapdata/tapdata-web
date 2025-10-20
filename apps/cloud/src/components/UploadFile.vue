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

<template>
  <div class="upload-file">
    <input
      ref="file"
      type="file"
      class="visually-hidden opacity-0"
      :accept="accept"
      @change="upload($event)"
    />
    <div @click="clickItem"><slot /></div>
  </div>
</template>
