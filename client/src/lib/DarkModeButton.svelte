<script lang="ts">
    import Button from "./Button.svelte";
    import { lightMode } from "./ui-logic/state";

    function toggleMode() {
        lightMode.update((prev) => {
            if (prev === "Light") return "Dark";
            return "Light";
        });
    }
</script>

<Button
    class="absolute top-14 right-5  rounded-full w-7
    h-7 text-center flex items-center justify-center text-xs"
    action={toggleMode}
>
    {#if $lightMode === "Light"}
        <i class="fa-solid fa-moon" />
    {:else}
        <i class="fa-solid fa-sun" />
    {/if}
</Button>
