/**
 * Type class representing the detailed Intex device status data.
 */
export class IntexDeviceStatusDetail {
  error: string | undefined;
  current_temperature: number | undefined;
  target_temperature: number | undefined;
  is_filter_running: boolean | undefined;
  is_heat_running: boolean | undefined;
  is_jet_running: boolean | undefined;
  is_bubble_running: boolean | undefined;
  is_sanitizer_running: boolean | undefined;
  is_heat_flashing_red: boolean | undefined;
  is_filter_online: boolean | undefined;
  is_heat_online: boolean | undefined;
  is_sanitizer_online: boolean | undefined;

  constructor(data: string | undefined) {
    this.parseData(data);
  }

  private parseData(data: string | undefined): void {
    if (data !== undefined) {
      // Parse the data property, yeah! The data property is more or less the
      // hex representation of a binary byte array. Starting the array with
      // byte 0. It's parsed with a lot of substring extractions.

      // Byte 7 (decimal)
      // Current Temperature or Error Code.
      //   0 ..  40 => Current Temperature in Celsius
      //  41 .. 179 => Current Temperature in Fahrenheit
      // 180 .. 199 => Error with Code 'Exx' (xx = byte7 - 100)
      // 200        => Error with Code 'End'
      const byte7hex = data.substring(14, 16);
      const byte7dec = IntexDeviceStatusDetail.hex2dec(byte7hex);
      if (byte7dec >= 180) {
        // Error occurred: reset data, set error and exit.
        if (byte7dec >= 200) {
          this.error = 'END: Heating ended after 72h, pump hibernating';
        } else {
          const errorNr = byte7dec - 100;
          this.error = `E${errorNr}`;
          switch (errorNr) {
            case 81:
              this.error += ': Transmission signal failure';
              break;
            case 90:
              this.error += ': No water flow';
              break;
            case 91:
              this.error += ': Low salt level / Titanium plates issue / Possible electrolytic cell failure';
              break;
            case 92:
              this.error += ': High salt level';
              break;
            case 94:
              this.error += ': Water temperature to low';
              break;
            case 95:
              this.error += ': Water temperature to high';
              break;
            case 96:
              this.error += ': System error';
              break;
            case 97:
              this.error += ': Dry-fine protection';
              break;
            case 99:
              this.error += ': Water temperature sensor broken';
              break;
          }
        }
        return;
      } else {
        this.error = undefined;
        if (byte7dec <= 40) {
          this.current_temperature = byte7dec;
        } else {
          this.current_temperature = IntexDeviceStatusDetail.fahrenheit2celsius(byte7dec);
        }
      }

      // Byte 5 (binary)
      // Device Icon Show (binary mode: right to left)
      // Bit 0 => Device Online Indicator / Show Error ?!
      // Bit 1 => Filter
      // Bit 2 => Heat
      // Bit 3 => Jet
      // Bit 4 => Bubble
      // Bit 5 => Sanitize
      const byte5hex = data.substring(10, 12);
      const byte5bin = IntexDeviceStatusDetail.hex2bin(byte5hex);
      this.is_filter_running = byte5bin.substring(6, 7) === '1';
      this.is_heat_running = byte5bin.substring(5, 6) === '1';
      this.is_jet_running = byte5bin.substring(4, 5) === '1';
      this.is_bubble_running = byte5bin.substring(3, 4) === '1';
      this.is_sanitizer_running = byte5bin.substring(2, 3) === '1';

      // Byte 6 (binary)
      // Device Icon Flashing (binary mode: right to left)
      // Bit 2 => Heat (red)
      const byte6hex = data.substring(12, 14);
      const byte6bin = IntexDeviceStatusDetail.hex2bin(byte6hex);
      this.is_heat_flashing_red = byte6bin.substring(5, 6) === '1';

      // Byte 12
      // Is Filter Online
      // Bit 7 => Online: yes/no (most left bit)
      const byte12hex = data.substring(24, 26);
      const byte12bin = IntexDeviceStatusDetail.hex2bin(byte12hex);
      this.is_filter_online = byte12bin.substring(0, 1) === '1';

      // Byte 13
      // Is Sanitizer Online
      // Bit 7 => Online: yes/no (most left bit)
      const byte13hex = data.substring(26, 28);
      const byte13bin = IntexDeviceStatusDetail.hex2bin(byte13hex);
      this.is_sanitizer_online = byte13bin.substring(0, 1) === '1';

      // Byte 14
      // Is Heating Online
      // Bit 7 => Online: yes/no (most left bit)
      const byte14hex = data.substring(28, 30);
      const byte14bin = IntexDeviceStatusDetail.hex2bin(byte14hex);
      this.is_heat_online = byte14bin.substring(0, 1) === '1';

      // Byte 15 (decimal)
      // Target Temperature.
      // 10 ..  40 => Target Temperature in Celsius
      // 50 .. 104 => Target Temperature in Fahrenheit
      const byte15hex = data.substring(30, 32);
      const byte15dec = IntexDeviceStatusDetail.hex2dec(byte15hex);
      if (byte15dec >= 10 && byte15dec <= 40) {
        this.target_temperature = byte15dec;
      } else {
        this.target_temperature = IntexDeviceStatusDetail.fahrenheit2celsius(byte15dec);
      }
    }
  }

  private static hex2dec(hex: string): number {
    return parseInt(hex, 16);
  }

  private static hex2bin(hex: string): string {
    return parseInt(hex, 16).toString(2).padStart(8, '0');
  }

  private static fahrenheit2celsius(fahrenheit: number) {
    return Math.round(((fahrenheit - 32) * 5) / 9);
  }
}
