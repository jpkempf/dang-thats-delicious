import axios from 'axios';
import { $ } from '../modules/bling';
import dompurify from 'dompurify';

const searchResultsHTML = stores => stores.map(store => dompurify.sanitize(`
    <a href="/stores/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
    </a>
`)).join('');

const typeAhead = element => {
    if (!element) return;

    const searchInput = $('input[name="search"]');
    const searchResults = $('.search__results');

    searchInput.on('input', event => {
        const { value } = event.target;

        if (!value || value.length < 3) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.style.display = 'block';

        axios
            .get(`/api/search?q=${value}`)
            .then(res => {
                if (res.data.length) {
                    searchResults.innerHTML = searchResultsHTML(res.data);
                } else {
                    searchResults.innerHTML = dompurify.sanitize(`
                        <div class="search__result">
                            No results for ${searchInput.value} found
                        </div>
                    `);
                }
            })
            .catch(console.error);
    });

    searchInput.on('keyup', ({ keyCode }) => {
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_ENTER = 13;

        if (![KEY_UP, KEY_DOWN, KEY_ENTER].includes(keyCode)) {
            return;
        }

        const optionClass = 'search__result';
        const activeClass = optionClass + '--active';
        const items = searchResults.querySelectorAll(`.${optionClass}`);
        const current = searchResults.querySelector(`.${activeClass}`);

        let next;

        if (keyCode === KEY_ENTER) {
            window.location.href = (current || items[0]).href;
            return;
        } else if (keyCode === KEY_DOWN) {
            next = current && current.nextElementSibling
                || items[0];
        } else if (keyCode === KEY_UP) {
            next =
                current && current.previousElementSibling
                || items[items.length - 1];
        }

        current && current.classList.remove(activeClass);
        next.classList.add(activeClass);
    })
};

export default typeAhead;