<script lang="ts">
    import Button from "./Button.svelte";

    export let action: () => void;
</script>

<Button
    class="absolute top-5 left-5 rounded-md
    h-7 px-2 text-center flex align-center justify-center font-thin text-xs
    gap-2 items-center "
    {action}
>
    <i class="fa-solid fa-arrow-left" /> Back
</Button>
