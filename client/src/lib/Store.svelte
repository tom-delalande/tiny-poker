<script lang="ts">
    import BackButton from "./BackButton.svelte";
    import Button from "./Button.svelte";
    import ChipsGemInfo from "./ChipsGemInfo.svelte";
    import CommonButton from "./CommonButton.svelte";
    import {
        makePurchase,
        productData,
        products,
        restorePurchases,
    } from "./purchase/purchase";
    import { router } from "./ui-logic/navigation";
    import { gameState } from "./ui-logic/state";

    function purchase(gems: number) {
        gameState.update((prev) => {
            prev.gems += gems;
            return prev;
        });
    }

    const data = products
        .map((alias) => productData[alias])
        .filter((it) => it != undefined);
</script>

<ChipsGemInfo />
<div
    class="flex flex-col items-center gap-2
    p-2 min-h-full justify-center"
>
    <BackButton
        action={() =>
            router.set({
                route: "Home",
            })}
    />
    {#if data.length === 0}
        There are currently no gems for sale...
    {:else}
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {#each data as product}
                <Button
                    action={() => makePurchase(product.productId)}
                    class="p-4 rounded-md bg-gray-50 flex flex-col items-center
            gap-4 w-48 justify-around"
                >
                    <div>{product.name}</div>
                    <div class="text-3xl">
                        {product.gems} <i class="fa-solid fa-gem" />
                    </div>
                    <div>
                        {#if product.previousPrice}
                            <div
                                class="line-through
                            text-neutral-500"
                            >
                                {product.previousPrice}
                            </div>
                        {/if}
                        <div class="">{product.price}</div>
                    </div>
                </Button>
            {/each}
        </div>
        <CommonButton action={restorePurchases}>Restore Purchase</CommonButton>
    {/if}
</div>
