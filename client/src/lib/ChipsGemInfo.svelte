<script lang="ts">
    import { gameState } from "./ui-logic/state";
</script>

<div class="font-thin absolute top-14 left-5">
    {$gameState?.chips}
    <i class="fa-solid fa-coins" />
    {$gameState?.gems}
    <i class="fa-solid fa-gem" />
</div>
