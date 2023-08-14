<script lang="ts">
    import bot1Avatar from "./../assets/bot-1-avatar.png";
    import Button from "./Button.svelte";

    export let wonChips: number;
    export let characterIntroSeen: boolean;
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

        <h2 class="font-bold pt-5 self-start">Tips to Beat "Easygoing" Tim:</h2>
        <ol class="list-decimal ml-10">
            <li>
                <b>Hand Selection:</b> Play strong starting hands against Tim's wide
                range.
            </li>
            <li>
                <b>Value Betting:</b> Bet confidently with strong hands for maximum
                value.
            </li>
            <li>
                <b>Minimize Bluffing:</b> Tim is likely to call with weaker hands,
                so use bluffs selectively.
            </li>
            <li>
                <b>Control Pot Size:</b> Build the pot when you have a strong hand.
            </li>
            <li>
                <b>Positional Advantage:</b> Exploit your position to control the
                betting pace. value.
            </li>
            <li>
                <b>Hand Reading:</b> Observe Tim's showdowns to understand his tendencies.
            </li>
        </ol>
        <p class="text-center pt-10">
            See if you can use these techniques to win 500 chips from Tim
        </p>
    </div>
    <div>
        <p class="text-center py-5 font-bold">
            {wonChips}/500
            <i class="fa-solid fa-diamond" />
        </p>
        <Button action={close}
            >{#if characterIntroSeen} Close {:else}Let's Go{/if}</Button
        >
    </div>
</div>
