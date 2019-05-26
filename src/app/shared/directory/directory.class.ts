
export class Directory {

    constructor(fullPath: string) {



        if (this.isValid(fullPath)) {
            this._fullPath = fullPath;
            this._paths = this.parseInput(fullPath);
            // console.log("Paths looks like this, from "+fullPath +" to : ", this._paths);
        } else {
            console.log("Error with validation: ", fullPath);
        }

    }
    private isValid(fullPath: string): boolean {

        // /matches/patterns/like-this/
        let regex: RegExp = /((\/[a-z\-]+)+\/)/g;
        let minLength: number = 1;
        if (fullPath) {
            if (fullPath.length >= minLength) {
                if (regex.test(fullPath)) {
                    // console.log("Gucci gang: ", fullPath)
                    return true;
                } else {
                    // console.log("Error: fullPath does not match regex: ", fullPath)
                }
            } else {
                // console.log("Error:  fullPath.length needs to be at least 1 chars");
            }
        } else {
            // console.log("Error: full path is NULL");
        }

        return false;
    }
    private parseInput(fullPath: string): string[] {
        let split: string[] = fullPath.split('/');
        return split.filter((match) => {
            return match.substr(1);
        })
    }

    private _fullPath: string
    public get fullPath(): string {
        return this._fullPath;
    }
    private _paths: string[] = [];
    public get directories(): string[] {
        return this._paths;
    }
    public get depth(): number {
        return this._paths.length;
    }
    public get rootDirectory(): string {
        if (this._paths.length >= 1) {
            return this._paths[0];
        }
    }
    public get specificDirectory(): string {
        if (this._paths.length >= 1) {
            return this._paths[this._paths.length - 1];
        }
    }
    public isChildDirectoryOf(parentDirectory: Directory): boolean {
        return parentDirectory.fullPath.indexOf(this.fullPath) > -1;
    }
    public isParentDirectoryOf(childDirectory: Directory): boolean {
        return this.fullPath.indexOf(childDirectory.fullPath) > -1;
    }
    public indexOf(path: string) {
        return this._paths.indexOf(path);
    }
    public atIndex(index: number): string {
        return this._paths[index];
    }
    public subPath(toIndex: number): string {

        let subPath: string = "/";
        for(let i=0;i<=toIndex;i++){
            subPath += this._paths[i] + "/";
        }
        return subPath;



    }





}