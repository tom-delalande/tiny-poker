<script lang="ts">
    import type { BotInformation, BuyInOption } from "./poker-logic/model";
    import { router } from "./ui-logic/navigation";
    import { gameState } from "./ui-logic/state";

    export let bot: BotInformation;
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
            bot: bot,
            startingStack: buyIn.chips,
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
                        flex-col border-solid border-2 w-28 min-w-fit"
                    class:border-red-500={index === notEnoughFundsIndex}
                >
                    <div
                        class="flex gap-2 bg-purple-200 rounded-md p-1
                        justify-center"
                    >
                        {#if buyIn.chipsCost === 0 && buyIn.gemsCost === 0}
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
