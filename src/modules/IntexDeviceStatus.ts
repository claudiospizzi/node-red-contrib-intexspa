import { IntexDeviceStatusDetail } from './IntexDeviceStatusData';

/**
 * Type class representing an Intex device status.
 */
export class IntexDeviceStatus {
  sid: string | undefined;
  type: number | undefined;
  result: string | undefined;
  data: string | undefined;

  private _detail: IntexDeviceStatusDetail | undefined;

  public get detail(): IntexDeviceStatusDetail {
    if (this._detail === undefined) {
      this._detail = new IntexDeviceStatusDetail(this.data);
    }
    return this._detail;
  }

  public set detail(detail: IntexDeviceStatusDetail) {
    this._detail = detail;
  }
}
