/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as fs from 'fs';
import * as Mustache from 'mustache';
import * as $ from 'jquery';
import * as tmp from 'tmp';
import * as _ from 'underscore';
import * as storage from 'electron-json-storage';
import * as main from './main';
const {dialog} = require('electron').remote;

let tmp_files = [];

tmp.setGracefulCleanup();


$('body').on('click', '.button#load-template', function(event) {
  dialog.showOpenDialog(
  {
    title: 'Open New Email Template',
    filters: [
      {name: 'Templates', extensions: ['html']},
      {name: 'All Files', extensions: ['*']}
    ]
  }, function(fileNames: string[]) {
    if (fileNames !== undefined) {
      storage.get('templates', function(error, templates) {
        if (_.isEmpty(templates)) {
          templates = [];
        }
        if (! _.contains(templates, fileNames[0])) {
          templates.push(fileNames[0]);
          storage.set('templates', templates, function(error) {
            if (error) {
              console.error(error);
            }
          });
        }
      });
      openTemplate(fileNames[0]);
    }
  });
});

$('body').on('click', '.button#load-recent-template', function(event) {
  let filename = $(event.target).html();
  openTemplate(filename);
});

$('body').on('click', '.button#close-email', function(event) {
  cleanup();
  main.load();
});


function openTemplate(filename: string): void {
  fs.readFile(filename, 'utf-8', (error, template) => {
    if (error) {
      console.error(error);
    } else {
      let renderedEmail = Mustache.render(template, {}),
          tmpobj = tmp.fileSync();
      fs.writeFileSync(tmpobj.name, renderedEmail);
      fs.readFile(__dirname + '/../templates/email.mst', 'utf-8', (error, template) => {
        if (error) {
          console.error(error);
        } else {
          tmp_files.push(tmpobj);
          let rendered = Mustache.render(template, {email: tmpobj.name});
          $('.content').html(rendered);
        }
      });
    }
  });
}


export function cleanup(): void {
  for (var i=0; i<tmp_files.length; i++) {
    tmp_files[i].removeCallback();
  }
}
