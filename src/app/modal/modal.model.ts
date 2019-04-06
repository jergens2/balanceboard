import { IModalOption } from "./modal-option.interface";

export class Modal {
    message: string;

    modalOptions: IModalOption[];
    modalStyle: any = {};

    constructor(message: string, modalOptions: IModalOption[], modalStyle: any){
        this.message = message;
        this.modalOptions = modalOptions;
        this.modalStyle = modalStyle;
    }

}