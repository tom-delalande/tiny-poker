<script lang="ts">
    import Button from "../Button.svelte";
    import BuyInMenu from "../BuyInMenu.svelte";
    import type { BotInformation } from "../poker-logic/model";
    import { router } from "../ui-logic/navigation";

    export let gameFinished: boolean;
    export let nextHand: () => void;
    export let bot: BotInformation;
</script>

{#if gameFinished}
    <div class="flex flex-col items-center gap-4">
        <BuyInMenu {bot} />
        <Button action={() => router.set({ route: "BotSelectionScreen" })}
            >Exit</Button
        >
    </div>
{:else}
    <Button action={nextHand}>Continue</Button>
{/if}
