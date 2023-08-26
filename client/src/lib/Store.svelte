<script lang="ts">
    import BackButton from "./BackButton.svelte";
    import Button from "./Button.svelte";
    import ChipsGemInfo from "./ChipsGemInfo.svelte";
    import { router } from "./ui-logic/navigation";
    import { gameState } from "./ui-logic/state";

    function purchase(gems: number) {
        gameState.update((prev) => {
            prev.gems += gems;
            return prev;
        });
    }
</script>

<ChipsGemInfo />
<div
    class="flex flex-col items-center gap-2
    p-2 min-h-full justify-center"
>
    <BackButton
        action={() =>
            router.set({
                route: "BotSelectionScreen",
            })}
    />
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Button
            action={() => purchase(5)}
            class="p-4 rounded-md bg-gray-50 flex flex-col items-center
            gap-4 w-48 justify-around"
        >
            <div>Starter</div>
            <div class="text-3xl">
                5 <i class="fa-solid fa-gem" />
            </div>
            <div>
                <div class="line-through text-neutral-500">$5</div>
                <div class="">$0.99</div>
            </div>
        </Button>
        <Button
            action={() => purchase(20)}
            class="p-4 rounded-md bg-gray-50 flex flex-col items-center
            gap-4 w-48 justify-around"
        >
            <div>Two Pair</div>
            <div class="text-3xl">
                20 <i class="fa-solid fa-gem" />
            </div>
            <div>$20</div>
        </Button>
        <Button
            action={() => purchase(100)}
            class="p-4 rounded-md bg-gray-50 flex flex-col items-center
            gap-4 w-48 justify-around"
        >
            <div>Royal Flush</div>
            <div class="text-3xl">
                100 <i class="fa-solid fa-gem" />
            </div>
            <div>$100</div>
        </Button>
    </div>
    <Button action={() => {}}>Restore Purchase</Button>
</div>
