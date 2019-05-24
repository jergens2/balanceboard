import { Directory } from "./directory.class";

export class DirectoryTree{

    public get directoryPaths(): string[]{
        return this._directories.map<string>((directory: Directory)=>{ return directory.fullPath });
    }

    private _directories: Directory[];

    constructor(){

    }

    public addDirectory(directory: Directory){
        if(this.directoryPaths.indexOf(directory.fullPath) == -1){
            this._directories.push(directory);
            this._directories.sort((d1, d2)=>{
                if(d1.fullPath > d2.fullPath){
                    return -1;
                }
                if(d1.fullPath < d2.fullPath){
                    return 1;
                }
                return 0;
            })
        }
    }

    

}