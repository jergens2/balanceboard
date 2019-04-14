import { IModalOption } from "./modal-option.interface";
import { ModalComponentType } from "./modal-component-type.enum";

export class Modal {
    message: string;

    modalOptions: IModalOption[];
    modalStyle: any = {};
    modalData: any = {};

    modalComponentType: ModalComponentType = ModalComponentType.Default                                                                                                                          ;

    constructor(message: string, modalData: any, modalOptions: IModalOption[], modalStyle: any, modalComponentType: ModalComponentType){
        this.message = message;
        this.modalOptions = modalOptions;
        this.modalStyle = modalStyle;
        this.modalComponentType = modalComponentType;
        this.modalData = modalData;
    }

}