import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../../authentication/auth-status.class';
import { Observable, Subject, BehaviorSubject, Subscription, forkJoin } from 'rxjs';


import { serverUrl } from '../../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, mergeAll, merge } from 'rxjs/operators';
import * as moment from 'moment';

import { ServiceAuthenticates } from '../../../../authentication/service-authentication/service-authenticates.interface';

import { RoutineDefinition } from './routine-definition.class';
import { RoutineDefinitionHttpShape } from './routine-definition-http-shape.interface';
import { DefaultRoutineDefinitions } from './default-routine-definitions.class';


@Injectable({
  providedIn: 'root'
})
export class RoutineDefinitionService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient) { }

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);



  login$(authStatus: AuthStatus): Observable<boolean> {
    // console.log("RoutineDefinitionService: Logging in - ")
    // console.log("I don't think we need this CRUD any more.  Perhpas Cannibalize this method for another CRUD.")
    // this._authStatus = authStatus;

    // this.httpGetRoutineDefinitions();
    this._loginComplete$.next(true);
    return this._loginComplete$.asObservable();
  }
  logout() {
    this._authStatus = null;
    this._routineDefinitions$.next(null);
  }
  public get userId(): string {
    return this._authStatus.user.id;
  }

  private _routineDefinitions$: BehaviorSubject<RoutineDefinition[]> = new BehaviorSubject([]);
  public get routineDefinitions(): RoutineDefinition[] {
    return this._routineDefinitions$.getValue();
  }
  public get routineDefinitions$(): Observable<RoutineDefinition[]> {
    return this._routineDefinitions$.asObservable();
  }
  


  public getRoutineDefinitionById(routineDefinitionId: string): RoutineDefinition{
    // return this._routineDefinitions$.getValue().find((task: RoutineDefinition)=>{
    //   return task.id == routineDefinitionId;
    // })
    return null;
  }


  private httpGetRoutineDefinitions() {

    let getUrl = serverUrl + "/api/routine-definition/" + this.userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<RoutineDefinition[]>(map((response: { message: string, data: any }) => {
        let routineDefinitionDefinitions: RoutineDefinition[] = [];
        for (let data of (response.data as any[])) {
          routineDefinitionDefinitions.push(this.buildRoutineDefinitionFromHttp(data));
        }
        return routineDefinitionDefinitions;
      }))
      .subscribe((routineDefinitions: RoutineDefinition[]) => {
        if (routineDefinitions.length == 0) {
          console.log("Warning: no RoutineDefinitions, using Defaults.  These defaults are not saved in the DB");
          this.saveDefaultRoutineDefinitions();
        } else {
          this._routineDefinitions$.next(routineDefinitions);
          this._loginComplete$.next(true);
        }
        
      });
  }

  public httpSaveRoutineDefinition(saveTask: RoutineDefinition) {
    let saveUrl = serverUrl + "/api/routine-definition/create";

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(saveUrl, saveTask.httpShape, httpOptions)
      .pipe<RoutineDefinition>(map((response: any) => {
        return this.buildRoutineDefinitionFromHttp(response.data);
      }))
      .subscribe((task: RoutineDefinition) => {
        let currentTasks = this.routineDefinitions;
        currentTasks.push(task);
        this._routineDefinitions$.next(currentTasks);
      });

  }

  private httpSaveRoutineDefinition$(saveRoutineDefinition: RoutineDefinition): Observable<RoutineDefinition>{
    let saveUrl = serverUrl + "/api/routine-definition/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    return this.httpClient.post<{ message: string, data: any }>(saveUrl, saveRoutineDefinition.httpShape, httpOptions)
      .pipe<RoutineDefinition>(map((response: any) => {
        return this.buildRoutineDefinitionFromHttp(response.data);
      }));
  }

  public httpUpdateRoutineDefinition(updateRoutineDefinition: RoutineDefinition) {
    let updateUrl = serverUrl + "/api/routine-definition/update";

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(updateUrl, updateRoutineDefinition.httpShape, httpOptions)
      .pipe<RoutineDefinition>(map((response: any) => {
        return this.buildRoutineDefinitionFromHttp(response.data);
      }))
      .subscribe((updatedRoutineDefinition: RoutineDefinition) => {
        let currentRoutineDefinitions = this.routineDefinitions;
        let index: number = 0;
        for(let currentRoutineDefinition of currentRoutineDefinitions){
          if(currentRoutineDefinition.id == updateRoutineDefinition.id){
            index = currentRoutineDefinitions.indexOf(currentRoutineDefinition);
          }
        }
        currentRoutineDefinitions.splice(index, 1, updatedRoutineDefinition);
        this._routineDefinitions$.next(currentRoutineDefinitions);
      });

  }

  public httpDeleteRoutineDefinition(routineDefinition: RoutineDefinition) {
    const postUrl = serverUrl + "/api/routine-definition/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, routineDefinition.httpShape, httpOptions)
      .subscribe((response) => {
        // console.log("Response from HTTP delete request:", response)
        let routineDefinitions = this._routineDefinitions$.getValue();
        routineDefinitions.splice(routineDefinitions.indexOf(routineDefinition), 1);
        this._routineDefinitions$.next(routineDefinitions);
      })
  }


  private saveDefaultRoutineDefinitions(){
    // let defaultRoutines = DefaultRoutineDefinitions.defaultRoutineDefinitions(this.userId, this.activitiesService.defaultMorningRoutineActivities, this.activitiesService.defaultEveningRoutineActivities);
    // console.log("Building and saving default routine definitions...");
    // forkJoin(defaultRoutines.map<Observable<RoutineDefinition>>((routineDef: RoutineDefinition) => { return this.httpSaveRoutineDefinition$(routineDef) })).subscribe((savedRoutineDefs: RoutineDefinition[]) => {
    //   let routineDefinitions: RoutineDefinition[] = this.routineDefinitions;
    //   routineDefinitions = routineDefinitions.concat(savedRoutineDefs);
    //   this._routineDefinitions$.next(routineDefinitions);
    //   console.log("Default routine definitions saved. ", routineDefinitions);
    //   this._loginComplete$.next(true);
    // })
    this._loginComplete$.next(true);
  }


  private buildRoutineDefinitionFromHttp(dataObject: any): RoutineDefinition {

    /**
     * A note about this method:
     * 
     * it won't always catch missing properties, for example
     * i renamed frequency to frequencies.
     * 
     * but 2 objects in the DB still had the proprty name "frequency" but mongodb automatically added an empty value when sending the db item, because it is sending a type of the Model 
     * So, it has the property frequencies with no value in it, and the method below does not catch it,
     * 
     */


    const properties: string[] = ["_id", "userId", "routineTreeId", "name",
      "frequencies", "timeOfDay", "timeOfDayRanges", "activityIds",
      "childOfRoutineId"];

    let dataErrors: boolean = false;
    properties.forEach(property => {
      if (!(property in dataObject)) {
        console.log("Error with activity data object: missing property: ", property);
        dataErrors = true;
      }
    });
    if (!dataErrors) {
      let routineDefinitionHttpShape: RoutineDefinitionHttpShape = {
        _id: dataObject._id,
        userId: dataObject.userId,
        routineTreeId: dataObject.routineTreeId,
        name: dataObject.name,
        frequencies: dataObject.frequencies,
        timeOfDay: dataObject.timeOfDay,
        timeOfDayRanges: dataObject.timeOfDayRanges,
        activityIds: dataObject.activityIds,
        childOfRoutineId: dataObject.childOfRoutineId,
      }
      return new RoutineDefinition(routineDefinitionHttpShape);
    } else {
      console.log("RoutineDefinition is not built because of missing property.");
      return null;
    }
  };

}
