<script lang="ts">
    import CharacterCard from "./CharacterCard.svelte";
    import MainMenu from "./MainMenu.svelte";
    import PokerGame from "./PokerGame.svelte";
    import Store from "./Store.svelte";
    import AddedGemsPage from "./routes/AddedGemsPage.svelte";
    import BotSelectionScreen from "./routes/BotSelectionScreen.svelte";
    import EmailSubmissionPage from "./routes/EmailSubmissionPage.svelte";
    import UpcommingFeatures from "./routes/UpcommingFeatures.svelte";
    import { router } from "./ui-logic/navigation";
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
{#if $router.route === "Store"}
    <Store />
{/if}
{#if $router.route === "UpcommingFeatures"}
    <UpcommingFeatures />
{/if}
{#if $router.route === "EmailSubmittion"}
    <EmailSubmissionPage preference={$router.preferences} />
{/if}
{#if $router.route === "AddedGems"}
    <AddedGemsPage gems={$router.gems} />
{/if}
