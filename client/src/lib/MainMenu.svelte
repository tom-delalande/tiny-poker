<script lang="ts">
    import { Preferences } from "@capacitor/preferences";
    import Button from "./Button.svelte";
    import { route } from "./ui-logic/navigation";
    export let characterCardSeen = false;

    let puzzlesNotified = false;
    function notifyPuzzles() {
        puzzlesNotified = true;
        tournaments = false;
        bots = false;
        Preferences.set({ key: "NotificationChoice", value: "Puzzles" });
    }

    let tournaments = false;
    function notifyTournaments() {
        tournaments = true;
        bots = false;
        puzzlesNotified = false;
        Preferences.set({ key: "NotificationChoice", value: "Tournaments" });
    }

    let bots = false;
    function notifyBots() {
        bots = true;
        tournaments = false;
        puzzlesNotified = false;
        Preferences.set({ key: "NotificationChoice", value: "Story" });
    }

    Preferences.get({ key: "NotificationChoice" }).then((result) => {
        if (puzzlesNotified || tournaments || bots) return;
        if (result.value === "Puzzles") {
            puzzlesNotified = true;
        }
        if (result.value === "Tournaments") {
            tournaments = true;
        }
        if (result.value === "Story") {
            bots = true;
        }
    });
</script>

<div
    class="flex flex-col justify-center items-center gap-4 h-full bg-neutral-300"
>
    <div class="justify-self-center flex flex-col items-center m-auto gap-6">
        <h1 class="text-5xl font-thin">Tiny Poker</h1>
        <Button
            action={() =>
                characterCardSeen
                    ? route.set("BotsGame")
                    : route.set("CharacterCard")}
            ><i class="fa-solid fa-robot" /> Play Bots
        </Button>
        <div
            class="flex flex-col justify-center items-center gap-4
            bg-neutral-200 rounded-md py-5 max-w-md text-center mx-5"
        >
            <p>Coming Soon...</p>
            <div class="grid grid-cols-4 gap-2">
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 min-w-max col-span-3"
                    disabled={true}>Puzzles</button
                >
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
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 min-w-max col-span-3"
                    disabled={true}>Tournaments</button
                >
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
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 min-w-max col-span-3"
                    disabled={true}>Story Mode</button
                >
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
            <p class="px-5">
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
