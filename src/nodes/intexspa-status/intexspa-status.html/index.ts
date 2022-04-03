import { EditorRED } from 'node-red';
import { IntexSpaStatusEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;

RED.nodes.registerType<IntexSpaStatusEditorNodeProperties>('intexspa-status', {
  category: 'function',
  color: '#499ccc',
  defaults: {
    name: {
      value: '',
    },
    account: {
      value: '',
      type: 'intexspa-config',
      required: true,
    },
    device: {
      value: '',
      required: true,
    },
  },
  inputs: 1,
  outputs: 1,
  icon: 'status.png',
  paletteLabel: 'intexspa status',
  label: function () {
    return this.name || 'intexspa status';
  },
});
