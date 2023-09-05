<script lang="ts">
    import BackButton from "../BackButton.svelte";
    import { bots } from "../poker-logic/ai/bots";
    import { router } from "../ui-logic/navigation";
    import type { BotInformation } from "../poker-logic/model";
    import { localHands } from "../ui-logic/state";
    import ChipsGemInfo from "../ChipsGemInfo.svelte";
    import { formatCompactNumber } from "../util/number";
    import Button from "../Button.svelte";

    function selectBot(bot: BotInformation) {
        const hand = $localHands?.hands[bot.id];
        if (hand !== undefined) {
            router.set({
                route: "BotsGame",
                bot,
                startingStack: -1,
            });
        } else {
            router.set({
                route: "CharacterCard",
                bot,
            });
        }
    }
</script>

<BackButton action={() => router.set({ route: "Home" })} />
<ChipsGemInfo />
<div
    class="flex items-center justify-center min-h-full py-24 overflow-scroll
    bg-back"
>
    <div
        class="gap-1 md:gap-2 flex flex-col justify-center items-center
        m-2 w-8/12 max-w-md text-text"
    >
        <h1>Choose your opponent:</h1>
        {#each bots as bot}
            <Button
                class="flex flex-col items-center justify-center
                p-1 rounded-md w-full md:p-2 gap-1"
                action={() => selectBot(bot)}
            >
                <img
                    class="w-10 h-10 md:w-14 md:h-14"
                    src={bot.avatar}
                    alt={bot.name}
                />
                <p>{bot.name}</p>
                {#if bot.buyIn.length > 0}
                    <div>
                        Table stack:
                        <p>
                            {formatCompactNumber(bot.buyIn[0].chips)}
                            <i class="fa-solid fa-coins" />
                            <i class="fa-solid fa-arrow-right" />
                            {formatCompactNumber(
                                bot.buyIn[bot.buyIn.length - 1].chips
                            )}
                            <i class="fa-solid fa-coins" />
                        </p>
                    </div>
                {/if}
            </Button>
        {/each}
    </div>
</div>
