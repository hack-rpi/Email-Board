/// <reference path="../../typings/index.d.ts" />

import * as electron from 'electron';
import * as storage from 'electron-json-storage';
import * as popup from './popup';
const remote = electron.remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();
menu.append(new MenuItem({
  label: 'File', 
  submenu: [
      {
        label: 'Connect...',
        accelerator: 'CmdOrCtrl+D',        
        click: function() {
          storage.get('dbs', function(error, data) {
            if (error) {
              console.error(error);
            } else {
              popup.open('databases-modal.mst', 'db-dialog', data);
            }
          });
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Queries...',
        accelerator: 'CmdOrCtrl+Q',        
        click: function() {
          storage.get('queries', function(error, data) {
            if (error) {
              console.error(error);
            } else {
              popup.open('queries-modal.mst', 'query-dialog', data);
            }
          });
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Open File...'
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
      },
      {
        label: 'Save As'
      }
  ]
}));

menu.append(new MenuItem({
  label: 'Edit',
  submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
}));

menu.append(new MenuItem({
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.reload();
      }
    },
    {
      label: 'Toggle Full Screen',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Ctrl+Command+F';
        else
          return 'F11';
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Alt+Command+I';
        else
          return 'Ctrl+Shift+I';
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.webContents.toggleDevTools();
      }
    }
  ]
}));

menu.append(new MenuItem({
  label: 'Window',
  role: 'window',
  submenu: [
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
  ]
}));

menu.append(new MenuItem({
  label: 'Help',
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click: function() { 
        require('electron')
          .shell
          .openExternal('http://github.com/hack-rpi/Email-Board');
      }
    },
  ]
}));

Menu.setApplicationMenu(menu);
