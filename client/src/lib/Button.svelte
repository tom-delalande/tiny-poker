<script lang="ts">
    export let label: string;
    export let action: () => void | undefined;
    export let disabled: boolean
</script>

<button
    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 w-24"
    disabled={disabled}
    on:click={action}>{label}</button
>
