export class RelativeMousePosition{

    constructor(){

    }


    public onMouseMove(event: MouseEvent, elementId: string){
        let containingElement: HTMLElement = this.findContainingElement(event, elementId);
        if(containingElement){
            this.updatePosition(event, containingElement);
        }
    }

    private findContainingElement(event: MouseEvent, elementId: string): HTMLElement{
        let currentElement: HTMLElement = (event.srcElement as HTMLElement);
        if(currentElement.id === elementId){
            return currentElement;
        }else{
            let elementFound: boolean = false;
            let hasParent: boolean = true;
            while(!elementFound && hasParent){
                if(currentElement.parentElement != null){
                    currentElement = currentElement.parentElement
                    if(currentElement.id === elementId){
                        elementFound = true;
                    }
                }else{
                    hasParent = false;
                }
            }
            if(elementFound){
                return currentElement;
            }else{
                return null;
            }
        }
    }

    private updatePosition(event: MouseEvent, containingElement: HTMLElement){
        this._elementOffsetLeft = containingElement.offsetLeft;
        this._elementOffsetTop = containingElement.offsetTop;
        this._elementHeight = containingElement.offsetHeight;
        this._elementWidth = containingElement.offsetWidth;
    
        let mouseX: number = event.pageX;
        let mouseY: number = event.pageY;
    
        let relativeX: number = mouseX - this._elementOffsetLeft;
        let relativeY: number = mouseY - this._elementOffsetTop;

        this._relativePosition = {x: relativeX, y: relativeY }; 

        this._percentX = (relativeX / this._elementWidth) * 100;
        this._percentY = (relativeY / this._elementHeight) * 100;
    }

    private _elementOffsetLeft: number = -1; 
    private _elementOffsetTop: number = -1;
    private _elementHeight: number = -1;
    private _elementWidth: number = -1;

    public get elementOffsetLeft(): number{ return this._elementOffsetLeft; }
    public get elementOffsetTop(): number{ return this._elementOffsetTop; }
    public get elementHeight(): number { return this._elementHeight; }
    public get elementWidth(): number { return this._elementWidth; }
    
    private _percentX: number = 0;
    private _percentY: number = 0;

    private _relativePosition: {x: number, y: number} = {x: 0, y: 0};
    public get relativePosition(): {x: number, y: number}{ return this._relativePosition; }
    public get relativeX(): number{ return this._relativePosition.x; }
    public get relativeY(): number{ return this._relativePosition.y; }
    public get percentX(): number{ return this._percentX; }
    public get percentY(): number{ return this._percentY; }


}