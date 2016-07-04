/// <reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as $ from 'jquery';
import * as Mustache from 'mustache';

let in_focus = undefined;

export function open(name: string, id: string, data: any): void {
  if (id === in_focus) return;
  $('#' + id).remove();
  fs.readFile(__dirname + '/../templates/' + name, 'utf-8', (error, template) => {
    if (error) {
      console.error(error);
    } else {
      let rendered = Mustache.render(template, {data: data});
      $('body').append(rendered);
      in_focus = id;
    }
  });
}

export function close() {
  $('#' + in_focus).remove();
  in_focus = undefined;
}

$('body').on('click', '.close', close);
$('body').on('click', '.overlay', close);
$('body').on('click', '.popup', function(event) {
  event.stopPropagation();
});
