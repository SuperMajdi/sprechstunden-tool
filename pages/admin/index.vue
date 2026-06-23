<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
// Redirect authenticated admin to slots management
await navigateTo('/admin/slots', { replace: true })
</script>
