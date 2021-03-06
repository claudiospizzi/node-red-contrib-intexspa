import { Node, NodeDef } from 'node-red';
import { IntexService } from '../../../modules/IntexService';
import { IntexSpaConfigNode } from '../../intexspa-config/modules/types';
import { IntexSpaStatusOptions } from '../shared/types';

export interface IntexSpaStatusNodeDef extends NodeDef, IntexSpaStatusOptions {}

export interface IntexSpaStatusNode extends Node {
  device: IntexSpaConfigNode;
  service: IntexService;
  refresh: string;
}
