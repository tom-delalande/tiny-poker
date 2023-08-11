<script lang="ts">
    import Button from "./Button.svelte";
    export let goToPage: (page: "Game" | "Ranked") => void;
    export let currentRank: number | undefined;
</script>

<div
    class="flex flex-col justify-center items-center gap-4 h-full bg-neutral-300"
>
    <div class="justify-self-center flex flex-col items-center m-auto gap-6">
        <h1 class="text-5xl font-thin">Tiny Poker</h1>
        <Button action={() => goToPage("Ranked")}
            ><i class="fa-solid fa-robot" /> Play Bots
        </Button>
        <div class="flex flex-col justify-center items-center gap-4
            bg-neutral-200 rounded-md p-5">
            <p>Coming Soon...</p>
            <Button action={() => {}} disabled={true}>Puzzles</Button>
            <Button action={() => {}} disabled={true}>Ring Game</Button>
            <Button action={() => {}} disabled={true}>Tournament</Button>
        </div>
    </div>
    <div
        class="flex flex-col gap-2 items-center justify-center font-thin
        justify-self-end py-10 italic"
    >
        <p>We'd love to hear what you think</p>
        <div class="flex gap-2 text-sm font-normal items-center justify-center">
            <Button
                action={() => {
                    window.open("https://discord.gg/yR9uquvCkS", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-brands fa-discord" />Discord</span
                ></Button
            >
            <Button
                action={() => {
                    window.open("mailto:poker@getnada.com", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-solid fa-envelope" />Email</span
                ></Button
            >
        </div>
    </div>
</div>
