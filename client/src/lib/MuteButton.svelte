<script lang="ts">
    import { isAudioEnabled, toggleAudio } from "./ui-logic/audio";
    let muted = isAudioEnabled;
</script>

<div
    class="absolute top-5 right-5 text-black bg-neutral-100 rounded-full w-7
    h-7 text-center flex align-center justify-center text-xs"
>
    <button on:click={() => (muted = toggleAudio())}>
        {#if muted}
            <i class="fa-solid fa-volume-high" />
        {:else}
            <i class="fa-solid fa-volume-xmark" />
        {/if}
    </button>
</div>
