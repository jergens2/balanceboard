
# User opens app
1. Authentication:
    AppComponent is the first thing to open.
        Not authenticated? --> Show AuthenticationComponent, user authenticates
        Authenticated? --> Show AppContainerComponent

2. Load async data:
    AppContainer loads the async data services:  all the pieces of data stored in the database that we need to obtain, in an async manner.
    Sleep Service, and others, will determine whether or not a user action prompt is needed.

3. Finish Synchronous Loading
    --build sleep manager.  Sleep Manager determines if user input is required (prompt)

4. Check UserActionPrompt
        Any prompts? --> user resolves prompts.
        No prompts? --> proceed to step 4.

5. Initiate the app 
    daybookDisplayService.initiate(),
    sleepService.initiate(),
    showAppContainer === true