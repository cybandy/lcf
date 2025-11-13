<script setup lang='ts'>
useHead({
    title: 'Dev Page'
})
const permissions = usePermissions()
</script>

<template>
  <pre>
    {{ permissions.getUserPermissions() }}
    {{ permissions.can(permissions.FellowshipPermission.CREATE_EVENTS) }}
    {{ permissions.userIsAdmin.value }}
    {{ permissions.userIsPastor.value }}
    {{ permissions.currentUser.value }}

    {{ permissions.FellowshipPermission }}
  </pre>
</template>