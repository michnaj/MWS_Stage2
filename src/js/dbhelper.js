/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.getLocalRestaurants(callback).then( response => {
      if (response) {
        DBHelper.getRestaurants(callback);
        return callback(null, response);
      }
      return DBHelper.getRestaurants(callback);
    });
  }

  // saves restaurants data in IndexedDB
  static saveRestaurants(restaurants) {
    return dbPromise.then(function(db) {
      if (!db) return;
      let tx = db.transaction('restaurants', 'readwrite');
      let store = tx.objectStore('restaurants');
      restaurants.forEach(restaurant => store.put(restaurant));
    });
  }

  static getLocalRestaurants(callback) {
    return dbPromise.then(function(db) {
      if (!db) return;
      let store = db.transaction('restaurants').objectStore('restaurants');
      return store.getAll().then(restaurants => callback(null, restaurants))
      .catch(err => callback(`Request failed. Returned ${err}`, null));
    });
  }

  static getRestaurants(callback) {
    return fetch(DBHelper.DATABASE_URL)
    .then(response => response.json())
    .then(restaurants => {
      DBHelper.saveRestaurants(restaurants);
      callback(null, restaurants)
    }).catch(err => callback(`Request failed. Returned ${err}`, null));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    return dbPromise.then(function(db) {
      if (!db) return;
      let store = db.transaction('restaurants').objectStore('restaurants');
      return store.get(parseInt(id)).then( restaurant => callback(null, restaurant) )
      .catch( () => callback(`Restaurant doesn't exist.`, null) );
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * Added size parameter - defines witch size of image should return
   */
  static imageUrlForRestaurant(restaurant, size) {
    if (!restaurant.photograph) return 'img/noimage.jpg';
    let suffix = '';
    let image = `${restaurant.photograph}.jpg`;
    if (size === 'sm') suffix = '_300px';
    else if (size === 'md') suffix = '_500px';
    let newImage = image.replace('.', suffix + '.');
    return ('img/' + newImage);
  }

  /**
   * Restaurant image alt attribute.
   */
  static imageAltAttribute(restaurant) {
    return (`Image of ${restaurant.name} Restaurant`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

/**
 * IndexedDB
 */

function openDB() {
  if ('serviceWorker' in navigator) {
    return idb.open('Restrev-db', 1, function(upgradeDb) {
      let restaurantsStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
    });
  } else {
    return Promise.resolve();
  }
}

const dbPromise = openDB();