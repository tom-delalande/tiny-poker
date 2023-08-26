<script lang="ts">
    import { onMount } from "svelte";
    import { logEvent } from "./analytics/analytics";
    import type { BotInformation, BuyInOption } from "./poker-logic/model";
    import BackButton from "./BackButton.svelte";
    import { router } from "./ui-logic/navigation";
    import { gameState } from "./ui-logic/state";
    import BuyInMenu from "./BuyInMenu.svelte";
    import ChipsGemInfo from "./ChipsGemInfo.svelte";

    export let botInfo: BotInformation;
    export let backEnabled: boolean = true;

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
    <ChipsGemInfo />
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
    <BuyInMenu bot={botInfo} />
</div>
