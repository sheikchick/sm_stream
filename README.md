# sm_stream_application
Automatic Super Smash Bros Melee stream application using slippi-js, with startgg integration
| ⚠️ This application was developed for Windows. It has not been tested on Linux / Unix |
|-|
# Running
This application assumes you have a distribution of [ffmpeg](https://www.ffmpeg.org/) available.
| :memo: We recommend `.../ffmpeg/bin` has an PATH environmental variable set up on Windows. See [HERE](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) if you need assistance |
|-|
1. Download and unzip the latest release from [HERE](https://github.com/sheikchick/sm_stream/releases) into a folder.
    1. If you already have an application running on `:5000`, edit the config.json file to change the port the webpage uses.
2. Run `sm_stream.exe`
3. Navigate to `127.0.0.1:5000` (or whatever port you are using instead)
   1. If you did not set up a PATH variable for ffmpeg, open the settings on ther webpage and set your ffmpeg path to `.../ffmpeg/bin`

# Building and running
| :memo: It is recommended to use [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node.JS versions |
|-|
- Install Node.js LTS 24.4.1 (or newer if suitable)
- Install [ffmpeg](https://www.ffmpeg.org/)

## Building from source (Windows)
1. Download the source code for the latest version
2. Install `pkg` by running
```npm install -g @yao-pkg/pkg```
3. Run `npm run package` or `pkg .` in the root directory to build the executable in `dist/`
    1. Ensure wherever the distribution is located it has access to `config.json` and `data/`. Your filetree should look like
       
       ```
        sm-stream
        ├── data
        │   ├── database-filters/
        │   ├── json/
        │   └── database.db
        ├── config.json
        └── sm-stream.exe
       ```
4. Run `sm-stream.exe`

## Running from source
1. Download the source code for the latest version
2. Do `npm install` in the root directory, then `npm run` to start the application


