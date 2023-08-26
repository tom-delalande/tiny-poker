<script lang="ts">
    import Button from "./Button.svelte";

    export let action: () => void;
</script>

<div
    class="absolute top-5 left-5 text-black bg-neutral-100 rounded-full
    h-7 px-2 text-center flex align-center justify-center"
>
    <Button
        {action}
        class="flex font-thin text-xs justify-center
        items-center gap-2"
    >
        <i class="fa-solid fa-arrow-left" /> Back
    </Button>
</div>
