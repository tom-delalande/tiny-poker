<script lang="ts">
    import { Preferences } from "@capacitor/preferences";
    import { router } from "./ui-logic/navigation";
    import { logEvent } from "./analytics/analytics";
    import CommonButton from "./CommonButton.svelte";
    import { storeEnabled } from "./config";

    let showUpcommingFeatures = false;
    Preferences.get({
        key: "upcomming-features-preference-sent",
    }).then((result) => {
        if (result.value === undefined || result.value !== "true") {
            showUpcommingFeatures = true;
        }
    });
</script>

<div
    class="flex flex-col justify-center items-center gap-4 h-full bg-neutral-200"
>
    <div class="justify-self-center flex flex-col items-center m-auto gap-6">
        <div class="flex gap-4 items-center">
            <div class="bg-red-500 w-8 h-8 rounded-md rotate-45" />
            <h1 class="text-5xl">Tiny Poker</h1>
        </div>
        <CommonButton
            action={() => {
                router.set({ route: "BotSelectionScreen" });
            }}
            ><i class="fa-solid fa-robot" /> Play bots
        </CommonButton>
        {#if storeEnabled}
            <CommonButton
                action={() => {
                    router.set({ route: "Store" });
                }}
                ><i class="fa-solid fa-store" /> Store
            </CommonButton>
        {/if}
        {#if showUpcommingFeatures}
            <CommonButton
                action={() => {
                    router.set({ route: "UpcommingFeatures" });
                }}
                ><i class="fa-solid fa-rocket" /> Upcoming features
            </CommonButton>
        {/if}
    </div>
    <div
        class="flex flex-col gap-2 items-center justify-center font-thin
        justify-self-end py-10 italic"
    >
        <p>We'd love to hear what you think</p>
        <div class="flex gap-2 text-sm font-normal items-center justify-center">
            <CommonButton
                action={() => {
                    logEvent("open-discord-button-pressed");
                    window.open("https://discord.gg/yR9uquvCkS", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-brands fa-discord" />Discord</span
                ></CommonButton
            >
            <CommonButton
                action={() => {
                    logEvent("open-email-button-pressed");
                    window.open("mailto:hello@tiny.poker", "_blank");
                }}
                ><span class="flex gap-2 items-center justify-center"
                    ><i class="fa-solid fa-envelope" />Email</span
                ></CommonButton
            >
        </div>
    </div>
</div>
