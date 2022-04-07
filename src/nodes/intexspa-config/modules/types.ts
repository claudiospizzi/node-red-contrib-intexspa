import { Node, NodeDef } from 'node-red';
import { IntexSpaConfigOptions } from '../shared/types';

export interface IntexSpaConfigNodeDef extends NodeDef, IntexSpaConfigOptions {}

export interface IntexSpaConfigNode extends Node {
  username: string;
  password: string;
  device: string;
}
