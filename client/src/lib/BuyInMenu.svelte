<script lang="ts">
    import { createInitalHandState } from "./poker-logic/hand";
    import type { BotInformation, BuyInOption } from "./poker-logic/model";
    import { router } from "./ui-logic/navigation";
    import { gameState, localHands, updateHandForBot } from "./ui-logic/state";

    export let bot: BotInformation;
    let notEnoughFundsError = false;
    let notEnoughFundsIndex = -1;

    function play(buyIn: BuyInOption, index: number) {
        let chipsCost = buyIn.chipsCost;
        let gemsCost = buyIn.gemsCost;

        if (
            ($gameState.chips < buyIn.chipsCost ||
                $gameState.gems < buyIn.gemsCost) &&
            buyIn.free === true
        ) {
            chipsCost = 0;
            gemsCost = 0;
        }

        notEnoughFundsError = false;
        notEnoughFundsIndex = -1;
        if ($gameState.chips < chipsCost || $gameState.gems < gemsCost) {
            notEnoughFundsError = true;
            notEnoughFundsIndex = index;
            return;
        }

        gameState.update((prev) => {
            prev.chips = Math.max(0, prev.chips - chipsCost);
            prev.gems = Math.max(0, prev.gems - gemsCost);
            return prev;
        });
        const initialPlayers = [
            {
                isCurrentPlayer: true,
                stack: buyIn.chips,
            },
            {
                isCurrentPlayer: false,
                stack: bot.buyIn[bot.buyIn.length - 1].chips,
                botId: bot.id,
            },
        ];
        updateHandForBot(bot.id, createInitalHandState(initialPlayers, 0));
        router.set({
            route: "BotsGame",
            startingStack: buyIn.chips,
            bot: bot,
        });
    }
</script>

<div class="flex flex-col items-center gap-4">
    Pick your starting stack:
    <div class="flex gap-2">
        {#each bot.buyIn as buyIn, index}
            <div class="flex flex-col items-center">
                <button
                    on:click={() => play(buyIn, index)}
                    class="bg-neutral-200 rounded-md p-1 pb-2 gap-2 flex
                        flex-col border-solid border-2 w-28 min-w-fit
                    items-center"
                    class:border-red-500={index === notEnoughFundsIndex}
                >
                    <div
                        class="flex gap-2 bg-purple-200 rounded-md p-1
                        justify-center w-full"
                    >
                        {#if buyIn.free && $gameState.chips === 0}
                            Free
                        {:else}
                            <div class="flex flex-col">
                                <div class="text-purple-800">Fee</div>
                                <div class="flex gap-1">
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
                    <div class="flex gap-1 items-center">
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
