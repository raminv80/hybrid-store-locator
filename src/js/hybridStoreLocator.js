/**
 * HybridStoreLocator class
 * * @param  {Object} hsl_options
 * - styledMap: Custom styled maps object. Get it from https://snazzymaps.com/
 * - mapId: Id of container for google map
 * - listId: Id of container for store list
 * - paginationId: Id of container for pagination links
 * - selectorId: Id of container for state selector buttons
 * - styledMap: gogole map style object
 * - zoom: zoom level
 * - centerLat
 * - centerLng
 * - cluster_options
 * - paginationLength
 * - paginationItemsPerPage
 * - storesUrl: Url to load stores. Will be ignored if stores is defined.
 * - stores: array of store address object (refer to dist/stores.json for foramt)
 */

function HybridStoreLocator(options){
    var that = this;
    this.current_list = [];
    this.current_page = 0;
    this.state_selected = false;
    this.options = {
            mapId: 'hsl_gmap_canvas',
            listId: 'hsl-address-list',
            paginationId: 'hsl-address-pagination',
            selectorId: 'hsl-state-selector',
            styledMap: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"lightness":17},{"weight":1.2},{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#e3d7bf"},{"lightness":20}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#f1ebdf"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry.fill","stylers":[{"color":"#e7d6b5"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry.fill","stylers":[{"color":"#e7d6b5"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.business","elementType":"geometry.fill","stylers":[{"color":"#b89e49"},{"lightness":"71"}]},{"featureType":"poi.government","elementType":"geometry.fill","stylers":[{"color":"#b89e49"},{"lightness":"39"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e7d6b5"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c9b166"}]}],
            zoom: 4,
            centerLat: -26.372185,
            centerLng: -225.860597,
            storesUrl: 'dist/stores.json',
            paginationItemsPerPage: 3,
            paginationLength: 3,
            stores: false
        };

    this.constructor = function(options){
        if(options){
            that.options = that.mergeOptions(that.options, options);
        }
    }

    this.log = function(msg){
        if(console) console.log(msg);
    }

    this.mergeOptions = function(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    this.stores = [];
    this.markers = [];

    this.constructor(options);

    this.init = function(){
        var mapOptions = {
            zoom: this.options.zoom,
            center:new google.maps.LatLng(this.options.centerLat, this.options.centerLng),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                mapTypeIds: ['satellite', 'hybrid', 'styled_map']
            }
        };

        var styledMapType = new google.maps.StyledMapType(this.options.styledMap, {name: 'Map'});

        that.map = new google.maps.Map(document.getElementById(this.options.mapId),mapOptions);
        that.map.mapTypes.set('styled_map', styledMapType);
        that.map.setMapTypeId('styled_map');
        this.geoLocate();

        $('#'+that.options.paginationId).on('click', '.address-pagination__index', that.updatePage);
        $('#'+that.options.selectorId+' button').click(function(){
            $(this).siblings().removeClass('button--active');
            $(this).addClass('button--active');
            that.selectState($(this).data('state'));
        });
    };

    this.geoLocate = function(){
        var tryAPIGeolocation = function(cb) {
            jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCc9-uuB1cZ5jXKFLCo9gUq9ACc9WVECPI", function(data) {
                cb({coords: {latitude: data.location.lat, longitude: data.location.lng}})
            }).fail(function(err) {
                console.log("API Geolocation error!", err);
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.geoSort, function(error) {
                switch (error.code) {
                    case error.TIMEOUT:
                        that.log("Browser geolocation error: Timeout.");
                        break;
                    case error.PERMISSION_DENIED:
                        if(error.message.indexOf("Only secure origins are allowed") == 0) {
                            tryAPIGeolocation(that.geoSort);
                        }
                        break;
                    case error.POSITION_UNAVAILABLE:
                        that.log("Browser geolocation error: Position unavailable.");
                        break;
                }
            });
        }
    }

    this.geoSort = function(position){
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        jQuery.get(that.options.storesUrl, function(stores){
            that.stores = stores.map(function(store, i){
                store.distance_p2 = Math.sqrt(Math.pow(lat-store.lat , 2) + Math.pow(lng-store.lng, 2));
                return store;
            });
            that.stores.sort(function(a,b){return (a.distance_p2) - (b.distance_p2)});
            jQuery('#js-state-selector button').removeClass('button--active');
            that.listStores();
            that.setupMarkers();
        });
    }

    this.setupMarkers = function(){
        that.markers = that.stores.map(function(location, i) {
            var marker = new google.maps.Marker({
                position: {lat: location.lat, lng: location.lng}
            });

            var infowindow = new google.maps.InfoWindow({
                content:'<div class="marker"><strong>'+location.name+'</strong><p><a target="_blank"' +
                    ' href="https://www.google.com/maps/dir//'+location.lat+','+location.lng+'">'+location.address+'</a><p></div>'
            });

            google.maps.event.addListener(marker, 'click', function(){
                infowindow.open(that.map, marker);
            });

            return marker;
        });

        var cluster_options = {imagePath: 'dist/images/C', styles: []};
        for(var i=0; i<5; i++) cluster_options.styles.push({
                url: 'dist/images/C'+(i+1)+'.png',
                height: 53,
                width: 37,
                iconAnchor: [37/2, 53],
                anchor: [10, 0],
                textSize: '20',
                textColor: '#B0A171'
            });

        if(that.options.cluster_options){
            that.options.cluster_options = that.mergeOptions(cluster_options, that.options.cluster_options);
        } else {
            that.options.cluster_options = cluster_options;
        }

        that.markerCluster = new MarkerClusterer(that.map, that.markers, that.options.cluster_options);
    }

    this.listStores = function(stores){
        if(stores){
            that.current_list = stores;
        } else {
            that.current_list = that.stores;
        }

        that.current_page = 0;
        //if(that.state_selected) 
            that.renderStores();
    }

    this.renderStores = function(){
        var dom_address_list = $('#'+that.options.listId);
        dom_address_list.html('');
        $.each(that.current_list.slice(that.current_page*that.options.paginationItemsPerPage, (that.current_page+1)*that.options.paginationItemsPerPage), function(){
            dom_address_list.append('<li class="addresses__address"><div><h5>'+this.name+'</h5><p><strong>'+this.address+'</strong><br>ph: <a href="tel:'+this.phone+'">'+this.phone+'</a><br><a href="https://www.google.com/maps/dir//'+this.lat+','+this.lng+'" target="_blank" class="get-directions">Get Directions</a></p></div></li>');
        });
        that.renderPagination(0, Math.floor(that.current_list.length/that.options.paginationItemsPerPage), that.current_page);
    }

    this.renderPagination = function(start, end, current_page){
        var dom_pagination_block = $('#'+that.options.paginationId);
        $(dom_pagination_block).html('');
        var active_class = '';
        var s = Math.max(start, that.current_page-that.options.paginationLength);
        var e = Math.min(end, that.current_page+that.options.paginationLength);
        if(end>that.options.paginationLength*2){
            if(e<end-that.options.paginationLength*2){
                e += that.options.paginationLength*2*2 - e + s;
            } else {
                s -= that.options.paginationLength*2*2 -e + s;
            }
        }
        if(that.current_page>(that.options.paginationLength*2))
            dom_pagination_block.append('<li class="address-pagination__index" data-page="'+start+'">&#x21e4;</li>');
        if(that.current_page>0)
            dom_pagination_block.append('<li rel="prev" class="address-pagination__index" data-page="'+(that.current_page-1)+'">&#x2190;</li>');
        for(var i=s; i<e; i++){
            active_class = '';
            if(i==that.current_page) active_class = 'active';
            dom_pagination_block.append('<li class="address-pagination__index '+active_class+'" data-page="'+i+'">'+(i+1)+'</li>');
        }
        if(that.current_page<end-1)
            dom_pagination_block.append('<li rel="next" class="address-pagination__index" data-page="'+(that.current_page+1)+'">&#x2192;</li>');
        if(that.current_page<(end-that.options.paginationLength*2-1))
            dom_pagination_block.append('<li class="address-pagination__index" data-page="'+(end-1)+'">&#x21e5;</li>');
    }

    this.selectState = function(state){
        that.state_selected = true;
        that.listStores(that.stores.filter(function(store){
            return store.state == state;
        }));
    }

    this.updatePage = function(){
        that.current_page = parseInt($(this).data('page'));
        that.renderStores();
    }
}