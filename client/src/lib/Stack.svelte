<script lang="ts">
    import { formatCompactNumber } from "./util/number";

    export let value: number;
</script>

<div class="flex items-center gap-1">
    <p>{formatCompactNumber(value)}</p>
    <i class="fa-solid fa-coins" />
</div>
