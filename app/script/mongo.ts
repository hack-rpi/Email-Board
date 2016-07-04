/// <reference path="../../typings/index.d.ts" />

import * as mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

let curr_uri = undefined;
const mongo_uri_re = new RegExp('mongodb://.+');

/**
 * 
 */
export function connect(uri: string, cb: (success: boolean) => any): void 
{
  if (! mongo_uri_re.test(uri)) {
    return cb(false);
  };
  MongoClient.connect(uri, function(error, db) {
    if (error) {
      console.error(error);
      return cb(false);
    } else {
      curr_uri = uri;
      db.close();
      return cb(true);
    }
  });
}


/**
 * 
 */
export function count(collection: string, query: Object, cb: (error: boolean, count: number) => any)
  : void
{
  if (! curr_uri) {
    console.error('Not connected to database.');
    return cb(true, null);
  }
  MongoClient.connect(curr_uri, function(error, db) {
    if (error) {
      console.error(error);
      db.close();
      return cb(true, null);
    } else {
      db.collection(collection).count(query).then((count) => {
        db.close();
        return cb(false, count);
      }).catch((reason) => {
        console.error(reason);
        db.close();
        return cb(true, null);
      });
    }
  });
}
