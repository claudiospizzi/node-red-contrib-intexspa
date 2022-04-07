import { NodeInitializer } from 'node-red';
import { IntexService } from '../../modules/IntexService';
import { IntexSpaConfigNode } from '../intexspa-config/modules/types';
import { IntexSpaActionNode, IntexSpaActionNodeDef } from './modules/types';

const nodeInit: NodeInitializer = (RED): void => {
  function IntexSpaActionNodeConstructor(this: IntexSpaActionNode, config: IntexSpaActionNodeDef): void {
    RED.nodes.createNode(this, config);
    this.device = RED.nodes.getNode(config.device) as IntexSpaConfigNode;
    this.component = config.component;

    // Create the service once per node to reuse the access token.
    this.service = new IntexService(this.device.username, this.device.password);

    this.on('input', async (msg, send, done) => {
      this.status({ fill: 'blue', shape: 'dot', text: 'running' });
      try {
        const device = await this.service.getDeviceByName(this.device.device);

        if (this.component === 'Target Temperature') {
          if (typeof msg.payload !== 'number') {
            throw `The message payload is not a number.`;
          }

          const result = await this.service.setDeviceTargetTemperature(device, msg.payload);
          if (result.detail.target_temperature !== msg.payload) {
            throw `Failed to set the target temperature ${msg.payload}. Please use between 10 and 40 degree celsius.`;
          }

          msg.payload = result.detail;
        } else {
          if (typeof msg.payload !== 'boolean') {
            throw `The message payload is not a boolean.`;
          }

          const status = await this.service.getDeviceStatusRefresh(device);

          switch (this.component) {
            case 'Jet On/Off':
              if (status.detail.is_jet_running !== msg.payload) {
                const result = await this.service.toggleDeviceJet(device);
                msg.payload = result.detail;
              } else {
                msg.payload = status.detail;
              }
              break;

            case 'Bubble On/Off':
              if (status.detail.is_bubble_running !== msg.payload) {
                const result = await this.service.toggleDeviceBubble(device);
                msg.payload = result.detail;
              } else {
                msg.payload = status.detail;
              }
              break;

            case 'Heater On/Off':
              if (status.detail.is_heat_running !== msg.payload) {
                const result = await this.service.toggleDeviceHeat(device);
                msg.payload = result.detail;
              } else {
                msg.payload = status.detail;
              }
              break;

            case 'Filter On/Off':
              if (status.detail.is_filter_running !== msg.payload) {
                const result = await this.service.toggleDeviceFilter(device);
                msg.payload = result.detail;
              } else {
                msg.payload = status.detail;
              }
              break;

            case 'Sanitizer On/Off':
              if (status.detail.is_sanitizer_running !== msg.payload) {
                const result = await this.service.toggleDeviceSanitizer(device);
                msg.payload = result.detail;
              } else {
                msg.payload = status.detail;
              }
              break;
          }
        }

        // Refresh the current status to check
        // const

        // // First, get the device by it's name. The device object is required to
        // // get the (cloud) status.
        // const device = await intexService.getDeviceByName(this.device.device);

        // // const command = await intexService.getDeviceCommand(device, 'FilterOnOff');
        // const refreshCommand = await intexService.getDeviceCommand(device, 'Refresh');
        // const refreshResult = await intexService.invokeDeviceCommand(device, refreshCommand);
        // const refreshStatus = await intexService.getDeviceCommandStatus(device, refreshResult);
        // if (refreshStatus.result !== 'ok') {
        //   throw `The device ${this.device.device} command failed: ${refreshStatus.result}`;
        // }

        // const filterCommand = await intexService.getDeviceCommand(device, 'FilterOnOff');
        // const filterResult = await intexService.invokeDeviceCommand(device, filterCommand);
        // const filterStatus = await intexService.getDeviceCommandStatus(device, filterResult);
        // if (filterStatus.result !== 'ok') {
        //   throw `The device ${this.device.device} command failed: ${filterStatus.result}`;
        // }

        // msg.payload = refreshStatus.detail;
        // {
        //   refresh: refreshStatus,
        //   // filter: filterStatus,
        // };

        this.status({ fill: 'green', shape: 'dot', text: 'successful' });
        send(msg);
        done();
      } catch (error) {
        this.status({ fill: 'red', shape: 'dot', text: 'failed' });
        done(error instanceof Error ? error : new Error(`Unknown: ${error}`));
      }
    });
  }

  RED.nodes.registerType('intexspa-action', IntexSpaActionNodeConstructor);
};

export = nodeInit;
