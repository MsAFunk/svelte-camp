import { writable } from 'svelte/store';

const PollStore = writable([
    {
        id: 1,
        question: 'What should I order for breakfast?',
        optionA: 'Waffles',
        optionB: 'Pancakes',
        votesA: 17,
        votesB: 2,
    }
]);

export default PollStore;