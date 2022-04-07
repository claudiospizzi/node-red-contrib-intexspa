import { Node, NodeDef } from 'node-red';
import { IntexService } from '../../../modules/IntexService';
import { IntexSpaConfigNode } from '../../intexspa-config/modules/types';
import { IntexSpaActionOptions } from '../shared/types';

export interface IntexSpaActionNodeDef extends NodeDef, IntexSpaActionOptions {}

export interface IntexSpaActionNode extends Node {
  device: IntexSpaConfigNode;
  service: IntexService;
  component: string;
}
