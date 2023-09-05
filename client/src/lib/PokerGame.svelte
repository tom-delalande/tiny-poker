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
    import type { BotInformation, HandState } from "./poker-logic/model";
    import { calculateShownCommunityCards } from "./poker-logic/utility";
    import { router } from "./ui-logic/navigation";
    import { localHands, updateHandForBot } from "./ui-logic/state";
    import { logEvent } from "./analytics/analytics";
    import ChipsGemInfo from "./ChipsGemInfo.svelte";

    export let bot: BotInformation;
    export let startingStack: number;

    let pokerState: HandState;
    localHands.subscribe((state) => {
        if (state) {
            pokerState = state.hands[bot.id];
        }
    });

    if (pokerState === undefined || pokerState === null) {
        const initialPlayers = [
            {
                isCurrentPlayer: true,
                stack: startingStack,
            },
            {
                isCurrentPlayer: false,
                stack: 20,
                botId: bot.id,
            },
        ];
        updateHandForBot(bot.id, createInitalHandState(initialPlayers, 0));
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
        updateHandForBot(bot.id, action(playerSeat, pokerState));
        setTimeout(() => {
            updateHandForBot(
                bot.id,
                finishTurnForPlayer(playerSeat, pokerState, bot.id)
            );
            setTimeout(() => {
                if (
                    !pokerState.seats[pokerState.currentAction.seatInTurn]
                        .isCurrentPlayer
                ) {
                    updateHandForBot(
                        bot.id,
                        performEnemyActions_v2(
                            opponentSeat,
                            pokerState,
                            bot.aggression,
                            bot.looseness
                        )
                    );
                    setTimeout(() => {
                        updateHandForBot(
                            bot.id,
                            finishTurnForPlayer(
                                opponentSeat,
                                pokerState,
                                bot.id
                            )
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
            return;
        }
        updateHandForBot(bot.id, prepareNextHand(pokerState));
        setTimeout(() => {
            updateHandForBot(
                bot.id,
                performEnemyActions_v2(
                    opponentSeat,
                    pokerState,
                    bot.aggression,
                    bot.looseness
                )
            );
            setTimeout(() => {
                updateHandForBot(
                    bot.id,
                    finishTurnForPlayer(opponentSeat, pokerState, bot.id)
                );
            }, 500);
        }, 500);
    }
</script>

<div class="flex flex-col justify-around h-full bg-back">
    <BackButton action={() => router.set({ route: "Home" })} />
    <div class="flex flex-col gap-2 items-center">
        <ChipsGemInfo />
        <div class="flex gap-2 justify-center">
            <div>
                <Avatar
                    openCharacterCard={() =>
                        router.set({
                            route: "CharacterCard",
                            bot,
                            backEnabled: false,
                        })}
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
                <NewGameMenu {gameFinished} nextHand={playAgain} {bot} />
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
