
export class ActivityCategoryDefinition {
    public id: string;
    public treeId: string;
    public name: string;
    public description: string;

    public userId: string;

    public parentTreeId: string;
    public childTreeIds: string[];

    private _children: ActivityCategoryDefinition[];

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
        this._children = [];
        this._fullNamePath = "/"+this.name;
    }

    /*
        Children reflect objects added in to fill in the data for the tree design on the component page.
        the childActivityIds represents that "truth" of Id belongingness.  the children property are just data pulled in at run time

    */

    private _fullNamePath: string;
    public setFullPath(fullPath: string){
        this._fullNamePath = fullPath;
    }
    public get fullNamePath(): string{
        return this._fullNamePath;
    }
    public fullNamePathIndexOf(searchValue: string): number{
        /*
            This method returns the position in the path where the searchValue is found.
            for example, full path is:
            /first/second/third/
            /[0]/[1]/[2]
            and searchValue is: "second"
            then the return value would be 1
        */        
        let foundIndex: number = -1;
        this.fullNamePathSplit.forEach((pathName: string)=>{
            if(pathName.toLowerCase().indexOf(searchValue) == 0){
                foundIndex = this.fullNamePathSplit.indexOf(pathName);
            }
        });
        return foundIndex;
    }
    public get fullNamePathSplit(): string[]{
        return this.fullNamePath.split("/");
    }

    // public findDescendant(descendantName: string): ActivityCategoryDefinition{
    //     if(this.name.toLowerCase() == descendantName.toLowerCase()){
    //         return this;
    //     }else{
    //         if(this.children.length > 0){
    //             this.children.forEach((child)=>{
    //                 return child.findDescendant(descendantName);
    //             })
    //         }else{
    //             return null;
    //         }
    //     }
    // }
    


    get children(): ActivityCategoryDefinition[] {
        return this._children;
    }
    // set children(children: CategorizedActivity[]) {
    //     this._children = children;
    // }

    addChild(childCategory: ActivityCategoryDefinition) {
        this._children.push(childCategory);
    }
    removeChildren(){
        this._children = [];
    }
    removeChild(childCategory: ActivityCategoryDefinition) {
        if(this._children.length > 0){
            if(this._children.indexOf(childCategory) > -1){
                this._children.splice(this._children.indexOf(childCategory),1);
                return;
            }else{
                for(let child of this._children){
                    if(child.children.length > 0){
                        child.removeChild(childCategory);
                    }
                }
            }
        }else{
            return;
        }
        return;
    }

}