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
<div class="flex items-center justify-center h-full">
    <div
        class="gap-2 flex flex-col justify-center items-center
        m-2 w-8/12 max-w-md h-full"
    >
        {#each bots as bot}
            <Button
                class="flex flex-col items-center justify-center bg-gray-50
                p-2 rounded-md w-full"
                action={() => selectBot(bot)}
            >
                <img class="w-14 h-14" src={bot.avatar} alt={bot.name} />
                <p>{bot.name}</p>
                {#if bot.buyIn.length > 0}
                    <p>
                        {formatCompactNumber(bot.buyIn[0].chips)}
                        <i class="fa-solid fa-coins" />
                        <i class="fa-solid fa-arrow-right" />
                        {formatCompactNumber(
                            bot.buyIn[bot.buyIn.length - 1].chips
                        )}
                        <i class="fa-solid fa-coins" />
                    </p>
                {/if}
            </Button>
        {/each}
    </div>
</div>
