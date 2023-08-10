<script lang="ts">
    import { onMount } from "svelte";
    import MainMenu from "./lib/MainMenu.svelte";
    import MuteButton from "./lib/MuteButton.svelte";
    import PokerGame from "./lib/PokerGame.svelte";
    import { loadAudio } from "./lib/ui-logic/audio";
    type Page = "Home" | "Game";
    let page: Page = "Home";

    function goToPage(newPage: Page) {
        page = newPage;
    }

    onMount(() => {
        loadAudio();

        // fix viewport height
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        setAppHeight();
        window.addEventListener("resize", setAppHeight);
    });

    function setAppHeight() {
        const doc = document.documentElement;
        doc.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
    }
</script>

<div class="app-container">
    <MuteButton />
    {#if page === "Game"}
        <PokerGame />
    {/if}
    {#if page === "Home"}
        <MainMenu {goToPage} />
    {/if}
</div>
