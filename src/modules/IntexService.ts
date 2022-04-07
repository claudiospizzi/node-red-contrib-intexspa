import axios, { AxiosRequestConfig } from 'axios';
import { IntexDevice } from './IntexDevice';
import { IntexDeviceCloudStatus as IntexDeviceStatusCloud } from './IntexDeviceCloudStatus';
import { IntexDeviceCommand } from './IntexDeviceCommand';
import { IntexDeviceCommandStatus } from './IntexDeviceCommandStatus';
import { IntexDeviceStatus as IntexDeviceStatus } from './IntexDeviceStatus';
import { IntexDeviceStatusDetail } from './IntexDeviceStatusData';
import { IntexUser } from './IntexUser';

/**
 * Class representing the Intex service (API) to interact with the SPA device.
 */
export class IntexService {
  // We behave like the iOS app in Summer 2021 and expect a token timeout up to
  // one hour.
  private baseUrl = 'https://intexiotappservice.azurewebsites.net/api';
  private userAgent = 'Intex/1.0.12 (iPhone; iOS 14.7.1; Scale/3.00)';
  private tokenThreshold = 3600 * 1000;

  // Store the user and password in the service object. The password is the
  // plain text value, conversion to base64 is performed in the auth request.
  private username: string;
  private password: string;

  private tokenTimestamp = new Date(0);
  private tokenRequestConfig: AxiosRequestConfig | undefined;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * Check if the service is authenticated and the token is still valid.
   * @param force Force the re-authentication.
   */
  async authenticate(force = false): Promise<void> {
    const tokenAge = new Date().getTime() - this.tokenTimestamp.getTime();
    if (tokenAge > this.tokenThreshold || force) {
      const user = await this.getUser();

      this.tokenTimestamp = new Date();
      this.tokenRequestConfig = {
        headers: {
          'User-Agent': this.userAgent,
          Authorization: `Bearer ${user.token}`,
        },
      };
    }
  }

  /**
   * Get the user object by invoking the authentication endpoint.
   * @returns The authenticated user.
   */
  async getUser(): Promise<IntexUser> {
    const url = `${this.baseUrl}/oauth/auth`;
    const body = { account: this.username, password: Buffer.from(this.password).toString('base64') };
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': this.userAgent,
        'Content-Type': 'application/json',
      },
    };

    const result = await axios.post<IntexUser>(url, body, config);
    return result.data;
  }

  /**
   * Get all devices registered with the user.
   * @returns A list of devices.
   */
  async getDevices(): Promise<IntexDevice[]> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/userdevice/user`;

    const result = await axios.get<IntexDevice[]>(url, this.tokenRequestConfig);
    return result.data;
  }

  /**
   * Get a device by id.
   * @param deviceId The device id (guid).
   * @returns Device matching the device id.
   */
  async getDeviceById(deviceId: string): Promise<IntexDevice> {
    const devices = await this.getDevices();
    for (const device of devices) {
      if (device.deviceId === deviceId) {
        return device;
      }
    }
    throw new Error(`Device with device id ${deviceId} not found.`);
  }

  /**
   * Get a device by name.
   * @param deviceName The device alias name.
   * @returns Device matching the device name.
   */
  async getDeviceByName(deviceName: string): Promise<IntexDevice> {
    const devices = await this.getDevices();
    for (const device of devices) {
      if (device.deviceAliasName === deviceName) {
        return device;
      }
    }
    throw new Error(`Device with device name ${deviceName} not found.`);
  }

  /**
   * Get the available commands for a specific device.
   * @param device The device to query.
   * @returns List of available commands.
   */
  async getDeviceCommands(device: IntexDevice): Promise<IntexDeviceCommand[]> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/commandset/device/${device.deviceId}`;

    const result = await axios.get<IntexDeviceCommand[]>(url, this.tokenRequestConfig);
    return result.data;
  }

  /**
   * Get a single command by name. Possible value commands are: PowerOnOff,
   * FilterOnOff, HeatOnOff, JetOnOff, SanitizerOnOff, BubbleOnOff, Refresh and
   * TempSet.
   * @param device The device to query.
   * @param commandName The command name.
   * @returns The command definition or an exception if not found.
   */
  async getDeviceCommand(device: IntexDevice, commandName: string): Promise<IntexDeviceCommand> {
    const commands = await this.getDeviceCommands(device);
    for (const command of commands) {
      if (command.commandName === commandName) {
        return command;
      }
    }
    throw `Command ${commandName} not found!`;
  }

  /**
   * Invoke a command and wait until it was executed.
   * @param device The device to query.
   * @param command The command to invoke.
   * @returns The device status after the command was successful.
   */
  async invokeDeviceCommand(device: IntexDevice, command: IntexDeviceCommand): Promise<IntexDeviceStatus> {
    await this.authenticate();

    // I have no idea why the command data suffix is required. Having only one
    // Intex SPA device to check that, it's unknown, if it's specific for a
    // device or if this is a constant value for all devices. Without the
    // suffix, all commands will fail.
    let commandDataSuffix = '';
    switch (command.commandName) {
      case 'PowerOnOff':
        // Command Data: 8888060F014000
        commandDataSuffix = '98';
        break;
      case 'JetOnOff':
        // Command Data: 8888060F011000
        commandDataSuffix = 'C8';
        break;
      case 'BubbleOnOff':
        // Command Data: 8888060F010400
        commandDataSuffix = 'D4';
        break;
      case 'HeatOnOff':
        // Command Data: 8888060F010010
        commandDataSuffix = 'C8';
        break;
      case 'FilterOnOff':
        // Command Data: 8888060F010004
        commandDataSuffix = 'D4';
        break;
      case 'SanitizerOnOff':
        // Command Data: 8888060F010001
        commandDataSuffix = 'D7';
        break;
      case 'Refresh':
        // Command Data: 8888060FEE0F01
        commandDataSuffix = 'DA';
        break;
      case 'TempSet':
        // Command Data: 8888050F0Cxxxx
        // The last xxxx are set by the caller.
        commandDataSuffix = '';
        break;
      default:
        throw `Command data suffix for command ${command.commandName} not found.`;
    }

    const startUrl = `${this.baseUrl}/v1/command/${device.deviceId}`;
    const startData = { sid: `${Date.now()}`, type: '1', data: `${command.commandData}${commandDataSuffix}` };

    const startResult = await axios.post<IntexDeviceCommandStatus>(startUrl, startData, this.tokenRequestConfig);
    if (startResult.data === undefined || startResult.data.c2DCommandStatus !== 'Sended') {
      throw `Failed to invoke command ${command.commandName} on device ${device.deviceAliasName}: ${startResult.data}`;
    }

    const checkUrl = `${this.baseUrl}/v1/device/command/feedback/${device.deviceId}/${startResult.data.sessionId}`;
    let checkError = null;

    // Try five times up to 10 seconds to get a feedback.
    for (let checkNumber = 0; checkNumber < 5; checkNumber++) {
      try {
        const checkResult = await axios.get<IntexDeviceStatus>(checkUrl, this.tokenRequestConfig);
        checkResult.data.detail = new IntexDeviceStatusDetail(checkResult.data.sid, checkResult.data.data);

        // Check if the status data is ok. If not, the command failed.
        if (checkResult.data.result !== 'ok') {
          throw `The command ${command.commandName} on device ${device.deviceAliasName} failed: ${checkResult.data.result}`;
        }

        return checkResult.data;
      } catch (error) {
        // Not found. Store the error and wait 2 seconds before try again.
        checkError = error;
        await new Promise((f) => setTimeout(f, 2000));
      }
    }

    throw `Feedback for command ${command.commandName} on device ${device.deviceAliasName} not received: ${checkError}`;
  }

  /**
   * Get the devices cloud status.
   * @param device The device to query.
   * @returns The device cloud status.
   */
  async getDeviceStatusCloud(device: IntexDevice): Promise<IntexDeviceStatusCloud> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/device/cloud/status/${device.deviceId}`;

    const result = await axios.get<IntexDeviceStatusCloud>(url, this.tokenRequestConfig);
    return result.data;
  }

  /**
   * Get the latest detailed device status like temperature and running
   * features. This will not refresh the status from the device.
   * @param device The device to query.
   * @returns The device status.
   */
  async getDeviceStatusLatest(device: IntexDevice): Promise<IntexDeviceStatus> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/device/lateststatus/${device.deviceId}`;

    const result = await axios.get<IntexDeviceStatus>(url, this.tokenRequestConfig);
    result.data.detail = new IntexDeviceStatusDetail(result.data.sid, result.data.data);
    return result.data;
  }

  /**
   * Get the refreshed detailed device status like temperature and running
   * features. This will refresh the actual device status.
   * @param device The device to query.
   * @returns The device status.
   */
  async getDeviceStatusRefresh(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'Refresh');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device sanitizer.
   * @param device The device to query.
   * @returns The device status.
   */
  async setDeviceTargetTemperature(device: IntexDevice, temperature: number): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'TempSet');
    // Update the command data: Add 2 chars with the hex representation of the
    // temperature and 2 additional chars with the different between the target
    // temperature and a static value CE (dec: 206).
    command.commandData += temperature.toString(16).padStart(2, '0').toUpperCase();
    command.commandData += (206 - temperature).toString(16).padStart(2, '0').toUpperCase();
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device power.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDevicePower(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'PowerOnOff');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device jet.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDeviceJet(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'JetOnOff');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device bubble.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDeviceBubble(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'BubbleOnOff');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device heater.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDeviceHeat(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'HeatOnOff');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device filter.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDeviceFilter(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'FilterOnOff');
    return await this.invokeDeviceCommand(device, command);
  }

  /**
   * Toggle the device sanitizer.
   * @param device The device to query.
   * @returns The device status.
   */
  async toggleDeviceSanitizer(device: IntexDevice): Promise<IntexDeviceStatus> {
    const command = await this.getDeviceCommand(device, 'SanitizerOnOff');
    return await this.invokeDeviceCommand(device, command);
  }
}
