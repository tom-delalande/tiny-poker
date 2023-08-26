<script lang="ts">
    import Button from "../Button.svelte";
    import BuyInMenu from "../BuyInMenu.svelte";
    import CommonButton from "../CommonButton.svelte";
    import type { BotInformation } from "../poker-logic/model";
    import { router } from "../ui-logic/navigation";
    import { updateHandForBot } from "../ui-logic/state";

    export let gameFinished: boolean;
    export let nextHand: () => void;
    export let bot: BotInformation;

    let rebuyMenuShowing = false;
    function exit() {
        router.set({ route: "BotSelectionScreen" });
        updateHandForBot(bot.id, undefined);
    }
</script>

{#if gameFinished}
    <div class="flex flex-col items-center gap-4">
        {#if rebuyMenuShowing}
            <div
                class="absolute bottom-36 bg-neutral-300 p-4 border-2
            border-neutral-500 rounded-md bg-opacity-90"
            >
                <BuyInMenu {bot} />
            </div>
        {/if}
        <div class="flex gap-2">
            <CommonButton action={exit}>Exit</CommonButton>
            {#if rebuyMenuShowing}
                <CommonButton action={() => (rebuyMenuShowing = false)}
                    >Hide</CommonButton
                >
            {:else}
                <CommonButton action={() => (rebuyMenuShowing = true)}>
                    Play Again</CommonButton
                >
            {/if}
        </div>
    </div>
{:else}
    <CommonButton action={nextHand}>Continue</CommonButton>
{/if}
