const autosuggest = input => {
    if (!input) return;

    input.on('input', fetchSuggestions);
};

const fetchSuggestions = event => {
    const text = event.target.value;
    if (text.length < 3) return;

    console.log(text);
}

export default autosuggest;