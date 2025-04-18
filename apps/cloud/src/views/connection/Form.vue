<script setup lang="ts">
import { ConnectionForm } from '@tap/business'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.push({
    name: 'connectionsList',
  })
}
</script>

<template>
  <ConnectionForm @back="handleBack" />
</template>
