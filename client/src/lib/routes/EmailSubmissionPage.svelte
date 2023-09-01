<script lang="ts">
    import { Preferences } from "@capacitor/preferences";
    import BackButton from "../BackButton.svelte";
    import CommonButton from "../CommonButton.svelte";
    import { logEvent } from "../analytics/analytics";
    import { router } from "../ui-logic/navigation";
    import { gameState } from "../ui-logic/state";

    export let preference: string[];
    let emailInput = "";
    function completeUpcommingFeatures(saveEmail: boolean) {
        const email = saveEmail ? emailInput : undefined;

        logEvent("upcomming-features-preference-sent", {
            email,
            preference,
        }).finally(() => {
            Preferences.set({
                key: "upcomming-features-preference-sent",
                value: "true",
            });

            gameState.update((prev) => {
                prev.gems += 50;
                return prev;
            });
            router.set({ route: "AddedGems", gems: 50});
        });
    }
</script>

<BackButton
    action={() => {
        router.set({ route: "UpcommingFeatures" });
    }}
/>
<div class="flex flex-col items-center justify-center gap-2 h-full">
    <p>Enter your email to be notified when this is released.</p>
    <input class="px-4 py-2 rounded-md" bind:value={emailInput} type="email" />
    <div class="flex flex-col gap-4 items-center">
        <CommonButton
            action={() => {
                completeUpcommingFeatures(false);
            }}
            ><i class="fa-solid fa-xmark" /> No, I don't want to submit my email</CommonButton
        >
        <CommonButton
            action={() => {
                completeUpcommingFeatures(true);
            }}><i class="fa-solid fa-check" />Done</CommonButton
        >
    </div>
</div>
