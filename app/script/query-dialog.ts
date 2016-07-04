/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as $ from 'jquery';
import * as _ from 'underscore';
import * as storage from 'electron-json-storage';
import * as mongo from './mongo';

let index = 0;

interface QueryEntry {
  name: string;
  collection: string;
  query: string;
}

$('body').on('click', '#query-dialog .query-btn', function(event) {
  let $btn = $(event.target),
      action = $btn.attr('data-action'),
      target = $btn.attr('data-target'),
      $resp = $('#query-dialog form .response');
  switch (action) {
    case 'email':
      pushResponse($resp, 'Emailing \'' + target + '\'');
      break;
    case 'view':
      pushResponse($resp, target);
      let bits = target.split('@'),
          collection = bits[0],
          query = JSON.parse(bits[1]);
      mongo.count(collection, query, function(error, count) {
        if (error) {
          return pushResponse($resp, 'Query failed.');
        } else {
          return pushResponse($resp, 'Received: ' + count + ' results.');
        }
      });
      break;
    case 'remove':
      storage.get('queries', function(error, queries) {
        if (error) {
          console.error(error);
        } else {
          queries = _.filter(queries, (q: QueryEntry) => { return q.name !== target; });
          storage.set('queries', queries, function(error) {
            if (error) {
              console.error(error);
            } else {
              $('#query-dialog .query-list li[name="' + target + '"]').remove();
              pushResponse($resp, 'Removed \'' + target + '\' successfully.');
            }
          });
        }
      });
      break;
    default:
      break;
  }
});

$('body').on('click', '#query-dialog #add-btn', function(event) {
  let $form = $('#query-dialog form'),
      $name = $form.find('input[name="Name"]'),
      $collection = $form.find('input[name="Collection"]'),
      $query = $form.find('textarea[name="Query"]'),
      $resp = $form.find('.response');
  if ($name.val() === '') {
    return pushResponse($resp, 'Name field cannot be empty.');
  }
  if ($collection.val() === '') {
    return pushResponse($resp, 'Collection field cannot be empty.');
  }
  try {
    JSON.parse($query.val());
  } catch (e) {
    return pushResponse($resp, 'Invalid query.');
  }
  storage.get('queries', function(error, queries) {
    if (error) {
      console.error(error);
    } else {
      if (_.contains(_.map(queries, (q: QueryEntry) => { return q.name; }), $name.val())) {
        pushResponse($resp, 'Key already exists.');
      } else {
        if (_.isEmpty(queries)) {
          queries = [];
        }
        queries.push({
          name: $name.val(),
          collection: $collection.val(),
          query: $query.val()
        });
        storage.set('queries', queries, function(error) {
          if (error) {
            console.error(error);
          } else {
            pushResponse($resp, 'Entry added successfully.');
          }
        });
      }
    }
  });
});


function pushResponse($box: JQuery, msg: string): void {
  let i = index;
  $box.append('<p id="' + i + '">' + msg + '</p>');
  index++;
  setTimeout(() => {
    $box.find('p#' + i).remove();
  }, 2000);
}
