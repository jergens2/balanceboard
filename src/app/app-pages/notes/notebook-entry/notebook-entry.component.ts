import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NotebookEntry } from './notebook-entry.class';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { Modal } from '../../../modal/modal.class';
import { ModalService } from '../../../modal/modal.service';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { NoteQueryService } from '../note-query.service';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { NoteHttpService } from '../api/note-http.service';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';
import { UserAccountProfileService } from '../../user-account-profile/user-account-profile.service';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';

@Component({
  selector: 'app-notebook-entry',
  templateUrl: './notebook-entry.component.html',
  styleUrls: ['./notebook-entry.component.css']
})
export class NotebookEntryComponent implements OnInit, OnDestroy {

  faTrash = faTrash;
  faEdit = faEdit;

  @Input() notebookEntry: NotebookEntry;

  constructor(private modalService: ModalService, 
    private notebooksService: NoteQueryService, 
    private httpService: NoteHttpService,
    private sizeService: AppScreenSizeService,
    private profileService: UserAccountProfileService,
    private toolboxService: ToolboxService) { }

  mouseOver: boolean = false;
  private _modalSubscription: Subscription = new Subscription();
  private _noteText: string = "";
  private _isMinimized: boolean = false;
  private _isExpanded: boolean = false;
  private _wordCount: number = 0;

  private _subs: Subscription[] = [];
  

  private _maxWidth: string = '1024px';
  private _noteTextMaxWidth: string = '1004px';

  private get _initialCharacters(): number { return 250; }

  public get noteText(): string { return this._noteText; }
  public get isMinimized(): boolean { return this._isMinimized; }
  public get isExpanded():boolean { return this._isExpanded; }
  public get wordCount(): number { return this._wordCount; }
  public get maxWidth(): string { return this._maxWidth; }
  public get noteTextMaxWidth(): string { return this._noteTextMaxWidth; }

  ngOnInit() {
    if(this.notebookEntry){
      let text = this.notebookEntry.textContent;
      // if(text.length > this._initialCharacters ){
      //   text = text.substr(0, this._initialCharacters) + "...";
      //   this._isMinimized = true;
      // }
      this._noteText = text;
      this._wordCount = this.notebookEntry.textContent.split(' ').length;
    }
    this._updateMaxWidth();
    this._subs = [
      this.sizeService.width$.subscribe(()=> this._updateMaxWidth()),
      this.profileService.userProfile$.subscribe(()=> this._updateMaxWidth()),
    ];

  }

  private _updateMaxWidth(){
    const size = this.sizeService.appScreenSize;
    let componentWidth = size.width;
    if(size.isFullSize){
      // see full-size-container.component.css
      const pinnedSidebarWidth = 225;
      const miniSidebarWidth = 70;
      
      if(this.profileService.appPreferences.sidebarIsPinned){
        componentWidth = componentWidth - pinnedSidebarWidth; 
      }else{
        componentWidth = componentWidth - miniSidebarWidth; 
      }

      let maxWidth = componentWidth - 130;
      if(maxWidth > 1024){
        maxWidth = 1024;
      }
      let maxNoteWidth = maxWidth - 20;

      this._maxWidth = maxWidth + 'px';
      this._noteTextMaxWidth = maxNoteWidth + 'px';
      console.log("NOTE TEXT MAX WIDTH, vs other:", this._noteTextMaxWidth, this._maxWidth)
    }else if(size.isMediumSize){
      this._maxWidth = size.width + 'px';
      this._noteTextMaxWidth = size.width-20 + 'px';
    }else if(size.isSmallSize){
      this._maxWidth = size.width + 'px';
      this._noteTextMaxWidth = size.width-20 + 'px';
    }
    
  }

  public onClickNoteText(){
    if(this._isMinimized){
      this._isExpanded = true;
      this._noteText = this.notebookEntry.textContent;
    }
  }

  ngOnDestroy(){
    this._modalSubscription.unsubscribe();
    this._subs.forEach(s => s.unsubscribe());
  }

  onMouseEnter(){
    this.mouseOver = true;
  }
  onMouseLeave(){
    this.mouseOver = false;
  }


  onDeleteNote(){
    this.httpService.deleteNotebookEntryHTTP$(this.notebookEntry);
    this.notebooksService.deleteNote(this.notebookEntry);
  }

  onClickEdit(){
    console.log("Editing this.notebookEntry", this.notebookEntry)
    this.toolboxService.editNote(this.notebookEntry);


  }

}
