import { NodeInitializer } from 'node-red';
import { IntexService } from '../../modules/IntexService';
import { IntexSpaConfigNode } from '../intexspa-config/modules/types';
import { IntexSpaStatusNode, IntexSpaStatusNodeDef } from './modules/types';

const nodeInit: NodeInitializer = (RED): void => {
  function IntexSpaStatusNodeConstructor(this: IntexSpaStatusNode, config: IntexSpaStatusNodeDef): void {
    RED.nodes.createNode(this, config);
    this.account = RED.nodes.getNode(config.account) as IntexSpaConfigNode;
    this.device = config.device;

    this.on('input', (msg, send, done) => {
      this.status({ fill: 'blue', shape: 'dot', text: 'running' });

      const intexService = new IntexService(this.account.username, this.account.password);
      intexService
        .getDeviceByName(this.device)
        .then((device) => {
          intexService
            .getDeviceStatus(device)
            .then((deviceStatus) => {
              this.status({ fill: 'green', shape: 'dot', text: 'successful' });

              msg.payload = deviceStatus.detail;

              send(msg);
              done();
            })
            .catch((error) => {
              this.status({ fill: 'red', shape: 'dot', text: 'failed' });

              done(error);
            });
        })
        .catch((error) => {
          this.status({ fill: 'red', shape: 'dot', text: 'failed' });

          done(error);
        });
    });
  }

  RED.nodes.registerType('intexspa-status', IntexSpaStatusNodeConstructor);
};

export = nodeInit;
