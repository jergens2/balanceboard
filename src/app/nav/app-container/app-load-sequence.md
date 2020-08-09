
# User opens app
1. Authentication:
    AppComponent is the first thing to open.
        Not authenticated? --> Show AuthenticationComponent, user authenticates
        Authenticated? --> Show AppContainerComponent

2. Load async data:
    AppContainer loads the async data services:  all the pieces of data stored in the database that we need to obtain, in an async manner.

3. Build necessary pieces:
    Build SleepManager
    Build DaybookManager

4. If needed, prompt the user for input with UserActionPrompt

5. Everything is complete.  Open the app (showAppContainer = true)