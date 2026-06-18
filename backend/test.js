const url = 'http://localhost:4000/api/identify-reel';
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reelUrl: 'https://www.instagram.com/reel/DZP3golzMBQ/?igsh=aDNzeXRzczA5cmpj' })
})
.then(res => res.json().then(data => console.log('STATUS:', res.status, 'BODY:', data)))
.catch(err => console.error('ERROR:', err));
