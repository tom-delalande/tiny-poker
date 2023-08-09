<script lang="ts">
    import Button from "./Button.svelte";
    export let goToPage: (page: "Game") => void;
</script>

<div
    class="flex flex-col justify-center items-center gap-4 h-full bg-neutral-300"
>
    <h1 class="text-5xl font-thin">Pocket Poker</h1>
    <Button action={() => goToPage("Game")}>Play</Button>
</div>
