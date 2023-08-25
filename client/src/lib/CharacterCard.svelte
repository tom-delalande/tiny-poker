<script lang="ts">
    import { onMount } from "svelte";
    import { logEvent } from "./analytics/analytics";
    import type { BotInformation, BuyInOption } from "./poker-logic/model";
    import BackButton from "./BackButton.svelte";
    import { router } from "./ui-logic/navigation";
    import { gameState } from "./ui-logic/state";

    export let botInfo: BotInformation;
    export let backEnabled: boolean = true;

    let notEnoughFundsError = false;
    let notEnoughFundsIndex = -1;

    function play(buyIn: BuyInOption, index: number) {
        notEnoughFundsError = false;
        notEnoughFundsIndex = -1;
        if (
            $gameState.chips < buyIn.chipsCost ||
            $gameState.gems < buyIn.gemsCost
        ) {
            notEnoughFundsError = true;
            notEnoughFundsIndex = index;
            return;
        }

        gameState.update((prev) => {
            prev.chips = Math.max(0, prev.chips - buyIn.chipsCost);
            prev.gems = Math.max(0, prev.chips - buyIn.gemsCost);
            return prev;
        });
        router.set({
            route: "BotsGame",
            bot: botInfo,
            startingStack: buyIn.chips,
        });
    }

    onMount(() => {
        logEvent("character-card-page-opened", {
            botInfo,
        });
    });
</script>

<div
    class="flex flex-col items-center justify-around gap-2
    p-2 min-h-full max-w-md m-auto"
>
    {#if backEnabled}
        <BackButton
            action={() =>
                router.set({
                    route: "BotSelectionScreen",
                })}
        />
    {/if}
    <div class="absolute top-14 left-5">
        {$gameState.chips} <i class="fa-solid fa-coins" />
        {$gameState.gems} <i class="fa-solid fa-gem" />
    </div>

    <div class="flex items-center justify-center flex-col">
        <img class="w-24 h-24" src={botInfo.avatar} alt="Avatar" />
        <p>{botInfo.name}</p>
    </div>

    <div class="mx-5 flex flex-col items-center">
        <h2 class="font-bold text-md self-start">Play-style:</h2>
        <p>
            {botInfo.description}
        </p>

        <h2 class="font-bold pt-5 self-start">Tips:</h2>
        <ol class="list-decimal ml-10">
            {#each botInfo.tips as tip}
                <li>{tip}</li>
            {/each}
        </ol>
    </div>
    <div class="flex flex-col items-center gap-4">
        Pick your starting stack:
        <div class="flex gap-2">
            {#each botInfo.buyIn as buyIn, index}
                <div class="flex flex-col items-center">
                    <button
                        on:click={() => play(buyIn, index)}
                        class="bg-neutral-200 rounded-md p-1 pb-2 gap-2 flex
                        flex-col border-solid border-2 w-28"
                        class:border-red-500={index === notEnoughFundsIndex}
                    >
                        <div
                            class="flex gap-2 bg-purple-200 rounded-md p-2
                        justify-center"
                        >
                            {#if buyIn.chipsCost === 0 && buyIn.gemsCost === 0}
                                Free
                            {:else}
                                <div class="flex flex-col">
                                    <div class="text-purple-800">Fee</div>
                                    <div class="flex gap-2">
                                        <div class="">
                                            {buyIn.chipsCost}
                                            <i class="fa-solid fa-coins" />
                                        </div>
                                        <div>
                                            {buyIn.gemsCost}
                                            <i class="fa-solid fa-gem" />
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <div>
                            {buyIn.chips}<i class="fa-solid fa-coins" />
                        </div>
                    </button>
                </div>
            {/each}
        </div>
        {#if notEnoughFundsError}
            <div class="text-red-500 text-center">
                You do not have enough funds to select this starting stack.
            </div>
        {/if}
    </div>
</div>
