import { Component, OnInit } from '@angular/core';
import { UserActionPromptService } from './user-action-prompt.service';
import { UserPromptType } from './user-prompt-type.enum';

@Component({
  selector: 'app-user-action-prompt',
  templateUrl: './user-action-prompt.component.html',
  styleUrls: ['./user-action-prompt.component.css']
})
export class UserActionPromptComponent implements OnInit {

  constructor(private promptService: UserActionPromptService) { }


  private _prompts: UserPromptType[] = [];
  public get prompts(): UserPromptType[] { return this._prompts; }

  ngOnInit() {
    let prompts: UserPromptType[] = [];
    if(this.promptService.hasPrompts()){
      prompts = this.promptService.prompts;
      this._prompts = prompts;
    }else{
      this.promptService.clearPrompts();
    }
    



  }



  public onClickPrompt(prompt: UserPromptType){
    const foundIndex = this._prompts.findIndex((currentPrompts)=>{
      return prompt === currentPrompts;
    });
    if(foundIndex > -1){
      this._prompts.splice(foundIndex, 1);
      if(this._prompts.length === 0){
        this.promptService.clearPrompts();
      }
    }
  }

}
