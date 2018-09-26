const autocomplete = (input, latInput, lngInput) => {
    if (!input) return;

    input.on('keydown', event => {
        if (event.keyCode === 13) event.preventDefault();
    });

    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
}

export default autocomplete;