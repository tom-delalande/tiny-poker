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
    class={`bg-crust rounded-md active:scale-90 transition flex gap-2
    items-center justify-center
    text-text disabled:bg-surface2
    disabled:active:scale-100 ${$$props.class}`}
    {disabled}
    on:click={performAction}><slot /></button
>
