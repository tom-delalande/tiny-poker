<script lang="ts">
    import { onMount } from "svelte";
    import MainMenu from "./lib/MainMenu.svelte";
    import MuteButton from "./lib/MuteButton.svelte";
    import PokerGame from "./lib/PokerGame.svelte";
    import { loadAudio } from "./lib/ui-logic/audio";
    import { Preferences } from "@capacitor/preferences";
    import CharacterCard from "./lib/CharacterCard.svelte";
    import type { PokerState } from "./lib/poker-logic/model";
    type Page = "Home" | "CharacterCard" | "Ranked";
    let page: Page = "Home";

    function goToPage(newPage: Page) {
        refresh();
        page = newPage;
    }

    let currentRank: number;
    let characterCardSeen: boolean;
    function refresh() {
        Preferences.get({ key: "wonChipsAgainstBot1" }).then((rank) => {
            if (rank.value) {
                currentRank = parseInt(rank.value);
            } else {
                currentRank = 0;
            }
        });
        Preferences.get({ key: "characterCardSeenBot1" }).then((result) => {
            if (result.value) {
                characterCardSeen = JSON.parse(result.value);
            } else {
                characterCardSeen = false;
            }
        });
    }

    let wonChipsAgainstBot1 = 0;
    onMount(async () => {
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

    let previousPokerState: PokerState = undefined;
    function openCharacterCard(pokerState: PokerState) {
        previousPokerState = pokerState;
        goToPage("CharacterCard");
    }
    function exitGame(pokerState: PokerState) {
        previousPokerState = pokerState;
        goToPage("Home");
    }
</script>

<div class="app-container">
    <MuteButton />
    {#if page === "Home"}
        <MainMenu {goToPage} {characterCardSeen} />
    {/if}
    {#if page === "Ranked"}
        <PokerGame
            pokerState={previousPokerState}
            back={exitGame}
            {openCharacterCard}
            game={{ type: "Ranked", currentRank: currentRank }}
            enemyInformation={{
                name: 'Tim "Easygoing" Thompson',
                looseness: 1,
                aggression: 0,
                currentChips: 0,
                totalChips: 0,
            }}
        />
    {/if}
    {#if page === "CharacterCard"}
        <CharacterCard
            wonChips={wonChipsAgainstBot1}
            characterIntroSeen={characterCardSeen}
            close={async () => {
                Preferences.set({
                    key: "characterCardSeenBot1",
                    value: "true",
                }).then(() => {
                    goToPage("Ranked");
                });
            }}
        />
    {/if}
</div>
