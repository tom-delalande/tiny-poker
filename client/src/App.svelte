<script lang="ts">
    import MainMenu from "./lib/MainMenu.svelte";
    import PokerGame from "./lib/PokerGame.svelte";
    type Page = "Home" | "Game";
    let page: Page = "Game";

    function goToPage(newPage: Page) {
        page = newPage;
    }
</script>

{#if page === "Game"}
    <PokerGame />
{/if}
{#if page === "Home"}
    <MainMenu {goToPage} />
{/if}
