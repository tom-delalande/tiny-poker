<script lang="ts">
    import Button from "../Button.svelte";
    import type { HandState } from "../poker-logic/model";
    import {
        playerCall,
        playerCheck,
        playerFold,
    } from "../poker-logic/player-actions";

    export let pokerState: HandState;
    export let playerSeat: number;
    export let playerAction: (
        action: (seat: number, state: HandState) => HandState,
        actionName: string,
        chipAmount?: number
    ) => void;
    export let openRaiseMenu: () => void;

    const player = pokerState.seats[playerSeat];
</script>

{#if pokerState.currentAction.minRaise > pokerState.seats[playerSeat].currentRaise}
    <Button
        disabled={pokerState.currentAction.seatInTurn !== playerSeat ||
            pokerState.currentAction.minRaise <= player.currentRaise}
        action={() => playerAction(playerFold, "fold")}>Fold</Button
    >
{:else}
    <Button
        disabled={pokerState.currentAction.seatInTurn !== playerSeat}
        action={() => playerAction(playerCheck, "check")}>Check</Button
    >
{/if}
<Button
    disabled={pokerState.currentAction.seatInTurn !== playerSeat ||
        pokerState.currentAction.minRaise <= player.currentRaise}
    action={() =>
        playerAction(
            playerCall,
            "call",
            pokerState.currentAction.minRaise - player.currentRaise
        )}
    >Call
    {#if pokerState.currentAction.seatInTurn === playerSeat && pokerState.currentAction.minRaise > player.currentRaise}
        ({pokerState.currentAction.minRaise - player.currentRaise}
        <i class="fa-solid fa-gem" />)
    {/if}
</Button>
<Button
    disabled={pokerState.currentAction.seatInTurn !== playerSeat ||
        pokerState.currentAction.minRaise > player.stack ||
        player.stack === 0}
    action={openRaiseMenu}>Raise</Button
>
