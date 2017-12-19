# Udeler | Udemy Course Downloader (GUI)
A cross platform (Windows, Mac, Linux) desktop application for downloading Udemy Courses.

![](https://i.imgur.com/nnvTY5e.gif)

### Disclaimer: 
This software is intended to help you download Udemy courses for personal use only. Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use. Each and every course on Udemy is subjected to copyright infringement. 
This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in. Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. Many download managers use same method to download videos on a web page. This app only automates the process of a user doing this manually in a web browser. 

### Downloads:

| Platform | Arch | Version | Link|
| --- | --- | --- | --- |
| Windows | x64 | 1.2.0 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.2.0/Udeler-Setup-1.2.0-windows-x64.exe)|
| Windows | x86 | 1.2.0 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.2.0/Udeler-Setup-1.2.0-windows-x86.exe)|
| Mac | x64 | 1.2.0 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.2.0/Udeler-1.2.0-mac.zip)|
| Linux | x86_x64 | 1.2.0 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.2.0/Udeler-1.2.0-linux-x86_x64.AppImage)|

### Note: 
By default the courses will be downloaded to the user's Download folder. The structure of course content will be preserved.

# For Developers

### Contributing:
Any contributions are welcome, if you plan to contribute please read the [contributing](https://github.com/FaisalUmair/udemy-downloader-gui/blob/master/CONTRIBUTING.md) docs first.

### Prerequisites:
```
You must have npm and nodejs installed.
```
### To use the application:
``` 
1. Clone the project
2. Run npm install 
3. Run npm start
```
### Build:
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
#### To force 32 bit build:
*Append "-- --ia32" to npm run command*

Example:
``` 
npm run build-win -- --ia32
```