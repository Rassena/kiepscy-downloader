import {spawn as spwn} from 'child_process';
import fs from 'fs';

const spawn = (cmd, args) => new Promise((resolve, reject) => {
  const cp = spwn(cmd, args);
  const error = [];
  const stdout = [];
  cp.stdout.on('data', (data) => {
    stdout.push(data.toString());
  });

  cp.on('error', (e) => {
    error.push(e.toString());
  });

  cp.on('close', () => {
    if (error.length) reject(error.join(''));
    else resolve(stdout.join(''));
  });
});

function readFile() {
  return fs.readFileSync('./links.txt').toString()
}

async function stateMachine(textContent) {
  // const lines = textContent.split('\n').slice(0, 10)
  const lines = textContent.split('\n')

  let seasonNumber = 0;
  let seasonEpisodeNumber = 0 ;
  let absoluteEpisodeNumber = 0;
  let episodeName;
  let episodeUrl;

  let absoluteNumberBuffer;

  for (let line of lines) {
    const cleanedLine = line.trim()
    const lcLine = cleanedLine.toLocaleLowerCase();
    if (lcLine.startsWith('sezon')) {
      seasonNumber = lcLine.split(' ')[1]
      absoluteNumberBuffer = absoluteEpisodeNumber;
      console.log(`Settings seasonNumber to ${seasonNumber}`);
    } else if (lcLine.match(/^\d+./)) {
      [absoluteEpisodeNumber, episodeName] = cleanedLine.split('. ')
      seasonEpisodeNumber = absoluteEpisodeNumber - absoluteNumberBuffer;
      console.log(absoluteEpisodeNumber, episodeName);

    } else if (lcLine.startsWith('http')) {
      episodeUrl = cleanedLine
      console.log(episodeUrl);

      const directoryName = `Świat.Według.Kiepskich.S${seasonNumber.padStart(2, '0')}`
      let sanitizedEpisodeName = episodeName.replace(/[^A-Za-z0-9À-ž]/g, '.')
      if (sanitizedEpisodeName.endsWith('.')) {
        sanitizedEpisodeName = sanitizedEpisodeName.substring(0, sanitizedEpisodeName.length-1)
      }
      const fileName = `Świat.Według.Kiepskich.S${seasonNumber.padStart(2, '0')}E${seasonEpisodeNumber.toString().padStart(3, '0')}.${sanitizedEpisodeName}`
      console.log(directoryName,fileName);

      await spawn("yt-dlp", [episodeUrl, '-o', `./downloads/${directoryName}/${fileName}.%(ext)s`])
    }
  }
}
stateMachine(readFile());
