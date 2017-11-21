# Udeler | Udemy Course Downloader (Udemy Downloader GUI)
A cross platform (Windows, Mac, Linux) desktop application for downloading Udemy Courses.

![](https://i.imgur.com/b1uxI5d.gif)

# Disclaimer: 
This software is intended to help you download Udemy courses for personal use only. Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use. Each and every course on Udemy is subjected to copyright infringement. 
This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in. Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. Many download managers provide uses same method to let user download the video. This app only automates the process that you can go and do manually in the web browser.    

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
#
**To force 32 bit build:**

*Append "-- --ia32" to npm run command*

Example:
``` 
npm run build-win -- --ia32
``` 

# Note: 
The courses will be downloaded to the user's Download folder.
