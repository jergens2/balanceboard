
export class CategorizedActivity {
    public id: string;
    public treeId: string;
    public name: string;
    public description: string;

    public userId: string;

    public parentTreeId: string;
    public childTreeIds: string[];

    private _parent: CategorizedActivity;
    private _children: CategorizedActivity[];

    public color: string;
    public icon: string;

    constructor(id: string, userId: string, treeId:string, name: string, description: string, parentActivityId: string, color: string) {
        this.id = id;
        this.userId = userId;
        this.treeId = treeId;
        this.name = name;
        this.description = description;
        this.parentTreeId = parentActivityId;
        this.color = color;

        this._parent = null;
        this._children = [];
    }

    get parent(): CategorizedActivity {
        return this._parent;
    }
    set parent(parent: CategorizedActivity) {
        this._parent = parent;
    }

    /*
        Children reflect objects added in to fill in the data for the tree design on the component page.
        the childActivityIds represents that "truth" of Id belongingness.  the children property are just data pulled in at run time

    */

    get children(): CategorizedActivity[] {
        return this._children;
    }
    // set children(children: CategorizedActivity[]) {
    //     this._children = children;
    // }

    addChild(childCategory: CategorizedActivity) {
        this._children.push(childCategory);
    }
    removeChildren(){
        this._children = [];
    }
    removeChild(childCategory: CategorizedActivity) {
        // let index = -1;
        // if (this._children.indexOf(childCategory) >= 0) {
        //     index = this._children.indexOf(childCategory);
        // }
        // if(index >= 0){
        //     this._children.splice(index,1);
        //     this.childActivityIds.splice(this.childActivityIds.indexOf(childCategory.id));
        // }
    }

}