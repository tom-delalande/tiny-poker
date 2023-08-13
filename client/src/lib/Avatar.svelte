<script lang="ts">
    import type { EnemyInformation } from "./poker-logic/model";
    import bot1Avatar from "./../assets/bot-1-avatar.png";

    export let enemyInformation: EnemyInformation;
    export let openCharacterCard: () => void;
</script>

<button
    on:click={openCharacterCard}
    class="flex flex-col items-center justify-center gap-2
    p-2 rounded-md active:scale-90 transition"
>
    <div class="flex items-center justify-center gap-2">
        <p class="text-sm">{enemyInformation.name}</p>
    </div>
    <img class="w-24 h-24" src={bot1Avatar} alt="Bot 1 Avatar" />
</button>
