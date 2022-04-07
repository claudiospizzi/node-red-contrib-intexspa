import { NodeInitializer } from 'node-red';
import { IntexSpaConfigNode, IntexSpaConfigNodeDef } from './modules/types';

const nodeInit: NodeInitializer = (RED): void => {
  function IntexSpaConfigNodeConstructor(this: IntexSpaConfigNode, config: IntexSpaConfigNodeDef): void {
    RED.nodes.createNode(this, config);
    this.username = config.username;
    this.password = config.password;
    this.device = config.device;
  }

  RED.nodes.registerType('intexspa-config', IntexSpaConfigNodeConstructor);
};

export = nodeInit;
