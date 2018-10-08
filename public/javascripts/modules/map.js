import axios from 'axios';
import { $ } from '../modules/bling';

/**
 * MAIN EXPORT
 */

const renderMap = mapElement => {
    if (!mapElement) return;

    getLocation().then(location => {
        const { coords } = location;

        if (!coords) return;

        const mapOptions = {
            center: { lat: coords.latitude, lng: coords.longitude },
            zoom: 12
        };

        const input = $('[name="geolocate"]');

        const map = new google.maps.Map(mapElement, mapOptions)
        const autocomplete = new google.maps.places.Autocomplete(input);

        loadPlaces(map, coords.latitude, coords.longitude);

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            loadPlaces(
                map,
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );
        });
    });
}

/**
 * HELPERS
 */

// get current location
const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
});

// query DB for nearby places, then enrich map with location markers
const loadPlaces = (map, lat, lng) => {
    if (!map || !lat || !lng) return;

    axios.get(`api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;

            if (!places.length) return;

            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [lng, lat] = place.location.coordinates;
                const position = { lat, lng };
                bounds.extend(position);

                const marker = new google.maps.Marker({ map, position });
                marker.place = place;

                return marker;
            });

            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);

            markers.forEach(marker => marker.addListener('click', function () {
                const html = `
                    <div class="popup">
                        <a href="/stores/${this.place.slug}">
                            <img
                                src="/uploads/${this.place.photo || 'store.png'}"
                                alt="${this.place.name}"
                            />
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;

                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));
        });
}

export default renderMap;