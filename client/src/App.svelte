<script lang="ts">
    import { onMount } from "svelte";
    import MuteButton from "./lib/MuteButton.svelte";
    import { loadAudio } from "./lib/ui-logic/audio";
    import { Preferences } from "@capacitor/preferences";
    import Router from "./lib/Router.svelte";
    import { botGameState } from "./lib/ui-logic/state";

    onMount(async () => {
        loadAudio();

        // fix viewport height
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        setAppHeight();
        window.addEventListener("resize", setAppHeight);
    });

    function setAppHeight() {
        const doc = document.documentElement;
        doc.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
    }
</script>

<div class="app-container">
    <MuteButton />
    <Router />
</div>
