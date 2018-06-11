let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  document.getElementById('restaurant-name').innerHTML = restaurant.name;
  document.getElementById('restaurant-type').innerHTML = `Cuisine type ${restaurant.cuisine_type}`;
  document.getElementById('restaurant-address').innerHTML = `Address ${restaurant.address}`;

  const description = document.getElementById('restaurant-description');
  description.style.backgroundImage = `url('${DBHelper.imageUrlForRestaurant(restaurant, '')}')`;
  description.style.backgroundSize = "cover";
  description.style.backgroundRepeat = "no-repeat";
  description.style.backgroundPosition = "center center";
  description.setAttribute("role", "img");
  description.setAttribute("aria-label", `Image of  ${restaurant.name} restaurant`);
  // description.innerHTML = `Serving <strong>${restaurant.cuisine_type}</strong> at <strong>${restaurant.address}</strong>`;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const day = document.createElement('td');
    day.tabIndex = 0;
    day.innerHTML = `<strong>${key}</strong>`;

    const time = document.createElement('td');
    time.tabIndex = 0;
    time.innerHTML = operatingHours[key];

    const row = document.createElement('tr');
    row.appendChild(day);
    row.appendChild(time);
    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('restaurant-container');
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h3');
  name.tabIndex = 0;
  name.innerHTML = `Review by <strong>${review.name}</strong> on <strong>${review.date}</strong><br/>Rating <strong>${review.rating}</strong>`;
  li.appendChild(name);

  const comments = document.createElement('p');
  comments.tabIndex = 0;
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const a = document.createElement('a');
  a.href = "#";
  a.title = `${restaurant.name} restaurant details`;
  a.innerHTML = restaurant.name;
  a.setAttribute("aria-current", "page");

  const li = document.createElement('li');
  li.append(a);

  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
