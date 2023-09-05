<script lang="ts">
    export let lastAction:
        | "Fold"
        | "Raise"
        | "Call"
        | "Check"
        | "None"
        | "Winner"
        | "Big Blind"
        | "Small Blind";
</script>

{#if lastAction === "Winner"}
    <div
        class="rounded-md px-4 bg-yellow
        text-white"
    >
        {lastAction}
    </div>
{/if}
{#if lastAction === "None"}
    <div
        class="rounded-md px-4 bg-surface0
        text-text"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Check"}
    <div
        class="rounded-md px-4 bg-surface0
        text-text"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Fold"}
    <div class="rounded-md px-4 bg-maroon text-white">
        {lastAction}
    </div>
{/if}

{#if lastAction === "Call"}
    <div class="rounded-md px-4 bg-green text-white">
        {lastAction}
    </div>
{/if}

{#if lastAction === "Raise" || lastAction === "Big Blind"}
    <div class="rounded-md px-4 bg-yellow text-white">
        {lastAction}
    </div>
{/if}
{#if lastAction === "Small Blind"}
    <div
        class="rounded-md px-4 bg-yellow
        text-white"
    >
        {lastAction}
    </div>
{/if}
