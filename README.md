# Udeler | Udemy Course Downloader (GUI)
A cross platform (Windows, Mac, Linux) desktop application for downloading Udemy Courses.

### Udeler 2.0 Feature Requests:
I am planning to make Udeler 2.0 a big release with a lot of new features and improvements. For requesting a feature, Click [here](https://github.com/FaisalUmair/udemy-downloader-gui/issues/172)

### Udeler Web Anouncement:
In case you only want the download links of videos. You can use the Web version of Udeler.

[https://www.udeler.com](https://www.udeler.com)

Udeler Web is in Beta and there is room for ton of features. As of now it is just a basic tool which can provide you download links of videos from your courses. You can use the links to download using your favourite download manager.

#### Project Update: 
__`I am currently not able to give this project enough time to fix the current issues or add new features. I am busy with some other projects. But I do plan to fix all the issues and add some new features. So the maintenance is temporarily on hold and this project is not dead. I also plan to make a web only version of Udeler.`__

![](https://i.imgur.com/nsaAgDU.gif)

### :fire: Features
* _`Choose video quality.`_
* _`Download multiple courses at once.`_
* _`Set Download Start and Download End.`_
* _`Pause/Resume download at any time.`_
* _`Choose download directory.`_
* _`Multilingual (English,Italian,Spanish).`_

### Disclaimer: 
This software is intended to help you download Udemy courses for personal use only. Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use. Each and every course on Udemy is subjected to copyright infringement. 
This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in. Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. Many download managers use same method to download videos on a web page. This app only automates the process of a user doing this manually in a web browser. 

### Downloads:

| Platform | Arch | Version | Link|
| --- | --- | --- | --- |
| Windows | x64 | 1.6.2 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.6.2/Udeler-Setup-1.6.2-windows-x64.exe)|
| Windows | x86 | 1.6.2 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.6.2/Udeler-Setup-1.6.2-windows-x86.exe)|
| Mac | x64 | 1.6.2 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.6.2/Udeler-1.6.2-mac.zip)|
| Linux | x86_x64 | 1.6.2 | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.6.2/Udeler-1.6.2-linux-x86_x64.AppImage)|

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

## Donate
Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.

[![Donate](https://raw.githubusercontent.com/FaisalUmair/udemy-downloader-gui/master/assets/images/donate.png)](https://www.paypal.me/UdelerDonate)
