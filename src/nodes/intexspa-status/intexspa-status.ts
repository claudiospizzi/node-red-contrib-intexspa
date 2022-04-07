import { NodeInitializer } from 'node-red';
import { IntexService } from '../../modules/IntexService';
import { IntexSpaConfigNode } from '../intexspa-config/modules/types';
import { IntexSpaStatusNode, IntexSpaStatusNodeDef } from './modules/types';

const nodeInit: NodeInitializer = (RED): void => {
  function IntexSpaStatusNodeConstructor(this: IntexSpaStatusNode, config: IntexSpaStatusNodeDef): void {
    RED.nodes.createNode(this, config);
    this.device = RED.nodes.getNode(config.device) as IntexSpaConfigNode;
    this.refresh = config.refresh;

    // Create the service once per node to reuse the access token.
    this.service = new IntexService(this.device.username, this.device.password);

    this.on('input', async (msg, send, done) => {
      this.status({ fill: 'blue', shape: 'dot', text: 'running' });
      try {
        const device = await this.service.getDeviceByName(this.device.device);

        if (this.refresh === 'Yes') {
          // Now check if the device is online and the status is ok. This call
          // will perform a refresh on the device itself.
          const status = await this.service.getDeviceStatusRefresh(device);
          msg.payload = status.detail;
        } else {
          // Just get the latest cloud status of the device without refreshing
          // the actual status.
          const status = await this.service.getDeviceStatusLatest(device);
          msg.payload = status.detail;
        }

        this.status({ fill: 'green', shape: 'dot', text: 'successful' });
        send(msg);
        done();
      } catch (error) {
        this.status({ fill: 'red', shape: 'dot', text: 'failed' });
        done(error instanceof Error ? error : new Error(`Unknown: ${error}`));
      }
    });
  }

  RED.nodes.registerType('intexspa-status', IntexSpaStatusNodeConstructor);
};

export = nodeInit;
