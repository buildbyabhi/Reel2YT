import ytDlp from 'yt-dlp-exec';

const run = async () => {
  try {
    const res = await ytDlp('https://www.youtube.com/watch?v=BaW_jenozKc', {
      dumpJson: true,
      noWarnings: true,
    });
    console.log(res.title);
  } catch (err) {
    console.error(err);
  }
};
run();
