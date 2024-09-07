# sm_stream_application
Automatic Super Smash Bros Melee stream application using slippi-js, with startgg integration

# Running
This application assumes you have a distribution of ffmpeg installed. Please install from [HERE](https://www.ffmpeg.org/) and ensure `ffmpeg/bin` has an PATH environmental variable set up (see [HERE](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) if you need assistance)
1. Download and unzip the latest release from [HERE](https://github.com/sheikchick/sm_stream/releases) into a folder.
    1. If you already have an application running on `:5000`, edit the config.json file to change the port the webpage uses.
2. Run `sm_stream.exe`
3. Navigate to `127.0.0.1:5000` (or whatever port you are using instead)

Edit the config by pressing the cog in the top right.

# Building and running from source

Install Node.js (ver 20 or above), ffmpeg, and set up PATH environment variables for each as detailed above

## Running from source
1. Download the source code for the latest version
2. Install `pkg` by doing
```npm install -g @yao-pkg/pkg```
3. Do `pkg .` in the root directory to build the executable in `dist/`
    1. Ensure wherever the distribution is located it has access to `config.json` and `data/`

## Running from source
1. Download the source code for the latest version
2. Do `npm install` in the root directory, then `npm run` to start the application
