[{]: <region> (header)
# Metesic : a self-deployed app to view videos on its own server
[}]: #
[{]: <region> (body)

This is a video streaming app build with meteor.

It was fun for me to create this app with this technology which was entirely new for me.

I have just used it for my personal need, but much work needs to be done. First fonctionalities are here :
  
  - Scan server's folders to import videos in the app
  - During import, associate videos to categories
  - Videos search on name and categories selection
  - Create playlists
  - Add videos to playlists
  - Play videos !

Lets start!

To start in dev mode : meteor --release 1.4.4.6

To build : meteor --release 1.4.4.6 build /path/to/build --architecture os.linux.x86_64

to start in production mode :
cd pathToBundle && MONGO_URL=mongodb://localhost:27017/metesic ROOT_URL=http://localhost  PORT=3000 node main.js
check it on : https://guide.meteor.com/deployment.html
Install mongodb : https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [Begin Tutorial >](manuals/views/step1.md) |
|----------------------:|
[}]: #
[}]: #
