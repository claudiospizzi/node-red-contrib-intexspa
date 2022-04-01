import { Node, NodeDef } from 'node-red';
import { IntexSpaConfigNode } from '../../intexspa-config/modules/types';
import { IntexSpaStatusOptions } from '../shared/types';

export interface IntexSpaStatusNodeDef extends NodeDef, IntexSpaStatusOptions {}

export interface IntexSpaStatusNode extends Node {
  account: IntexSpaConfigNode;
  device: string;
}
