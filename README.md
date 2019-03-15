[{]: <region> (header)
# Metesic : a self-deployed app to view videos on its own server
[}]: #
[{]: <region> (body)

This is a video streaming app build with meteor.

It was fun for me to create this app with this technology which was entirely new for me.

I have just used it for my personal need, but much work needs to be done. First functionalities are here :

  - Scan server's folders to import videos in the app
  - During import, associate videos to categories
  - Videos search on name and categories selection
  - Create playlists
  - Add videos to playlists
  - Play videos !

## Lets start!

### For Dev Mode :
To start in dev mode : meteor

### For Production:
 - To build : meteor build build/ --architecture os.linux.x86_64
 - Then extract the file metesic.tar.gz to the deploiement folder : tar -xvf metesic.tar.gz
 - Install dependencies : cd bundle/programs/server && sudo meteor npm install
 - Install mongodb service and check it is started and enabled
 = Copy the file metesic.service to /etc/systemd/system/metesic.service (for ubuntu/debian based distribution). Adapt ExecStart to where you extracted the app
 - Reload services : systemctl daemon-reload

The app should listen on port 3000 (see Environment variable in the script).

One option is to use an apache server (or nginx, no matter) as a proxy for https.



check it on : https://guide.meteor.com/deployment.html

Install mongodb : https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

### Some Screenshots
#### The main page :
![Alt text](screenshots/mainPage.png?raw=true "Settings for folders")

The player is filled by the playlist.
The research can be done by checking categories and/or entering a video name

#### The settings : folder scan
![Alt text](screenshots/folders.png?raw=true "Settings for folders")

The scan is done recursively. The checkbox is used to add videos available in the main page. If it is already checked, the file or folder is already in the library

#### The settings : categories
![Alt text](screenshots/categories.png?raw=true "Settings for folders")

Categories are affected to videos during a scan. They can be used on the main page for search purposes.
