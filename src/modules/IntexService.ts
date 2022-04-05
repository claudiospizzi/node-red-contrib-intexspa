import axios, { AxiosRequestConfig } from 'axios';
import { IntexDevice } from './IntexDevice';
import { IntexDeviceCloudStatus } from './IntexDeviceCloudStatus';
import { IntexDeviceStatus } from './IntexDeviceStatus';
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
   * Get the devices cloud status.
   * @param device The device to query.
   * @returns The device cloud status.
   */
  async getDeviceCloudStatus(device: IntexDevice): Promise<IntexDeviceCloudStatus> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/device/cloud/status/${device.deviceId}`;

    const result = await axios.get<IntexDeviceCloudStatus>(url, this.tokenRequestConfig);
    return result.data;
  }

  /**
   * Get the detailed device status like temperature and running features.
   * @param device The device to query.
   * @returns The device status.
   */
  async getDeviceStatus(device: IntexDevice): Promise<IntexDeviceStatus> {
    await this.authenticate();

    const url = `${this.baseUrl}/v1/device/lateststatus/${device.deviceId}`;

    const result = await axios.get<IntexDeviceStatus>(url, this.tokenRequestConfig);
    result.data.detail = new IntexDeviceStatusDetail(result.data.data);
    return result.data;
  }
}
