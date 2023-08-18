<script lang="ts">
    import Avatar from "./GenericAvatar.svelte";
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
    import type { GameState, HandState } from "./poker-logic/model";
    import { calculateShownCommunityCards } from "./poker-logic/utility";
    import type { Bot } from "./poker-logic/ai/bots";
    import { route } from "./ui-logic/navigation";
    import { botGameState, handState } from "./ui-logic/state";
    import { onMount } from "svelte";
    import { logEvent } from "./analytics/analytics";

    export let bot: Bot;

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
    export let pokerState: HandState;
    handState.subscribe((state) => {
        console.log(state);
        pokerState = state;
    });
    if (pokerState === undefined || pokerState === null) {
        handState.set(createInitalHandState(initialPlayers, 0));
    }
    if (pokerState.seats.length > 2)
        throw Error("Tables bigger than 2 are not supported");

    $: playerSeat = pokerState.seats.findIndex((it) => it.isCurrentPlayer);
    $: opponentSeat = pokerState.seats.findIndex((it) => !it.isCurrentPlayer);
    $: opponent = pokerState.seats[opponentSeat];
    $: player = pokerState.seats[playerSeat];
    $: communityCards = calculateShownCommunityCards(pokerState);

    function playerAction(
        action: (seat: number, state: HandState) => HandState,
        actionName: string,
        chipAmount?: number
    ) {
        logEvent("player-action-button-pressed", {
            actionName,
            chipAmount,
            pokerState,
        });
        handState.set(action(playerSeat, pokerState));
        setTimeout(() => {
            handState.set(finishTurnForPlayer(playerSeat, pokerState));
            setTimeout(() => {
                if (
                    !pokerState.seats[pokerState.currentAction.seatInTurn]
                        .isCurrentPlayer
                ) {
                    handState.set(
                        performEnemyActions_v2(
                            opponentSeat,
                            pokerState,
                            bot.aggression,
                            bot.looseness
                        )
                    );
                    setTimeout(() => {
                        handState.set(
                            finishTurnForPlayer(opponentSeat, pokerState)
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
        logEvent("play-again-button-pressed", {
            gameFinished,
        });
        if (gameFinished) {
            handState.set(createInitalHandState(initialPlayers, 0));
            return;
        }
        handState.set(prepareNextHand(pokerState));
        setTimeout(() => {
            handState.set(
                performEnemyActions_v2(
                    opponentSeat,
                    pokerState,
                    bot.aggression,
                    bot.looseness
                )
            );
            setTimeout(() => {
                handState.set(finishTurnForPlayer(opponentSeat, pokerState));
            }, 500);
        }, 500);
    }
    let currentBotGameState: GameState;
    botGameState.subscribe((value) => (currentBotGameState = value));
    onMount(() => {
        logEvent("poker-game-page-opened", {
            bot,
            handState: pokerState,
            gameState: currentBotGameState,
        });
    });
</script>

<div class="flex flex-col justify-around h-full bg-neutral-300">
    <BackButton action={() => route.set("Home")} />
    <div class="flex flex-col gap-2 items-center">
        <div class="font-thin absolute top-14 left-5">
            {currentBotGameState.currentScore}
            <i class="fa-solid fa-diamond" />
        </div>
        <div class="flex gap-2 justify-center">
            <div>
                <Avatar
                    openCharacterCard={() => route.set("CharacterCard")}
                    image={bot.avatar}
                    name={bot.name}
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
                    back={() => {
                        logEvent("close-raise-menu-button-pressed");
                        raiseMenuOpen = false;
                    }}
                    {playerAction}
                    {pokerState}
                    {playerSeat}
                />
            {:else}
                <ActionsMenu
                    {pokerState}
                    {playerAction}
                    {playerSeat}
                    openRaiseMenu={() => {
                        logEvent("raise-menu-button-pressed");
                        raiseMenuOpen = true;
                    }}
                />
            {/if}
        </div>
    </div>
</div>
