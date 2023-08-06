<script lang="ts">
    export let label: string;
    export let action: () => void | undefined;
</script>

<button
    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition"
    on:click={action}>{label}</button
>
