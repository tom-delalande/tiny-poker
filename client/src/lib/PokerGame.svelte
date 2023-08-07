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
        finishTurn,
        prepareNextHand,
        type Player,
    } from "./poker-logic";

    const initialPlayers = [
        {
            isCurrentPlayer: true,
            stack: 20,
        },
        {
            isCurrentPlayer: false,
            stack: 20,
        },
    ];

    let pokerState: PokerState = createInitalHandState(initialPlayers);
    if (pokerState.seats.length > 2)
        throw Error("Tables bigger than 2 are not supported");

    $: playerSeat = pokerState.seats.findIndex((it) => it.isCurrentPlayer);
    $: opponentSeat = pokerState.seats.findIndex((it) => !it.isCurrentPlayer);
    $: opponent = pokerState.seats[opponentSeat];
    $: player = pokerState.seats[playerSeat];
    $: communityCards = calculateShownCommunityCards(pokerState);

    function playerAction(
        action: (seat: number, state: PokerState) => PokerState
    ) {
        pokerState = action(playerSeat, pokerState);
        console.debug(JSON.parse(JSON.stringify(pokerState)));
        setTimeout(() => {
            pokerState = finishTurn(pokerState);
            setTimeout(() => {
                pokerState = performEnemyActions(opponentSeat, pokerState);
                setTimeout(() => {
                    pokerState = finishTurn(pokerState);
                    console.debug(pokerState);
                }, 500);
            }, 500);
        }, 200);
    }

    let raiseMenuOpen = false;
    $: raiseAmounts = [
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

    $: gameFinished =
        pokerState.seats.filter((it) => it.stack === 0).length === 1;
    function playAgain() {
        if (gameFinished) pokerState = createInitalHandState(initialPlayers);
        const nextHand: Player | PokerState = prepareNextHand(pokerState);
        if ("cards" in nextHand) return;
        pokerState = nextHand;
        setTimeout(() => {
            pokerState = performEnemyActions(opponentSeat, pokerState);
            setTimeout(() => {
                pokerState = finishTurn(pokerState);
            }, 500);
        }, 500);
    }
</script>

<div class="flex flex-col justify-around h-full bg-neutral-300 max-height">
    <div class="flex flex-col gap-2 items-center">
        <div class="flex gap-2 justify-center">
            {#each opponent.cards as card}
                {#if pokerState.finished}
                    <Card suit={card.suit} value={card.value} />
                {:else}
                    <Card suit="Hidden" value={1} />
                {/if}
            {/each}
        </div>
        <Stack value={opponent.stack} />
        {#if pokerState.winners.includes(opponentSeat)}
            <LastActionLabel lastAction={"Winner"} />
        {:else}
            <LastActionLabel lastAction={opponent.lastAction} />
        {/if}
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
        {#if pokerState.winners.includes(playerSeat)}
            <LastActionLabel lastAction={"Winner"} />
        {:else}
            <LastActionLabel lastAction={player.lastAction} />
        {/if}
        <Stack value={player.stack} />
        <div class="flex gap-2 justify-center">
            {#each player.cards as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <div class="flex gap-2 justify-center">
            {#if pokerState.finished}
                <Button action={playAgain}
                    >{#if gameFinished}
                        New Game
                    {:else}
                        Continue
                    {/if}</Button
                >
            {:else if raiseMenuOpen}
                <div
                    class="flex flex-wrap gap-2 items-center justify-center
                    max-w-md"
                >
                    <Button action={() => (raiseMenuOpen = false)}
                        >Cancel</Button
                    >
                    {#each raiseAmounts as amount}
                        <Button
                            action={() => {
                                raiseMenuOpen = false;
                                playerAction(() =>
                                    playerRaise(playerSeat, pokerState, amount)
                                );
                            }}
                            >{amount}
                            <i class="fa-solid fa-coins" />
                        </Button>
                    {/each}
                </div>
            {:else}
                {#if pokerState.currentAction.minRaise > 0}
                    <Button
                        disabled={pokerState.currentAction.seatInTurn !==
                            playerSeat}
                        action={() => playerAction(playerCall)}
                        >Call {#if pokerState.currentAction.seatInTurn === playerSeat}({pokerState
                                .currentAction.minRaise -
                                pokerState.seats[playerSeat]
                                    .currentRaise}){/if}</Button
                    >
                {:else}
                    <Button
                        disabled={pokerState.currentAction.seatInTurn !==
                            playerSeat}
                        action={() => playerAction(playerCheck)}>Check</Button
                    >
                {/if}
                <Button
                    disabled={pokerState.currentAction.seatInTurn !==
                        playerSeat}
                    action={() => playerAction(playerFold)}>Fold</Button
                >
                <Button
                    disabled={pokerState.currentAction.seatInTurn !==
                        playerSeat}
                    action={() => (raiseMenuOpen = true)}>Raise</Button
                >
            {/if}
        </div>
    </div>
</div>
