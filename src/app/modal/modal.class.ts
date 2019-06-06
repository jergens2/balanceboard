import { IModalOption } from "./modal-option.interface";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ModalComponentType } from "./modal-component-type.enum";

export class Modal {


    header: string;
    headerIcon: IconDefinition;

    message: string;

    modalOptions: IModalOption[];
    modalStyle: any = {};
    modalData: any = {};

    action: string = "";


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

