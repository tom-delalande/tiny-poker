<script lang="ts">
    import { dndzone } from "svelte-dnd-action";
    import { flip } from "svelte/animate";
    import CommonButton from "../CommonButton.svelte";
    import BackButton from "../BackButton.svelte";
    import { router } from "../ui-logic/navigation";
    import { logEvent } from "../analytics/analytics";

    interface Feature {
        id: number;
        name: string;
        icon: string;
    }

    let features: Feature[] = [
        {
            id: 1,
            name: "Multiplayer tournaments",
            icon: "trophy",
        },
        {
            id: 2,
            name: "Story mode",
            icon: "book",
        },
        {
            id: 3,
            name: "Puzzles",
            icon: "puzzle-piece",
        },
    ];

    function handleDndConsider(e) {
        features = e.detail.items;
    }
    function handleDndFinalize(e) {
        features = e.detail.items;
    }
</script>

<BackButton
    action={() => {
        router.set({ route: "Home" });
    }}
/>
<div
    class="flex flex-col items-center justify-center gap-2 h-full overscroll-none"
>
    <p class="max-w-sm text-center">
        We're still working on these features. Reorder them to tell us what
        you'd most like to see.
    </p>

    <div
        class="flex flex-col gap-2 justify-center items-center p-5 overscroll-none"
    >
        <p>Most important</p>
        <div
            class="flex flex-col gap-2 justify-center items-center overscroll-none"
            use:dndzone={{
                items: features,
                flipDurationMs: 200,
                dropTargetStyle: { outline: "none" },
            }}
            on:consider={handleDndConsider}
            on:finalize={handleDndFinalize}
        >
            {#each features as feature (feature.id)}
                <div
                    class="px-4 py-2 min-w-max w-52 bg-gray-50 rounded-md
                text-center overscroll-none"
                    animate:flip={{ duration: 200 }}
                >
                    <i class="fa-solid fa-{feature.icon}" />
                    {feature.name}
                </div>
            {/each}
        </div>
        <p>Least important</p>
    </div>
    <CommonButton
        action={() => {
            const preference = features.map((it) => it.name);
            logEvent("upcomming-feature-preference-selected", {
                preference,
            });
            router.set({
                route: "EmailSubmittion",
                preference: preference,
            });
        }}><i class="fa-solid fa-check" /> Done</CommonButton
    >
</div>
