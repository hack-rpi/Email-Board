/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as fs from 'fs';
import * as marked from 'marked';
import * as Mustache from 'mustache';
import * as $ from 'jquery';
import * as tmp from 'tmp';
import * as _ from 'underscore';
import * as storage from 'electron-json-storage';
import * as main from './main';
const typeahead = require('typeahead.js-browserify');
const {dialog} = require('electron').remote;
const Bloodhound = typeahead.Bloodhound;

let tmp_files = [];

tmp.setGracefulCleanup();
typeahead.loadjQueryPlugin();


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

$('body').on('input propertychange paste', 'textarea[name="content"]', function(event) {
  let text = $(event.target).val();
  let markdown = marked(text);
  $('.email iframe').contents().find('#CONTENT').html(markdown);
});

$('body').on('typeahead:selected', 'input[name="query"]', function(event, query) {
  console.log(query);
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
      template = template.replace(/{{\s*CONTENT\s*}}/g, '<div id="CONTENT"></div>');
      let tmpobj = tmp.fileSync();
      fs.writeFileSync(tmpobj.name, template);
      fs.readFile(__dirname + '/../templates/email.mst', 'utf-8', (error, template) => {
        if (error) {
          console.error(error);
        } else {
          tmp_files.push(tmpobj);
          let rendered = Mustache.render(template, {email: tmpobj.name});
          $('.content').html(rendered);
          storage.get('queries', function(error, queries) {
            if (error) {
              console.error(error);
            } else {
              let hound = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                identify: (q) => { return q.name; },
                local: queries
              });
              $('input[name="query"]').typeahead({
                hint: true,
                minLength: 0,
                highlight: true
              }, {
                name: 'queries',
                display: 'name',
                source: hound
              });
            }
          });
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
