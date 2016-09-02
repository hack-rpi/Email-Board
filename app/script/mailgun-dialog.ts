/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../definitions/index.d.ts" />

import * as $ from 'jquery';
import * as storage from 'electron-json-storage';
import {close} from './popup';

export let api_key = '';
export let domain = '';

storage.get('mailgun', function(error, data) {
  if (error) {
    console.error(error);
  } else {
    api_key = data.api_key;
    domain = data.domain;
  }
});

$('body').on('click', '#mailgun-dialog .button#save', function(event) {
  api_key = $('#mailgun-dialog input[name="API Key"]').val();
  domain  = $('#mailgun-dialog input[name="Domain"]').val();
  storage.set('mailgun', { api_key: api_key, domain: domain}, function(error) {
    if (error) {
      console.error(error);
    }
  });
  close();
});
