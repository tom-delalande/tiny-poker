<script lang="ts">
    import Bot1CharacterCard from "./Bot1CharacterCard.svelte";
    import MainMenu from "./MainMenu.svelte";
    import PokerGame from "./PokerGame.svelte";
    import { bot1, bots } from "./poker-logic/ai/bots";
    import type {
        GameState,
        HandState,
        HandStrength,
    } from "./poker-logic/model";
    import { route, type Route } from "./ui-logic/navigation";
    import { botGameState, handState } from "./ui-logic/state";

    let currentRoute: Route;
    route.subscribe((route) => {
        console.log(route);
        currentRoute = route;
    });

    let bot = bot1;
    let wonChips = 0;
    let introSeen = false;
    let gameState: GameState;
    botGameState.subscribe((state) => {
        console.log(state);
        if (!state) return;
        gameState = state;
        bot = bots[state.currentBotIndex];
        wonChips = state.currentScore;
        introSeen = state.characterCardSeen;
    });

    let myHandState: HandState;
    handState.subscribe((state) => {
        if (!state) return;
        myHandState = state;
    });
</script>

{#if currentRoute === "Home"}
    <MainMenu characterCardSeen={introSeen} />
{/if}
{#if currentRoute === "BotsGame"}
    <PokerGame {bot} pokerState={myHandState} />
{/if}
{#if currentRoute === "CharacterCard"}
    <Bot1CharacterCard
        {wonChips}
        characterIntroSeen={introSeen}
        close={() => {
            gameState.characterCardSeen = true;
            botGameState.set(gameState);
            route.set("BotsGame");
        }}
    />
{/if}
