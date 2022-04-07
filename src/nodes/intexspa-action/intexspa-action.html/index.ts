import { EditorRED } from 'node-red';
import { IntexSpaActionEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;

RED.nodes.registerType<IntexSpaActionEditorNodeProperties>('intexspa-action', {
  category: 'function',
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
    component: {
      value: '',
      required: true,
    },
  },
  inputs: 1,
  outputs: 1,
  icon: 'action.png',
  paletteLabel: 'intexspa action',
  label: function () {
    return this.name || 'intexspa action';
  },
  oneditprepare: function () {
    $('#node-input-component').typedInput({
      types: [
        {
          value: 'component',
          options: [
            'Target Temperature',
            'Jet On/Off',
            'Bubble On/Off',
            'Heater On/Off',
            'Filter On/Off',
            'Sanitizer On/Off',
          ],
        },
      ],
    });
  },
});
