<script lang="ts">
    export let image: string;
    export let name: string;

    export let openCharacterCard: () => void;
</script>

<button
    on:click={openCharacterCard}
    class="flex flex-col items-center justify-center gap-2
    p-2 rounded-md active:scale-90 transition w-full"
>
    <div class="flex items-center justify-center gap-2">
        <p class="text-sm">{name}</p>
    </div>
    <img class="w-20 h-20" src={image} alt="Bot 1 Avatar" />
</button>
