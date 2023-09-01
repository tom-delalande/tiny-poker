<script lang="ts">
    import CommonButton from "../CommonButton.svelte";
    import { router } from "../ui-logic/navigation";

    export let gems: number;
</script>

<div class="h-full flex flex-col items-center justify-center gap-4">
    <div class="flex items-center gap-2 text-3xl justify-center">
        <div class="flex items-center">
            <i class="fa-solid fa-plus text-xl" />{gems}
        </div>
        <i class="fa-solid fa-gem" />
    </div>
    <CommonButton action={() => router.set({ route: "Home" })}
        >Okay</CommonButton
    >
</div>
