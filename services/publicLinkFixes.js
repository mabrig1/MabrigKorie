// Correct known legacy public links without mutating MongoDB or overriding unrelated admin edits.
// This also fixes previously seeded records that remain in the live database after a code deployment.
const AI_UNIVERSITY_URL = 'https://aiuniversity.mabrigkorie.org/';
const DESTINY_SKILLS_URL = 'https://ddei.online/';
const APPLE_MUSIC_ARTIST_URL = 'https://music.apple.com/us/artist/mabrig-korie/1739098452';
const IGBO_TRUTH_URL = 'https://music.apple.com/us/album/igbo-truth-glory-hallelujah-single/1866634330';

function repairPublicWorkLink(work) {
  if (!work || typeof work.url !== 'string') return work;

  const previousUrl = work.url.trim().replace(/\/+$/, '').toLowerCase();
  let correctedUrl;

  if (previousUrl === 'https://aiuniversityhq.uk' || previousUrl === 'https://www.aiuniversityhq.uk') {
    correctedUrl = AI_UNIVERSITY_URL;
  } else if (
    work.title === 'Destiny Skills Bridge' &&
    previousUrl === 'https://www.mabrigresearch.online'
  ) {
    correctedUrl = DESTINY_SKILLS_URL;
  } else if (previousUrl === 'https://music.apple.com/album/justice-before-unity') {
    // Stable, verified artist landing page rather than an incomplete album slug with no catalogue ID.
    correctedUrl = APPLE_MUSIC_ARTIST_URL;
  } else if (previousUrl === 'https://music.apple.com/album/igbo-truth-glory-hallelujah') {
    correctedUrl = IGBO_TRUTH_URL;
  }

  if (!correctedUrl) return work;
  const plain = typeof work.toObject === 'function' ? work.toObject() : { ...work };
  return { ...plain, url: correctedUrl };
}

module.exports = { repairPublicWorkLink, AI_UNIVERSITY_URL };
