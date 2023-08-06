<script lang="ts">
    import Button from "./Button.svelte";
    import Card from "./Card.svelte";
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
    const enemySeat = pokerState.seats.findIndex((it) => !it.isCurrentPlayer);
    const communityCards = calculateShownCommunityCards(pokerState);
    console.log(pokerState);
    function playerAction(
        action: (seat: number, state: PokerState) => PokerState
    ) {
        pokerState = action(playerSeat, pokerState);
        pokerState = performEnemyActions(enemySeat, pokerState);
    }
</script>

<div class="flex flex-col justify-around h-screen bg-neutral-300">
    <div class="flex flex-col gap-2 items-center">
        <div class="flex gap-2 justify-center">
            {#each pokerState.seats[enemySeat].cards as _}
                <Card suit="Hidden" value={1} />
            {/each}
        </div>
        <Stack value={123} />
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
        <Stack value={50} />
    </div>
    <div class="flex flex-col gap-2 items-center">
        <Stack value={125} />
        <div class="flex gap-2 justify-center">
            {#each pokerState.seats[playerSeat].cards as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <div class="flex gap-2 justify-center">
            {#if pokerState.currentAction.seatInTurn === playerSeat}
                {#if pokerState.currentAction.minRaise > 0}
                    <Button
                        label="Fold"
                        action={() => playerAction(playerFold)}
                    />
                {:else}
                    <Button
                        label="Check"
                        action={() => playerAction(playerCheck)}
                    />
                {/if}
                <Button label="Call" action={() => playerAction(playerCall)} />
                <Button
                    label="Raise"
                    action={() => playerAction(playerRaise)}
                />
            {/if}
        </div>
    </div>
</div>
