<script lang="ts">
    import Button from "./Button.svelte";
    import { playAudio } from "./ui-logic/audio";

    export let action: () => void | undefined;
    export let disabled: boolean = false;

    function performAction() {
        action();
    }
</script>

<Button
    class={`px-4 py-2 min-w-max w-24 ${$$props.class}`}
    {disabled}
    action={performAction}><slot /></Button
>
