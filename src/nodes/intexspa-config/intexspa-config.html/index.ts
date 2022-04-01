import { EditorRED } from 'node-red';
import { IntexSpaConfigEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;

RED.nodes.registerType<IntexSpaConfigEditorNodeProperties>('intexspa-config', {
  category: 'config',
  defaults: {
    name: {
      value: '',
      required: true,
    },
    username: {
      value: '',
      required: true,
    },
    password: {
      value: '',
      required: true,
    },
  },
  label: function () {
    return this.name || 'intexspa config';
  },
});
