import { IModalOption } from "./modal-option.interface";
import { ModalComponentType } from "./modal-component-type.enum";

export class Modal {


    header: string;

    message: string;

    modalOptions: IModalOption[];
    modalStyle: any = {};
    modalData: any = {};

    modalComponentType: ModalComponentType = ModalComponentType.Default                                                                                                                          ;

    constructor(header: string, message: string, modalData: any, modalOptions: IModalOption[], modalStyle: any, modalComponentType: ModalComponentType){
        this.header = header;
        this.message = message;
        this.modalOptions = modalOptions;
        this.modalStyle = modalStyle;
        this.modalComponentType = modalComponentType;
        this.modalData = modalData;
    }

}