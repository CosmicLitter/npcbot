<script lang="ts">
    import Navigation from '$lib/Components/Navigation.svelte';
	export let data
</script>

<!-- Layout -->
<div class="grid grid-cols-[auto_1fr] space-x-2">
    
    <!-- Navigation Panel -->
   <Navigation slug={data.slug} />
   
    <!-- Main Page slotted -->
    <div class="border border-surface-500">
        <!-- <p>Navigation store holds: {navigation}</p> -->
        {#key data.slug}
            <slot />
        {/key}
    </div>

</div>
