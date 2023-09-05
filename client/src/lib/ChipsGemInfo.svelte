<script lang="ts">
    import { gameState } from "./ui-logic/state";
    import { formatCompactNumber } from "./util/number";
</script>

<div class="font-thin absolute top-14 left-5 text-text">
    {formatCompactNumber($gameState?.chips)}
    <i class="fa-solid fa-coins" />
    {formatCompactNumber($gameState?.gems)}
    <i class="fa-solid fa-gem" />
</div>
