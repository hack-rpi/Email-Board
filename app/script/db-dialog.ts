/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as $ from 'jquery';
import * as _ from 'underscore';
import * as storage from 'electron-json-storage';

let index = 0;

interface DBEntry {
  name: string;
  url: string;
}

$('body').on('click', '#db-dialog .db-btn', function(event) {
  let $btn = $(event.target),
      action = $btn.attr('data-action'),
      target = $btn.attr('data-target'),
      $resp = $('#db-dialog form .response');
  switch (action) {
    case 'connect':
      pushResponse($resp, 'Attempting to connect to \'' + target + '\'');
      break;
    case 'view':
      pushResponse($resp, target);
      break;
    case 'remove':
      storage.get('dbs', function(error, dbs) {
        if (error) {
          console.error(error);
        } else {
          dbs = _.filter(dbs, (db: DBEntry) => { return db.name !== target; });
          storage.set('dbs', dbs, function(error) {
            if (error) {
              console.error(error);
            } else {
              $('#db-dialog .db-list li[name="' + target + '"]').remove();
              pushResponse($resp, 'Removed \'' + target + '\' successfully.');
            }
          })
        }
      })
      break;
    default:
      break;
  }
});

$('body').on('click', '#db-dialog #add-btn', function(event) {
  let $form = $('#db-dialog form'),
      $name = $form.find('input[name="Name"]'),
      $url = $form.find('input[name="MongoDB URL"]'),
      $resp = $form.find('.response');
  if ($name.val() === '') {
    pushResponse($resp, 'Name field cannot be empty.');
    return;
  }
  storage.get('dbs', function(error, dbs) {
    if (error) {
      console.error(error);
    } else {
      if (_.contains(_.map(dbs, (db: DBEntry) => { return db.name; }), $name.val())) {
        pushResponse($resp, 'Key already exists.');
      } else {
        if (_.isEmpty(dbs)) {
          dbs = [];
        }
        dbs.push({
          name: $name.val(),
          url: $url.val()
        });
        storage.set('dbs', dbs, function(error) {
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


function pushResponse($box: JQuery, msg: string) {
  let i = index;
  $box.append('<p id="' + i + '">' + msg + '</p>');
  index++;
  setTimeout(() => {
    $box.find('p#' + i).remove();
  }, 2000);
}
