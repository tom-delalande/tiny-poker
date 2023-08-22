<script lang="ts">
    import { onMount } from "svelte";
    import bot1Avatar from "./../assets/bot-1-avatar.png";
    import Button from "./Button.svelte";
    import { logEvent } from "./analytics/analytics";

    onMount(() => {
        logEvent("character-card-page-opened", {
            botName: 'Tim "Easygoing" Thompson',
            characterIntroSeen,
            wonChips,
        });
    });

    export let wonChips: number;
    export let characterIntroSeen: boolean;
    export let targetGems: number;
    export let close: () => void;
</script>

<div
    class="flex flex-col items-center justify-around gap-2
    p-2 min-h-full max-w-md m-auto"
>
    <div class="flex items-center justify-center flex-col">
        <img class="w-24 h-24" src={bot1Avatar} alt="Bot 1 Avatar" />
        <p>Tim "Easygoing" Thompson</p>
    </div>

    <div class="mx-5 flex flex-col items-center">
        <h2 class="font-bold text-md self-start">Play-style:</h2>
        <p>
            Tim's play-style is loose and passive. He rarely folds and prefers
            to call and check rather than raise. He enjoys seeing flops and
            relies on luck rather than aggressive tactics.
        </p>

        <h2 class="font-bold pt-5 self-start">Tips:</h2>
        <ol class="list-decimal ml-10">
            <li>Play strong starting hands against Tim's wide range.</li>
            <li>Bet confidently with strong hands for maximum value.</li>
        </ol>
        <p class="text-center pt-10">
            See if you can use these techniques to win {targetGems} gems from Tim
        </p>
    </div>
    <div>
        <p class="text-center py-5 font-bold">
            {wonChips}/{targetGems}
            <i class="fa-solid fa-gem" />
        </p>
        <Button action={close}
            >Let's Go</Button
        >
    </div>
</div>
