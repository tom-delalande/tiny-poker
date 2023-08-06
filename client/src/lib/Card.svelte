<script lang="ts">
    export let suit: "Hearts" | "Spades" | "Clubs" | "Diamonds" | "Hidden";
    export let value: number;
</script>

<div
    class="rounded-full border-2 bg-neutral-400 w-16 h-16 text-2xl flex items-center
    justify-center gap-1 text-white relative"
>
    {#if suit === "Hidden"}
        <i class="fa-solid fa-eye-slash" />
    {:else}
        <div class="text-2xl">
            {#if value < 10}
                <i class="fa-solid fa-{value}" />
            {/if}
            {#if value === 10}
                <div class="flex">
                    <i class="fa-solid fa-1" />
                    <i class="fa-solid fa-0" />
                </div>
            {/if}
            {#if value === 11}
                <i class="fa-solid fa-chess-bishop" />
            {/if}
            {#if value === 12}
                <i class="fa-solid fa-chess-queen" />
            {/if}
            {#if value === 13}
                <i class="fa-solid fa-chess-king" />
            {/if}
        </div>
        <div class="text-xl top-0 right-0 absolute">
            {#if suit === "Hearts"}
                <i class="fa-solid fa-heart text-red-400" />
            {/if}
            {#if suit === "Diamonds"}
                <i class="fa-solid fa-diamond text-red-400" />
            {/if}
            {#if suit === "Spades"}
                <i class="fa-solid fa-star text-black" />
            {/if}
            {#if suit === "Clubs"}
                <i class="fa-solid fa-cloud text-black" />
            {/if}
        </div>
    {/if}
</div>
