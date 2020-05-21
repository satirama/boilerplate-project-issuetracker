/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var query = req.query;
      //res.status(200).send(query)
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).find(query, {}).toArray(function(err, result) {
          res.status(200)
            .send(result);
        });  
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var body = req.body;
      var query = {
        issue_title: '',
        issue_text: '',
        assigned_to: '',
        created_by: '',
        status_text: '',
        created_on: new Date(),
        updated_on: '',
        open: true
      };
    
      Object.assign(query, body);
      //res.status(200).send(query);
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).insert(query, function(err, result) {
          db.collection(project).findOne({_id: new ObjectId(result.insertedIds[0])},
            (err, doc) => {
              res.status(200)
                .send(doc);
            });
        });  
      });
    
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var body = req.body;
      var updateQuery = {};
      if (!body.issue_title && !body.issue_text && !body.assigned_to && !body.created_by && !body.status_text)
          res.status(400).type('text').send('no updated field sent');
      Object.keys(body).forEach((key) => (!body[key] || key == '_id') && delete body[key]);
      
      body.updated_on = new Date();
      var query = {
        _id: new ObjectId(body._id)
      }
      var update = {
        $set: body
      }
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).findOneAndUpdate(
          query,
          update,
          (err, doc) => {
            if (err) res.status(500).type('text').send('could not update ' + body._id);
            res.status(200).type('text').send('successfully updated');
        });
      });
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var body = req.body;
      var query = {
        _id: new ObjectId(body._id)
      };
      
      //res.status(200).send(body._id)
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).removeOne(
          query,
          (err, doc) => {
            if (err) res.status(500).type('text').send('could not delete ' + body._id);
            res.status(200).type('text').send('deleted '+ body._id);
        });
      });
    });
    
};
