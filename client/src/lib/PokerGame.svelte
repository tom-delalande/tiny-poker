<script lang="ts">
    import Avatar from "./Avatar.svelte";
    import BackButton from "./BackButton.svelte";
    import Card from "./Card.svelte";
    import LastActionLabel from "./LastActionLabel.svelte";
    import Stack from "./Stack.svelte";
    import ActionsMenu from "./game/ActionsMenu.svelte";
    import NewGameMenu from "./game/NewGameMenu.svelte";
    import RaiseMenu from "./game/RaiseMenu.svelte";
    import { performEnemyActions_v2 } from "./poker-logic/ai";
    import {
        createInitalHandState,
        finishTurnForPlayer,
        prepareNextHand,
    } from "./poker-logic/hand";
    import type {
        EnemyInformation,
        Game,
        PokerState,
    } from "./poker-logic/model";
    import { calculateShownCommunityCards } from "./poker-logic/utility";

    export let back: (state: PokerState) => void;
    export let game: Game;
    export let enemyInformation: EnemyInformation = undefined;

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

    export let pokerState: PokerState = createInitalHandState(
        initialPlayers,
        0,
        game
    );
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
        setTimeout(() => {
            pokerState = finishTurnForPlayer(playerSeat, pokerState);
            setTimeout(() => {
                if (
                    !pokerState.seats[pokerState.currentAction.seatInTurn]
                        .isCurrentPlayer
                ) {
                    pokerState = performEnemyActions_v2(
                        opponentSeat,
                        pokerState,
                        enemyInformation.aggression,
                        enemyInformation.looseness,
                    );
                    setTimeout(() => {
                        pokerState = finishTurnForPlayer(
                            opponentSeat,
                            pokerState
                        );
                    }, 500);
                }
            }, 500);
        }, 200);
    }

    let raiseMenuOpen = false;
    $: gameFinished =
        pokerState.seats.filter((it) => it.stack === 0).length === 1;

    function playAgain() {
        if (gameFinished) {
            pokerState = createInitalHandState(
                initialPlayers,
                0,
                pokerState.game
            );
            return;
        }
        pokerState = prepareNextHand(pokerState);
        setTimeout(() => {
            pokerState = performEnemyActions_v2(
                opponentSeat,
                pokerState,
                enemyInformation.aggression,
                enemyInformation.looseness
            );
            setTimeout(() => {
                pokerState = finishTurnForPlayer(opponentSeat, pokerState);
            }, 500);
        }, 500);
    }

    export let openCharacterCard: (state: PokerState) => void;
</script>

<div class="flex flex-col justify-around h-full bg-neutral-300">
    <BackButton action={() => back(pokerState)} />
    <div class="flex flex-col gap-2 items-center">
        {#if pokerState.game.type === "Ranked"}
            <div class="font-thin absolute top-14 left-5">
                {pokerState.game.currentRank}
                <i class="fa-solid fa-diamond" />
            </div>
        {/if}
        <div class="flex gap-2 justify-center">
            <div>
                <Avatar
                    openCharacterCard={() => openCharacterCard(pokerState)}
                    {enemyInformation}
                />
                <div class="flex gap-2 -mt-5 justify-center">
                    {#each opponent.cards as card}
                        {#if pokerState.finished}
                            <Card suit={card.suit} value={card.value} />
                        {:else}
                            <Card suit="Hidden" value={1} />
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
        <Stack value={opponent.stack} />
        {#if pokerState.finished && opponent.handStrength}
            {opponent.handStrength}
        {/if}
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
        {#if pokerState.finished && player.handStrength}
            {player.handStrength}
        {/if}
        <Stack value={player.stack} />
        <div class="flex gap-2 justify-center">
            {#each player.cards as card}
                <Card suit={card.suit} value={card.value} />
            {/each}
        </div>
        <div class="flex gap-2 justify-center">
            {#if pokerState.finished}
                <NewGameMenu {gameFinished} {playAgain} />
            {:else if raiseMenuOpen}
                <RaiseMenu
                    back={() => (raiseMenuOpen = false)}
                    {playerAction}
                    {pokerState}
                    {playerSeat}
                />
            {:else}
                <ActionsMenu
                    {pokerState}
                    {playerAction}
                    {playerSeat}
                    openRaiseMenu={() => (raiseMenuOpen = true)}
                />
            {/if}
        </div>
    </div>
</div>
