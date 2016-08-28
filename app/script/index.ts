/// <reference path="../../typings/index.d.ts" />

require('./script/db-dialog');
require('./script/email');
require('./script/menu');
const main = require('./script/main');
require('./script/mongo');
require('./script/query-dialog');

import * as fs from 'fs';
import * as Mustache from 'mustache';
import * as $ from 'jquery';
import * as storage from 'electron-json-storage';

$(document).ready(main.load);
