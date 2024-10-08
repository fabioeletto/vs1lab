// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require('../models/geotag-examples');

const store = new GeoTagStore();
GeoTagExamples.tagList.forEach(([name, latitude, longitude, hashtag]) =>
  store.addGeoTag(new GeoTag(latitude, longitude, name, hashtag))
);
const DEFAULT_RADIUS = 0.1;


// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (_, res) => {
  res.render('index', { tagList: [], latitude: "", longitude: ""  })
});

router.post("/tagging", (req, res) => {
  const { name, hashtag, latitude, longitude } = req.body;
  store.addGeoTag(new GeoTag(latitude, longitude, name, hashtag));
  const tags = store.getNearbyGeoTags(latitude, longitude, DEFAULT_RADIUS);
  res.render("index", {
    tagList: tags,
    latitude: latitude,
    longitude: longitude,
  });
});

router.post("/discovery", (req, res) => {
  const { searchTerm, hiddenLatitude, hiddenLongitude } = req.body;
  let tags = [];
  if (searchTerm) {
    tags = store.searchNearbyGeoTags(
      hiddenLatitude,
      hiddenLongitude,
      DEFAULT_RADIUS,
      searchTerm
    );
  } else {
    tags = store.getNearbyGeoTags(
      hiddenLatitude,
      hiddenLongitude,
      DEFAULT_RADIUS
    );
  }
  return res.render("index", {
    tagList: tags,
    latitude: hiddenLatitude,
    longitude: hiddenLongitude,
  });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchTerm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
router.get('/api/geotags', (req, res) => {
  const { searchTerm, latitude, longitude } = req.query;
  let tags = store.getGeoTags();
  if (searchTerm && latitude && longitude) {
    tags = store.searchNearbyGeoTags(latitude, longitude, DEFAULT_RADIUS, searchTerm);
  }
  if (latitude && longitude) {
    tags = store.getNearbyGeoTags(latitude, longitude, DEFAULT_RADIUS);
  }
  if (searchTerm) {
    tags = store.searchGeoTags(searchTerm);
  }

  res.json(tags);
});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.post('/api/geotags', (req, res) => {
  const { name, latitude, longitude, hashtag } = req.body;
  const newTag = new GeoTag(latitude, longitude, name, hashtag);
  store.addGeoTag(newTag);
  res.location(`/api/geotags/${newTag.id}`);
  res.status(201).json(newTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.get('/api/geotags/:id', (req, res) => {
  const tag = store.getGeoTagById(req.params.id);
  if (tag) {
    res.status(200).json(tag);
  } else {
    res.status(404).end();
  }
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id', (req, res) => {
  const updatedTag = store.updateGeoTag(req.params.id, req.body);
  if (updatedTag) {
    res.status(200).json(updatedTag);
  } else {
    res.status(404).end();
  }
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.delete('/api/geotags/:id', (req, res) => {
  const tag = store.getGeoTagById(req.params.id);
  if (tag) {
    store.removeGeoTag(tag.name);
    res.json(tag);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
