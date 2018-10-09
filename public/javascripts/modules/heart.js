import axios from 'axios';
import { $ } from './bling';

const ajaxHeart = event => {
    event.preventDefault();

    const { target: form } = event;

    axios
        .post(form.action)
        .then(res => {
            const isHearted = form.heart.classList.toggle('heart__button--hearted');
            $('.heart-count').textContent = res.data.hearts.length;

            if (isHearted) {
                form.heart.classList.add('heart__button--float');
                setTimeout(() => {
                    form.heart.classList.remove('heart__button--float');
                }, 2500);
            }
        })
        .catch(console.error)
}

export default ajaxHeart;