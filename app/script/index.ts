/// <reference path="../../typings/index.d.ts" />

require('./script/db-dialog');
require('./script/email');
require('./script/mailgun-dialog');
require('./script/menu');
require('./script/mongo');
require('./script/query-dialog');
const main = require('./script/main');

import * as fs from 'fs';
import * as Mustache from 'mustache';
import * as $ from 'jquery';
import * as storage from 'electron-json-storage';


$(document).ready(main.load);
