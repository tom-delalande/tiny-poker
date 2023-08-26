<script lang="ts">
    import { playAudio } from "./ui-logic/audio";

    export let action: () => void | undefined;
    export let disabled: boolean = false;

    function performAction() {
        playAudio("playerAction");
        action();
    }
</script>

<button
    class="px-4 py-2 bg-gray-50 rounded-md active:scale-90
transition disabled:bg-neutral-300 min-w-max w-24 disabled:border-2 disabled:border-gray-50
    disabled:active:scale-100"
    {disabled}
    on:click={performAction}><slot /></button
>
