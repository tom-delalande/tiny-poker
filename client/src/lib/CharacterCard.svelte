<script lang="ts">
    import { onMount } from "svelte";
    import Button from "./Button.svelte";
    import { logEvent } from "./analytics/analytics";
    import type { BotInformation, BotState } from "./poker-logic/model";
    import BackButton from "./BackButton.svelte";
    import { route } from "./ui-logic/navigation";
    import { botGameState } from "./ui-logic/state";

    export let botInfo: BotInformation;

    let botState: BotState;
    botGameState.subscribe((state) => {
        botState = state.bots[botInfo.id];
    });

    export let backEnabled: boolean = true;

    function play() {
        route.set({
            route: "BotsGame",
            props: { bot: botInfo },
        });
    }

    onMount(() => {
        logEvent("character-card-page-opened", {
            botInfo,
            botState,
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
                route.set({
                    route: "BotSelectionScreen",
                })}
        />
    {/if}
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
        <p class="text-center pt-10">
            See if you can use these techniques to win {botState.maxGems} gems.
        </p>
    </div>
    <div>
        <p class="text-center py-5 font-bold">
            {botState.currentGems}/{botState.maxGems}
            <i class="fa-solid fa-gem" />
        </p>
        <Button action={play}>Let's Go</Button>
    </div>
</div>
