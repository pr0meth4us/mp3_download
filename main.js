const prompt=require("prompt-sync")({sigint:true});
const puppeteer = require('puppeteer');
require('fs');
require('ytdl-core');

async function getLink() {
    let searchTerm = prompt("Enter the title/link of the song/playlist you want to download: ");
    let videoUrl;
    if (searchTerm.includes('youtube.com/playlist?list=') || searchTerm.includes('youtu.be/playlist?list=') || searchTerm.includes('youtube.com/watch?v=') || searchTerm.includes('youtu.be/')) {
        console.log('here');
        videoUrl = searchTerm;
        return [videoUrl, ''];
    } else {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com');
        await page.waitForSelector('#search-input #search');
        await page.type('#search-input #search', searchTerm);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#search-icon-legacy'),
        ]);
        await page.waitForSelector('ytd-video-renderer');
        const videoTitle = await page.$eval('ytd-video-renderer h3 a#video-title', (elem) => {
            return elem.innerText;
        });
        await Promise.all([
            page.waitForNavigation(),
            page.click('ytd-video-renderer h3 a#video-title'),
        ]);
        let videoUrl = page.url();
        await browser.close();
        console.log({videoUrl, videoTitle});

        return [videoUrl, videoTitle];
    }
    // const browser = await puppeteer.launch({ headless: "2" });
    // const page = await browser.newPage();
    // await page.goto('https://www.youtube.com');
    // await page.waitForSelector('#search-input #search');
    // let searchTerm = prompt("Please enter the title of the song you want to download: ");
    // await page.type('#search-input #search', searchTerm);
    // await Promise.all([
    //     page.waitForNavigation(),
    //     page.click('#search-icon-legacy'),
    // ]);
    // await page.waitForSelector('ytd-video-renderer');
    // const videoTitle = await page.$eval('ytd-video-renderer h3 a#video-title', (elem) => {
    //     return elem.innerText;
    // });
    // await Promise.all([
    //     page.waitForNavigation(),
    //     page.click('ytd-video-renderer h3 a#video-title'),
    // ]);
    // const videoUrl = page.url();
    // await browser.close();
    // console.log({ videoUrl, videoTitle});
    //
    // return [videoUrl, videoTitle];

}

getLink().then(async ([videoUrl]) => {
    // const spawn = require("child_process").spawn;
    // const pythonProcess = spawn('python',["downloader.py", videoUrl]);
    const PythonShell = require('python-shell').PythonShell;

    const options = {
      mode: 'text',
      pythonPath: './env/bin/python',
      pythonOptions: ['-u'],
      args: [videoUrl]
    };

     const log = await PythonShell.run('downloader.py', options, function (err, results) {
        if (err)
            throw err;
        return results;

    });
     for (let a of log){
         if (a.includes('[download]')){
             console.log(a);

         }

     }});
