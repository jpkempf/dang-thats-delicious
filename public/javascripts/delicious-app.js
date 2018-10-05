import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import autosuggest from './modules/autosuggest';

autocomplete($('#address'), $('#lat'), $('#lng'));
autosuggest($('[name="search"]'));