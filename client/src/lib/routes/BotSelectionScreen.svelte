<script>
    import BackButton from "../BackButton.svelte";
    import { bots } from "../poker-logic/ai/bots";
    import { route } from "../ui-logic/navigation";
    import { botGameState } from "../ui-logic/state";

    let gameState;
    botGameState.subscribe((botGameState) => {
        gameState = botGameState;
    });
</script>

<BackButton action={() => route.set({ route: "Home" })} />
<div class="flex items-center justify-center h-full">
    <div class="gap-2 grid grid-cols-2 grid-rows-2 justify-center items-center">
        {#each bots as bot}
            <button
                on:click={() => {
                    route.set({
                        route: "CharacterCard",
                        props: {
                            botInfo: bot,
                        },
                    });
                }}
                disabled={gameState.bots[bot.id]?.unlocked === false}
            >
                <div class="relative">
                    {#if gameState.bots[bot.id]?.unlocked === false}
                        <i
                            class="fa-solid fa-lock text-white absolute bottom-1/2 right-1/2
                translate-x-1/2 translate-y-1/2 text-3xl z-10"
                        />
                    {/if}
                    <img
                        class="w-24 h-24"
                        class:brightness-0={gameState.bots[bot.id]?.unlocked ===
                            false}
                        src={bot.avatar}
                        alt={bot.name}
                    />
                </div>
            </button>
        {/each}
    </div>
</div>
