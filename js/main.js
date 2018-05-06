let restaurants,neighborhoods,cuisines;var map,markers=[];const repository="";function registerServiceWorker(){"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register(`${repository}/sw.js`,{scope:`${repository}/`}).then(function(e){}).catch(function(e){console.log("ServiceWorker registration failed!")})})}document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),r=e.selectedIndex,n=t.selectedIndex,s=e[r].value,o=t[n].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(s,o,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),r=document.createElement("img");r.className="restaurant-img",r.setAttribute("alt",DBHelper.imageAltAttribute(e)),r.src=DBHelper.imageUrlForRestaurant(e,"sm"),t.append(r);const n=document.createElement("h3");n.innerHTML=e.name,t.append(n);const s=document.createElement("p");s.classList.add("neighborhood"),s.innerHTML=e.neighborhood,t.append(s);const o=document.createElement("p");o.innerHTML=e.address,t.append(o);const a=document.createElement("a");return a.innerHTML="View Details",a.href=DBHelper.urlForRestaurant(e),t.append(a),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),registerServiceWorker();