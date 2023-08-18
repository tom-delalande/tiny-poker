<script lang="ts">
    import Button from "../Button.svelte";
    import type { HandState } from "../poker-logic/model";
    import { playerRaise } from "../poker-logic/player-actions";

    export let back: () => void;
    export let playerAction: (
        action: (seat: number, state: HandState) => HandState,
        actionName: string,
        chipAmount: number
    ) => void;
    export let pokerState: HandState;
    export let playerSeat: number;

    const player = pokerState.seats[playerSeat];

    const raiseAmounts = [
        ...new Set([
            Math.min(pokerState.currentAction.minRaise + 1, player.stack),
            Math.floor(
                pokerState.currentAction.minRaise +
                    (player.stack - pokerState.currentAction.minRaise) / 4
            ),
            Math.floor(
                pokerState.currentAction.minRaise +
                    (player.stack - pokerState.currentAction.minRaise) / 2
            ),
            Math.floor(
                pokerState.currentAction.minRaise +
                    (player.stack - pokerState.currentAction.minRaise) / 1.5
            ),
            player.stack,
        ]),
    ];
</script>

<div
    class="flex flex-wrap gap-2 items-center justify-center
                    max-w-xs"
>
    <Button action={back}>Cancel</Button>
    {#each raiseAmounts as amount}
        <Button
            action={() => {
                back();
                playerAction(
                    () => playerRaise(playerSeat, pokerState, amount),
                    "raise",
                    amount
                );
            }}
            >{amount}
            <i class="fa-solid fa-gem" />
        </Button>
    {/each}
</div>
