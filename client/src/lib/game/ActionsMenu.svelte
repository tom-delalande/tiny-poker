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
        action: (seat: number, state: HandState) => HandState
    ) => void;
    export let openRaiseMenu: () => void;
</script>

{#if pokerState.currentAction.minRaise > pokerState.seats[playerSeat].currentRaise}
    <Button
        disabled={pokerState.currentAction.seatInTurn !== playerSeat ||
            pokerState.currentAction.minRaise <=
                pokerState.seats[playerSeat].currentRaise}
        action={() => playerAction(playerFold)}>Fold</Button
    >
{:else}
    <Button
        disabled={pokerState.currentAction.seatInTurn !== playerSeat}
        action={() => playerAction(playerCheck)}>Check</Button
    >
{/if}
<Button
    disabled={pokerState.currentAction.seatInTurn !== playerSeat ||
        pokerState.currentAction.minRaise <=
            pokerState.seats[playerSeat].currentRaise}
    action={() => playerAction(playerCall)}
    >Call
    {#if pokerState.currentAction.seatInTurn === playerSeat && pokerState.currentAction.minRaise > pokerState.seats[playerSeat].currentRaise}
        ({pokerState.currentAction.minRaise -
            pokerState.seats[playerSeat].currentRaise}
        <i class="fa-solid fa-gem" />)
    {/if}
</Button>
<Button
    disabled={pokerState.currentAction.seatInTurn !== playerSeat}
    action={openRaiseMenu}>Raise</Button
>
