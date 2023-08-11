<script lang="ts">
    import { onMount } from "svelte";
    import MainMenu from "./lib/MainMenu.svelte";
    import MuteButton from "./lib/MuteButton.svelte";
    import PokerGame from "./lib/PokerGame.svelte";
    import { loadAudio } from "./lib/ui-logic/audio";
    import { Preferences } from "@capacitor/preferences";
    type Page = "Home" | "Game" | "Ranked";
    let page: Page = "Home";

    function goToPage(newPage: Page) {
        refresh();
        page = newPage;
    }

    let currentRank: number;
    function refresh() {
        Preferences.get({ key: "currentRank" }).then((rank) => {
            if (rank.value) {
                currentRank = parseInt(rank.value);
            } else {
                currentRank = 0;
            }
        });
    }

    onMount(() => {
        loadAudio();
        refresh();

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
    {#if page === "Home"}
        <MainMenu {goToPage} {currentRank} />
    {/if}
    {#if page === "Game"}
        <PokerGame {goToPage} game={{ type: "Casual" }} />
    {/if}
    {#if page === "Ranked"}
        <PokerGame
            {goToPage}
            game={{ type: "Ranked", currentRank: currentRank }}
        />
    {/if}
</div>
