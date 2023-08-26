<script lang="ts">
    import { onMount } from "svelte";
    import { getIsAudioEnabled, toggleAudio } from "./ui-logic/audio";
    import { logEvent } from "./analytics/analytics";
    import Button from "./Button.svelte";
    let muted = true;

    onMount(async () => {
        muted = await getIsAudioEnabled();
    });
</script>

<Button
    class="absolute top-5 right-5 text-black bg-neutral-100 rounded-full w-7
    h-7 text-center flex items-center justify-center text-xs"
    action={async () => {
        muted = await toggleAudio();
        logEvent("mute-button-pressed", {
            muted,
        });
    }}
>
    {#if muted}
        <i class="fa-solid fa-volume-high" />
    {:else}
        <i class="fa-solid fa-volume-xmark" />
    {/if}
</Button>
