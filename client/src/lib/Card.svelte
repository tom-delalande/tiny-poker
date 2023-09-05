<script lang="ts">
    export let suit: "Hearts" | "Spades" | "Clubs" | "Diamonds" | "Hidden";
    export let value: number;
</script>

<div
    class="rounded-md w-10 h-10 md:w-16 md:h-16 text-2xl flex items-center
    justify-center gap-1 relative drop-shadow-sm"
    class:bg-red={suit === "Hearts"}
    class:bg-teal={suit === "Diamonds"}
    class:bg-black={suit === "Spades"}
    class:bg-white={suit === "Clubs"}
    class:text-neutral-600={suit === "Clubs"}
    class:border-neutral-600={suit === "Clubs"}
    class:bg-surface0={suit === "Hidden"}
    class:text-white={suit !== "Clubs"}
>
    {#if suit === "Hidden"}
        <i class="fa-solid fa-eye-slash" />
    {:else}
        <div class="text-2xl">
            {#if value === 1}
                <i class="fa-solid fa-a" />
            {/if}
            {#if value < 10 && value > 1}
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
    {/if}
</div>
