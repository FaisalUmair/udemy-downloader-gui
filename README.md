# Udemy Downloader GUI
A cross platform (Windows, Mac, Linux) desktop application for downloading Udemy Courses (Built with Electron).

![](https://i.imgur.com/b1uxI5d.gif)

# Prerequisites:
```
You must have npm and nodejs installed.
```

# To use the application:
``` 
1. Clone the project
2. Run npm install 
3. Run npm start
```

# Build:
Detect Platform:
``` 
npm run dist
``` 
Windows:
``` 
npm run build-win
``` 
Mac:
``` 
npm run build-mac
``` 
Linux:
``` 
npm run build-linux
``` 
Cross Platform:
``` 
npm run build
``` 
**To force 32 bit build**:

Append "-- --ia32" to npm run command

Example:
``` 
npm run build-win -- --ia32
``` 

# Note: 
The courses will be downloaded to the user's Download folder.
