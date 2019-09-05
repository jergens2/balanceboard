import { ColorType } from "./color-type.enum";

export class ColorConverter {

    public static convert(inputString: string, outputType: ColorType) {

        function hexToRgb(hex: string, alpha: number) {
            var r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16);

            if (alpha) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
            } else {
                return "rgb(" + r + ", " + g + ", " + b + ")";
            }
        }

        function RgbToHex(rgb: string) {

        }


    }
}