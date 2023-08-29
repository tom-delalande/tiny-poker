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
    class={`bg-gray-50 rounded-md active:scale-90 transition
    disabled:bg-neutral-300 disabled:border-2 disabled:border-gray-50
    hover:bg-red-200 hover:drop-shadow-lg
    disabled:active:scale-100 ${$$props.class}`}
    {disabled}
    on:click={performAction}><slot /></button
>
