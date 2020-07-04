/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const { expect } = require("chai");
const MongoClient = require("mongodb");
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_STRING = process.env.DB; // MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = (app) => {
  app
    .route("/api/issues/:project")

    .get((req, res) => {
      const { project } = req.params;
    })

    .post((req, res) => {
      const { project } = req.params;
    })

    .put((req, res) => {
      const { project } = req.params;
    })

    .delete((req, res) => {
      const { project } = req.params;
    });
};
