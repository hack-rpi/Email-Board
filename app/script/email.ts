/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as fs from 'fs';
import {api_key, domain} from './mailgun-dialog';
import * as marked from 'marked';
import * as Mustache from 'mustache';
import * as mongo from './mongo';
import * as $ from 'jquery';
import * as tmp from 'tmp';
import * as _ from 'underscore';
import * as storage from 'electron-json-storage';
import * as main from './main';
const mailgun = require('mailgun-js');
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
  $('dd#query-name').text(query.name);
  $('dd#query-query').text(query.collection + '@' + query.query);
  $('dd#query-count').text('...');  
  mongo.count(query.collection, query.query, function(error, count) {
    if (error) {
      console.error(error);
      $('dd#query-count').text('error');
    } else {
      $('dd#query-count').text(count);
    }
  });
});

$('body').on('click', '.button#send-email', function(event) {
  sendEmail();
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


function sendEmail() {
  const mailer = mailgun({ apiKey: api_key, domain: domain });
  let from_email = $('input[name="from"]').val(),
      subject = $('input[name="subject"]').val(),
      content = $('textarea[name="content"]').val(),
      html = $('.email iframe').contents().find('html').html();
  let email_fields = $('input[name="email"]').val(),
      name_fields = $('input[name="name"]').val();
  let query = $('dd#query-query').text(),
      collection = '',
      bits = query.split('@');
  if (query === '') {
    console.error('must select query');
    return;
  }
  collection = bits[0];
  query = bits[1];
  if (from_email === '') {
    console.error('from field cannot be empty');
    return;
  }
  if (subject === '') {
    console.error('subject field cannot be empty');
    return;
  }
  if (content === '') {
    console.error('content cannot be empty');
    return;
  }
  if (email_fields === '') {
    console.error('email cannot be empty');
    return;
  }
  if (name_fields === '') {
    console.error('name cannot be empty');
    return;
  }
  mongo.find(collection, JSON.parse(query), (error, data) => {
    if (error) {
      console.error('query failed');
      return;
    } else {
      for (let i=0; i<data.length; i++) {
        let email = getNestedProperty(data[i], email_fields),
            name = getNestedProperty(data[i], name_fields);
        let request = {
          from: from_email,
          to: email,
          subject: subject,
          text: content,
          html: Mustache.render(html, {name: name})
        };
        mailer.messages().send(request, function(error, body) {
          if (error) {
            console.error(error);
          } else {
            console.log(body);
          }
        });
      } /* END FOR */
    }
  }); /* END MONGO FIND */  
}


function cleanup(): void {
  for (var i=0; i<tmp_files.length; i++) {
    tmp_files[i].removeCallback();
  }
}


function getNestedProperty(object: Object, fields: string): any {
  let bits = fields.split('.');
  for (let i=0; i<bits.length; i++) {
    object = object[bits[i]];
  }
  return object;
}
