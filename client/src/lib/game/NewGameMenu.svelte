<script lang="ts">
    import Button from "../Button.svelte";
    import BuyInMenu from "../BuyInMenu.svelte";
    import type { BotInformation } from "../poker-logic/model";
    import { router } from "../ui-logic/navigation";

    export let gameFinished: boolean;
    export let nextHand: () => void;
    export let bot: BotInformation;

    let rebuyMenuShowing = false;
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
            <Button action={() => router.set({ route: "BotSelectionScreen" })}
                >Exit</Button
            >
            {#if rebuyMenuShowing}
                <Button action={() => (rebuyMenuShowing = false)}>Hide</Button>
            {:else}
                <Button action={() => (rebuyMenuShowing = true)}>
                    Play Again</Button
                >
            {/if}
        </div>
    </div>
{:else}
    <Button action={nextHand}>Continue</Button>
{/if}
