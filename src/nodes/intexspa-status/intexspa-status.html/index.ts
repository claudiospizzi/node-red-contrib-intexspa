import { EditorRED } from 'node-red';
import { IntexSpaStatusEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;

RED.nodes.registerType<IntexSpaStatusEditorNodeProperties>('intexspa-status', {
  category: 'intex spa',
  color: '#499ccc',
  defaults: {
    name: {
      value: '',
    },
    device: {
      value: '',
      type: 'intexspa-config',
      required: true,
    },
    refresh: {
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
  oneditprepare: function () {
    $('#node-input-refresh').typedInput({
      types: [
        {
          value: 'refresh',
          options: ['Yes', 'No'],
        },
      ],
    });
  },
});
