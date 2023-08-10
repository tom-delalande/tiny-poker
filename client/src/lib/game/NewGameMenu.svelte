<script lang="ts">
    import Button from "../Button.svelte";

    export let gameFinished: boolean;
    export let playAgain: () => void;
</script>

<Button action={playAgain}
    >{#if gameFinished}
        New Game
    {:else}
        Continue
    {/if}
</Button>
