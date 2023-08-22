<script>
    import BackButton from "../BackButton.svelte";
    import { route } from "../ui-logic/navigation";
    import bot1Avatar from "./../../assets/bot-1-avatar.png";
</script>

<BackButton action={() => route.set("Home")} />
<div class="flex items-center justify-center h-full">
    <div class="gap-2 grid grid-cols-2 grid-rows-2 justify-center items-center">
        <button on:click={() => route.set("CharacterCard")}>
            <img class="w-24 h-24" src={bot1Avatar} alt="Bot 1 Avatar" />
        </button>
        <div class="relative">
            <i
                class="fa-solid fa-lock text-white absolute bottom-1/2 right-1/2
                translate-x-1/2 translate-y-1/2 text-3xl z-10"
            />
            <img
                class="w-24 h-24 brightness-0"
                src={bot1Avatar}
                alt="Bot 1 Avatar"
            />
        </div>
        <div class="relative">
            <i
                class="fa-solid fa-lock text-white absolute bottom-1/2 right-1/2
                translate-x-1/2 translate-y-1/2 text-3xl z-10"
            />
            <img
                class="w-24 h-24 brightness-0"
                src={bot1Avatar}
                alt="Bot 1 Avatar"
            />
        </div>
        <div class="relative">
            <i
                class="fa-solid fa-lock text-white absolute bottom-1/2 right-1/2
                translate-x-1/2 translate-y-1/2 text-3xl z-10"
            />
            <img
                class="w-24 h-24 brightness-0"
                src={bot1Avatar}
                alt="Bot 1 Avatar"
            />
        </div>
    </div>
</div>
