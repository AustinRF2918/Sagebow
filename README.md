# Sagebow
Final project for CIS375 (Software Engineering I) at University of Michigan - Dearborn.

How to deploy this application:
- Install redis server if it isn't present already http://redis.io/
- Install nodejs (I recommend NVM https://github.com/creationix/nvm)
- After cloning this repo, cd into the directory and run npm install
- If you'd like to just start the server and get the application running, execute node startServer.js
- If you're doing development work you'll want to use gulp (install it with npm -i gulp)

Gulp commands:
pug - compiles HTML
sass - compiles CSS
watch - executes both pug and sass, and then watches for changes and reruns automagically
