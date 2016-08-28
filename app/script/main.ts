/// <reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as Mustache from 'mustache';
import * as storage from 'electron-json-storage';


export function load() {
  fs.readFile(__dirname + '/../templates/index.mst', 'utf-8', (error, template) => {
    if (error) {
      console.error(error);
    } else {
      storage.get('templates', function(error, templates) {
        if (error) {
          console.error(error);
        } else {
          let rendered = Mustache.render(template, {templates: templates});
          $('.content').html(rendered);
        }
      });
    }
  });
}
