<script lang="ts">
    import CharacterCard from "./CharacterCard.svelte";
    import MainMenu from "./MainMenu.svelte";
    import PokerGame from "./PokerGame.svelte";
    import type { HandState } from "./poker-logic/model";
    import BotSelectionScreen from "./routes/BotSelectionScreen.svelte";
    import { route, type Route } from "./ui-logic/navigation";
    import { handState } from "./ui-logic/state";

    let currentRoute: Route;
    let currentProps: any;
    route.subscribe((route) => {
        console.log(route);
        currentRoute = route.route;
        currentProps = route.props;
    });

    let myHandState: HandState;
    handState.subscribe((state) => {
        if (!state) return;
        myHandState = state;
    });
</script>

{#if currentRoute === "Home"}
    <MainMenu {...currentProps} />
{/if}
{#if currentRoute === "BotsGame"}
    <PokerGame pokerState={myHandState} {...currentProps} />
{/if}
{#if currentRoute === "CharacterCard"}
    <CharacterCard {...currentProps} />
{/if}
{#if currentRoute === "BotSelectionScreen"}
    <BotSelectionScreen {...currentProps} />
{/if}
