<script lang="ts">
    import MainMenu from "./lib/MainMenu.svelte";
    import PokerGame from "./lib/PokerGame.svelte";
    type Page = "Home" | "Game";
    let page: Page = "Home";

    function goToPage(newPage: Page) {
        page = newPage;
    }
</script>

<div class="max-height">
    {#if page === "Game"}
        <PokerGame />
    {/if}
    {#if page === "Home"}
        <MainMenu {goToPage} />
    {/if}
</div>
