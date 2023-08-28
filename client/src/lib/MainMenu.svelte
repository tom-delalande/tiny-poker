<script lang="ts">
    import { Preferences } from "@capacitor/preferences";
    import { router } from "./ui-logic/navigation";
    import { logEvent } from "./analytics/analytics";
    import { onMount } from "svelte";
    import CommonButton from "./CommonButton.svelte";
    import { playAudio } from "./ui-logic/audio";
    import { storeEnabled } from "./config";

    let puzzlesNotified = false;
    function notifyPuzzles() {
        playAudio("playerAction");
        logEvent("feature-vote-changed", {
            preference: "puzzles",
        });
        puzzlesNotified = true;
        tournaments = false;
        bots = false;
        Preferences.set({ key: "NotificationChoice", value: "Puzzles" });
    }

    let tournaments = false;
    function notifyTournaments() {
        playAudio("playerAction");
        logEvent("feature-vote-changed", {
            preference: "tournaments",
        });
        tournaments = true;
        bots = false;
        puzzlesNotified = false;
        Preferences.set({ key: "NotificationChoice", value: "Tournaments" });
    }

    let bots = false;
    function notifyBots() {
        playAudio("playerAction");
        logEvent("feature-vote-changed", {
            preference: "story",
        });
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
        <CommonButton
            action={() => {
                router.set({ route: "BotSelectionScreen" });
            }}
            ><i class="fa-solid fa-robot" /> Play Bots
        </CommonButton>
        {#if storeEnabled}
            <CommonButton
                action={() => {
                    router.set({ route: "Store" });
                }}
                ><i class="fa-solid fa-store" /> Store
            </CommonButton>
        {/if}
        <div
            class="flex flex-col justify-center items-center gap-4
            bg-neutral-200 bg-opacity-50 rounded-md py-5 max-w-md text-center mx-5"
        >
            <p>Coming Soon...</p>
            <div class="grid grid-cols-4 gap-2">
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 disabled:active:scale-100 min-w-max col-span-3"
                    disabled={true}>Puzzles</button
                >
                <button
                    on:click={notifyPuzzles}
                    class="bg-gray-50 p-2 rounded-md active:scale-90 transition"
                    class:bg-green-500={puzzlesNotified}
                    >{#if puzzlesNotified}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-check-to-slot" />
                    {/if}
                </button>
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 disabled:active:scale-100 min-w-max col-span-3"
                    disabled={true}>Tournaments</button
                >
                <button
                    on:click={notifyTournaments}
                    class="bg-gray-50 p-2 rounded-md active:scale-90 transition"
                    class:bg-green-500={tournaments}
                    >{#if tournaments}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-check-to-slot" />
                    {/if}
                </button>
                <button
                    class="px-4 py-2 bg-gray-50 border-2 rounded-md active:scale-90
transition disabled:bg-neutral-300 disabled:active:scale-100 min-w-max col-span-3"
                    disabled={true}>Story Mode</button
                >
                <button
                    on:click={notifyBots}
                    class="bg-gray-50 p-2 rounded-md active:scale-90 transition"
                    class:bg-green-500={bots}
                    >{#if bots}
                        <i class="fa-solid fa-check" />
                    {:else}
                        <i class="fa-solid fa-check-to-slot" />
                    {/if}
                </button>
            </div>
            <p class="px-5">
                Press <i class="fa-solid fa-check-to-slot" /> to vote for a feature
            </p>
        </div>
    </div>
    <div
        class="flex flex-col gap-2 items-center justify-center font-thin
        justify-self-end py-10 italic"
    >
        <p>We'd love to hear what you think</p>
        <div class="flex gap-2 text-sm font-normal items-center justify-center">
            <CommonButton
                action={() => {
                    logEvent("open-discord-button-pressed");
                    window.open("https://discord.gg/yR9uquvCkS", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-brands fa-discord" />Discord</span
                ></CommonButton
            >
            <CommonButton
                action={() => {
                    logEvent("open-email-button-pressed");
                    window.open("mailto:poker@getnada.com", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-solid fa-envelope" />Email</span
                ></CommonButton
            >
        </div>
    </div>
</div>
