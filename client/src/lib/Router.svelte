<script lang="ts">
    import CharacterCard from "./CharacterCard.svelte";
    import MainMenu from "./MainMenu.svelte";
    import PokerGame from "./PokerGame.svelte";
    import BotSelectionScreen from "./routes/BotSelectionScreen.svelte";
    import { router, type Page } from "./ui-logic/navigation";
</script>

{#if $router.route === "Home"}
    <MainMenu />
{/if}
{#if $router.route === "BotsGame"}
    <PokerGame bot={$router.bot} startingStack={$router.startingStack} />
{/if}
{#if $router.route === "CharacterCard"}
    <CharacterCard botInfo={$router.bot} backEnabled={$router.backEnabled} />
{/if}
{#if $router.route === "BotSelectionScreen"}
    <BotSelectionScreen />
{/if}
