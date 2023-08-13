<script lang="ts">
    import Button from "./Button.svelte";
    export let goToPage: (page: "CharacterCard" | "Ranked") => void;
    export let characterCardSeen = false;

    let puzzlesNotified = false;
    function notifyPuzzles() {
        puzzlesNotified = true;
        tournaments = false;
        bots = false;
    }

    let tournaments = false;
    function notifyTournaments() {
        tournaments = true;
        bots = false;
        puzzlesNotified = false;
    }

    let bots = false;
    function notifyBots() {
        bots = true;
        tournaments = false;
        puzzlesNotified = false;
    }
</script>

<div
    class="flex flex-col justify-center items-center gap-4 h-full bg-neutral-300"
>
    <div class="justify-self-center flex flex-col items-center m-auto gap-6">
        <h1 class="text-5xl font-thin">Tiny Poker</h1>
        <Button
            action={() =>
                characterCardSeen
                    ? goToPage("Ranked")
                    : goToPage("CharacterCard")}
            ><i class="fa-solid fa-robot" /> Play Bots
        </Button>
        <div
            class="flex flex-col justify-center items-center gap-4
            bg-neutral-200 rounded-md p-5 max-w-md text-center"
        >
            <p>Coming Soon...</p>
            <div>
                <Button action={() => {}} disabled={true}>Puzzles</Button>
                <button
                    on:click={notifyPuzzles}
                    class="bg-gray-50 p-2 rounded-md transition-all"
                    class:bg-green-500={puzzlesNotified}
                    >{#if puzzlesNotified}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-bell" />
                    {/if}
                </button>
            </div>
            <div>
                <Button action={() => {}} disabled={true}>Tournaments</Button>
                <button
                    on:click={notifyTournaments}
                    class="bg-gray-50 p-2 rounded-md transition-all"
                    class:bg-green-500={tournaments}
                    >{#if tournaments}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-bell" />
                    {/if}
                </button>
            </div>
            <div>
                <Button action={() => {}} disabled={true}>More Bots</Button>
                <button
                    on:click={notifyBots}
                    class="bg-gray-50 p-2 rounded-md transition-all"
                    class:bg-green-500={bots}
                    >{#if bots}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-bell" />
                    {/if}
                </button>
            </div>
            <p>
                Press <i class="fa-solid fa-bell" /> to enter the early access waitlist
                for one feature.
            </p>
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
