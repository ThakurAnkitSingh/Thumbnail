const axios = require("axios");
const fs = require("fs");
const path = require("path");
const
    ffmpegPath = require("@ffmpeg-installer/ffmpeg").path,
    ffprobePath = require("@ffprobe-installer/ffprobe").path,
    ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

const url = "https://st3.depositphotos.com/5538628/35804/v/600/depositphotos_358048098-stock-video-smart-dog-in-glasses-looking.mp4";

function createDirectoryIfNotExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

async function generateThumbnail(videoPath) {
    videoPath = `https://st3.depositphotos.com/5538628/35804/v/600/depositphotos_358048098-stock-video-smart-dog-in-glasses-looking.mp4`
    let path = 'screenShot/screen/ss/pp';
    createDirectoryIfNotExists(path);
     ffmpeg(videoPath)
        .thumbnail({
            timestamps: ['50%'],
            filename: `${path}/${Date.now()}`,
            size: '320x240',
        });

        path = `${path}`

    const res =  deleteLocalFile(path);
    return res;
}

const deleteLocalFile = async(localFilePath) =>  {
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error('Error deleting local file:', err);
      } else {
        console.log('Local file deleted successfully');
      }
    });
  }

// const thumbnailFn = async (videoPath) => {
//     let destinationPath = `thumbFrame`;
//     createDirectoryIfNotExists(destinationPath)
//     const tg = new ThumbnailGenerator({
//         sourcePath: videoPath,
//         // thumbnailPath: `/${destinationPath}`,
//         // tmpDir: `/${destinationPath}`, //only required if you can't write to /tmp/ and you need to generate gifs
//     });

//     const thumbPath = await tg.generateGif();
//     console.log(thumbPath);
// }


const downloadVideo = async (url) => {
    try {
        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream",
        });

        const tempFolderPath = path.join(__dirname, "temp");
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath);
        }

        const videoFileName = path.basename(url);
        const videoFilePath = path.join(tempFolderPath, videoFileName);

        response.data.pipe(fs.createWriteStream(videoFilePath));

        return new Promise((resolve, reject) => {
            response.data.on("end", () => {
                console.log({ videoFilePath });
                resolve(videoFilePath);
            });
            response.data.on("error", (err) => {
                console.error("Error occurred", err);
                reject(err);
            });
        });
    } catch (error) {
        throw new Error(`Error downloading video: ${error.message}`);
    }
};

(async () => {
    try {
        const videoPath = await downloadVideo(url);
        const res = await generateThumbnail(videoPath);
    } catch (error) {
        console.error(error);
    }
})();