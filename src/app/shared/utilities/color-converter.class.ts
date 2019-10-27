import { ColorType } from "./color-type.enum";

export class ColorConverter {

    public static convert(inputString: string, outputType: ColorType, alpha?: number): string {
        //alpha is for rgbA
        const inputType = ColorConverter.determineInputType(inputString);
        if(inputType){
            if (inputType === ColorType.Hexadecimal) {
                if (outputType === ColorType.Hexadecimal) {
                    return inputString;
                } else if (outputType === ColorType.HexadecimalShort) {
                    return ColorConverter.fullHexTo3Hex(inputString);
                } else if (outputType === ColorType.RGB) {
                    return ColorConverter.hexToRGB(inputString);
                } else if (outputType === ColorType.RGBA) {
                    return ColorConverter.hexToRGBA(inputString, alpha);
                }
            } else if (inputType === ColorType.HexadecimalShort) {
                if (outputType === ColorType.Hexadecimal) {
                    return ColorConverter.shortHexTo6Hex(inputString);
                } else if (outputType === ColorType.HexadecimalShort) {
                    return inputString;
                } else if (outputType === ColorType.RGB) {
                    return ColorConverter.hexToRGB(ColorConverter.shortHexTo6Hex(inputString));
                } else if (outputType === ColorType.RGBA) {
                    return ColorConverter.hexToRGBA(ColorConverter.shortHexTo6Hex(inputString), alpha);
                }
            } else if (inputType === ColorType.RGB) {
                if (outputType === ColorType.Hexadecimal) {
                    return ColorConverter.rgbToHex(inputString);
                } else if (outputType === ColorType.HexadecimalShort) {
                    return ColorConverter.fullHexTo3Hex(ColorConverter.rgbToHex(inputString));
                } else if (outputType === ColorType.RGB) {
                    return inputString;
                } else if (outputType === ColorType.RGBA) {
                    return ColorConverter.rgbToRGBA(inputString, alpha)
                }
            } else if (inputType === ColorType.RGBA) {
                if (outputType === ColorType.Hexadecimal) {
                    return ColorConverter.rgbaToHex(inputString);
                } else if (outputType === ColorType.HexadecimalShort) {
                    return ColorConverter.fullHexTo3Hex(ColorConverter.rgbaToHex(inputString));
                } else if (outputType === ColorType.RGB) {
                    return ColorConverter.rgbaToRGB(inputString);
                } else if (outputType === ColorType.RGBA) {
                    return ColorConverter.rgbToRGBA(ColorConverter.rgbaToRGB(inputString), alpha);
                }
            }
        }else{
            console.log("Error could not convert color: ", inputString);
            return inputString;
        }
    }

    public static determineInputType(inputString: string): ColorType {
        const hexShortRegex: RegExp = new RegExp(/(#[a-fA-F0-9]{3})/g);
        const hexFullRegex: RegExp = new RegExp(/(#[a-fA-F0-9]{6})/g);
        const rgbRegex: RegExp = new RegExp(/^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i);
        const rgbaRegex: RegExp = new RegExp(/^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i);
        if (inputString.match(hexShortRegex) && inputString.length == 4) {
            // console.log(inputString + " is of color type short Hexadecimal")
            return ColorType.HexadecimalShort;
        } else if (inputString.match(hexFullRegex) && inputString.length == 7) {
            // console.log(inputString + " is of color type full Hexadecimal")
            return ColorType.Hexadecimal;
        } else if (inputString.match(rgbRegex)) {
            // console.log(inputString + " is of color type RGB")
            return ColorType.RGB;
        } else if (inputString.match(rgbaRegex)) {
            // console.log(inputString + " is of color type RGBA")
            return ColorType.RGBA;
        } else {
            console.log("Error:  could not determine color type of inputString: ", inputString);
            return null
        }
    }

    public static shortHexTo6Hex(shortHex: string): string {
        const first: string = shortHex[1];
        const second: string = shortHex[2];
        const third: string = shortHex[3];
        return "#" + first + first + second + second + third + third;
    }
    public static fullHexTo3Hex(fullHex: string): string {
        const first: string = fullHex[1];
        const second: string = fullHex[3];
        const third: string = fullHex[5];
        return "#" + first + second + third;
    }

    public static hexToRGB(hex: string): string {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
    public static hexToRGBA(hex: string, alpha?: number): string {
        if (!alpha) alpha = 1;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }

    public static rgbToHex(inputString: string): string {
        let rgb = inputString.substr(4).split(")")[0].split(","),
            r = (+rgb[0]).toString(16),
            g = (+rgb[1]).toString(16),
            b = (+rgb[2]).toString(16);
        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;
        return "#" + r + g + b;
    }
    public static rgbToRGBA(rgb: string, alpha?: number): string {
        if (!alpha) alpha = 1;
        let r = rgb.substr(4).split(")")[0].split(",")[0];
        let g = rgb.substr(4).split(")")[0].split(",")[1];
        let b = rgb.substr(4).split(")")[0].split(",")[2];
        return "rgba("+r+","+g+","+b+","+alpha+")";
    }

    public static rgbaToRGB(rgba: string): string {
        let r = rgba.substr(5).split(")")[0].split(",")[0];
        let g = rgba.substr(5).split(")")[0].split(",")[1];
        let b = rgba.substr(5).split(")")[0].split(",")[2];
        return "rgb("+r+","+g+","+b+")";
    }
    public static rgbaToHex(rgba: string): string {
        return ColorConverter.rgbToHex(ColorConverter.rgbaToRGB(rgba));
    }


}