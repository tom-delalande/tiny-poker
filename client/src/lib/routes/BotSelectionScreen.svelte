<script>
    import BackButton from "../BackButton.svelte";
    import { bots } from "../poker-logic/ai/bots";
    import { router } from "../ui-logic/navigation";
</script>

<BackButton action={() => router.set({ route: "Home" })} />
<div class="flex items-center justify-center h-full">
    <div
        class="gap-2 grid grid-cols-2 grid-rows-2 justify-center items-center
        mx-2"
    >
        {#each bots as bot}
            <button
                class="flex flex-col items-center justify-center bg-neutral-200
                p-2 rounded-md h-full w-full"
                on:click={() => {
                    router.set({
                        route: "CharacterCard",
                        bot,
                    });
                }}
            >
                <img class="w-24 h-24" src={bot.avatar} alt={bot.name} />
                <p>{bot.name}</p>
                {#if bot.buyIn.length > 0}
                    <p>
                        {bot.buyIn[0].chips}
                        <i class="fa-solid fa-coins" />
                    </p>
                {/if}
            </button>
        {/each}
    </div>
</div>
