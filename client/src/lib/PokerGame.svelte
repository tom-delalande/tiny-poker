<script>
    import Button from "./Button.svelte";
    import Card from "./Card.svelte";
    import Stack from "./Stack.svelte";
</script>

<div class="flex flex-col justify-around h-screen bg-neutral-300">
    <div class="flex flex-col gap-2 items-center">
        <div class="flex gap-2 justify-center">
            <Card suit="Hidden" value={1} />
            <Card suit="Hidden" value={1} />
        </div>
        <Stack value={123} />
    </div>
    <div class="flex flex-col gap-2 justify-center items-center">
        <div class="flex justify-center gap-2">
            <Card suit="Hearts" value={10} />
            <Card suit="Diamonds" value={11} />
            <Card suit="Spades" value={12} />
        </div>
        <div class="flex justify-center gap-2">
            <Card suit="Clubs" value={13} />
            <Card suit="Spades" value={4} />
        </div>
        <Stack value={50} />
    </div>
    <div class="flex flex-col gap-2 items-center">
        <Stack value={125} />
        <div class="flex gap-2 justify-center">
            <Card suit="Clubs" value={2} />
            <Card suit="Spades" value={3} />
        </div>
        <div class="flex gap-2 justify-center">
            <Button label="Fold" />
            <Button label="Call" />
            <Button label="Raise" />
        </div>
    </div>
</div>
