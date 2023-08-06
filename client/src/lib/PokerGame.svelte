<script lang="ts">
    import Button from "./Button.svelte";
    import Card from "./Card.svelte";
    import LastActionLabel from "./LastActionLabel.svelte";
    import Stack from "./Stack.svelte";
    import {
        createInitalHandState,
        type PokerState,
        calculateShownCommunityCards,
        playerFold,
        performEnemyActions,
        playerCall,
        playerRaise,
        playerCheck,
    } from "./poker-logic";

    let pokerState: PokerState = createInitalHandState();
    if (pokerState.seats.length > 2)
        throw Error("Tables bigger than 2 are not supported");

    const playerSeat = pokerState.seats.findIndex((it) => it.isCurrentPlayer);
    const opponentSeat = pokerState.seats.findIndex(
        (it) => !it.isCurrentPlayer
    );
    $: opponent = pokerState.seats[opponentSeat];
    $: player = pokerState.seats[playerSeat];
    $: communityCards = calculateShownCommunityCards(pokerState);
    console.log(pokerState);
    function playerAction(
        action: (seat: number, state: PokerState) => PokerState
    ) {
        pokerState = action(playerSeat, pokerState);
        console.log(pokerState);
        setTimeout(() => {
            pokerState = performEnemyActions(opponentSeat, pokerState);
            console.log(pokerState);
        }, 1000);
    }
</script>

<div class="flex flex-col justify-around h-full bg-neutral-300 max-height">
    <div class="flex flex-col gap-2 items-center">
        <div class="flex gap-2 justify-center">
            {#each opponent.cards as _}
                <Card suit="Hidden" value={1} />
            {/each}
        </div>
        <Stack value={opponent.stack} />
        <LastActionLabel lastAction={opponent.lastAction} />
    </div>
    <div class="flex flex-col gap-2 justify-center items-center">
        <div class="flex justify-center gap-2">
            {#each communityCards.slice(0, 3) as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <div class="flex justify-center gap-2">
            {#each communityCards.slice(3) as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <Stack value={pokerState.pot} />
    </div>
    <div class="flex flex-col gap-2 items-center">
        <LastActionLabel lastAction={player.lastAction} />
        <Stack value={player.stack} />
        <div class="flex gap-2 justify-center">
            {#each player.cards as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <div class="flex gap-2 justify-center">
            {#if pokerState.currentAction.minRaise > 0}
                <Button
                    label="Call"
                    disabled={pokerState.currentAction.seatInTurn !==
                        playerSeat}
                    action={() => playerAction(playerCall)}
                />
            {:else}
                <Button
                    label="Check"
                    disabled={pokerState.currentAction.seatInTurn !==
                        playerSeat}
                    action={() => playerAction(playerCheck)}
                />
            {/if}
            <Button
                label="Fold"
                disabled={pokerState.currentAction.seatInTurn !== playerSeat}
                action={() => playerAction(playerFold)}
            />
            <Button
                label="Raise"
                disabled={pokerState.currentAction.seatInTurn !== playerSeat}
                action={() => playerAction(playerRaise)}
            />
        </div>
    </div>
</div>
