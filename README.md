#Hybrid Store Locator

Demo: https://raminv80.github.io/hybrid-store-locator/

This is a jquery based store locator.
Features:

- Clustered google map markers
- Paginated store listing
- State based filter

##Installation
1. Run `bower install hybrid-store-locator`
2. load "dist/hybrid-store-locator.min.js" script after loading jquery and google maps library
3. Add required containers with unique ids
  - Add a container for google map. ex:
      ```html
          <div id="hsl_gmap_canvas"></div>
      ```
  - Add a container for state buttons. State buttons will apply filtering to stores using their `data-state` 
  attribute. ex:
      ```html
      <div id="hsl-state-selector">
          <button data-state="ACT">ACT</button>
          <button data-state="NSW">NSW</button>
          <button data-state="QLD">QLD</button>
          <button data-state="WA">WA</button>
          <button data-state="VIC">VIC</button>
          <button data-state="NT">NT</button>
          <button data-state="SA">SA</button>
      </div>
      ```
  - Add a container for store listing. ex:
      ```html
      <ul id="hsl-address-list"></ul>
      ```
  - Add a container for list pagination. ex:
      ```html
      <ul id="hsl-address-pagination"></ul>
      ```
4. Initiate the hybrid store locator:
    ```js
    var options = {
       mapId: 'hsl_gmap_canvas',
       listId: 'hsl-address-list',
       paginationId: 'hsl-address-pagination',
       selectorId: 'hsl-state-selector',
       zoom: 4,
       centerLat: -26.372185,
       centerLng: -225.860597,
       storesUrl: 'dist/stores.json'
    }
    var hsl = new HybridStoreLocator(options);
    google.maps.event.addDomListener(window, 'load', hsl.init());
    ```

  options object is used to configure hybrid store locator. 
  
##options

| options   | description           | default |
|-----------|-----------------------|---------|
| mapId | Id of container for google map | hsl_gmap_canvas |
| listId | Id of container for store list | hsl-address-list |
| paginationId | Id of container for pagination links | hsl-address-pagination |
| selectorId | Id of container for state selector buttons | hsl-state-selector |
| styledMap | Google map style object | a sample from https://snazzymaps.com/ |
| zoom | Google maps zoom level | 4 |
| centerLat | Google maps center latitude | -26.372185 |
| centerLng | Google maps center longitude | -225.860597 |
| cluster_options | Google maps cluster options | refer to cluster options section |
| paginationLength | Total number of visible items in pagination list divided by 2 | 3 |
| paginationItemsPerPage | Number of list items per page | 3 |
| storesUrl | Url to load stores through ajax | dist/stores.json |
| stores | Array of store objects. If provided storeUrl will be ignored. | false |

##Store Schema

In current version Store template is hard coded. Currently supporting following fields:

- `name`: [string] The store name (Appears in listing and on marker)
- `address`: [string] store address (Appears in listing and on marker)
- `state`: [string] used for filtering
- `phone`: [string] store phone(s) (Appears in listing and on marker)
- `lat`: [double] store latitude coordinate
- `lng`: [double] store longitude coordinate

##Cluster options

Cluster images by default are loaded from "/images/C[1-5].png". You can use this object to change cluster images.

This is default structure of cluster options:
```json
{
  "imagePath": "dist/images/C",
  "styles": [
    {
      "url": "dist/images/C1.png",
      "height": 53,
      "width": 37,
      "iconAnchor": [
        18.5,
        53
      ],
      "anchor": [
        10,
        0
      ],
      "textSize": "20",
      "textColor": "#B0A171"
    },
    {
      "url": "dist/images/C2.png",
      "height": 53,
      "width": 37,
      "iconAnchor": [
        18.5,
        53
      ],
      "anchor": [
        10,
        0
      ],
      "textSize": "20",
      "textColor": "#B0A171"
    },
    {
      "url": "dist/images/C3.png",
      "height": 53,
      "width": 37,
      "iconAnchor": [
        18.5,
        53
      ],
      "anchor": [
        10,
        0
      ],
      "textSize": "20",
      "textColor": "#B0A171"
    },
    {
      "url": "dist/images/C4.png",
      "height": 53,
      "width": 37,
      "iconAnchor": [
        18.5,
        53
      ],
      "anchor": [
        10,
        0
      ],
      "textSize": "20",
      "textColor": "#B0A171"
    },
    {
      "url": "dist/images/C5.png",
      "height": 53,
      "width": 37,
      "iconAnchor": [
        18.5,
        53
      ],
      "anchor": [
        10,
        0
      ],
      "textSize": "20",
      "textColor": "#B0A171"
    }
  ]
}
```
