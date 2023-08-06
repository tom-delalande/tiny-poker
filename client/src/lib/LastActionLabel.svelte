<script lang="ts">
    export let lastAction: "Fold" | "Raise" | "Call" | "Check" | "None";
</script>

{#if lastAction === "None"}
    <div
        class="border-2 border-neutral-300 rounded-md px-4 bg-neutral-300 text-neutral-300"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Check"}
    <div
        class="border-2 border-neutral-900 rounded-md px-4 bg-neutral-300 text-neutral-900"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Fold"}
    <div
        class="border-2 border-red-900 rounded-md px-4 bg-red-300 text-red-900"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Call"}
    <div
        class="border-2 border-green-900 rounded-md px-4 bg-green-300 text-green-900"
    >
        {lastAction}
    </div>
{/if}

{#if lastAction === "Raise"}
    <div
        class="border-2 border-yellow-900 rounded-md px-4 bg-yellow-400 text-yellow-900"
    >
        {lastAction}
    </div>
{/if}
