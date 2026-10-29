(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const audio = $('#audioPlayer');
  const tracks = [
    {src:'assets/audio/birthday-anthem.mp3', kind:'birthday'},
    {src:'assets/audio/voice-note-1.mp3', kind:'voice'},
    {src:'assets/audio/voice-note-2.mp3', kind:'voice'}
  ];
  let activeTrack = 0;
  let playing = false;
  let isMuted = false;

  // The hero Polaroid is a real photo carousel: one new complete photo every 2 seconds.
  const heroSlideshow = $('#heroSlideshow');
  const heroPhotoCount = $('#heroPhotoCount');
  const heroSlides = [
    'assets/photos/menna-cover.jpeg',
    'assets/photos/photo-02.jpeg',
    'assets/photos/photo-03.jpeg',
    'assets/photos/photo-04.jpeg',
    'assets/photos/photo-05.jpeg',
    'assets/photos/photo-06.jpeg',
    'assets/photos/photo-07.jpeg',
    'assets/photos/photo-08.jpeg',
    'assets/photos/photo-09.jpeg'
  ];
  const heroAlts = [
    'Menna in a burgundy coat and taupe hijab',
    'Menna holding a bouquet of white roses',
    'Menna in her lavender outfit',
    'Menna reading a book',
    'Menna in a yellow sweater and brown hijab',
    'Menna in a lilac sweater and grey hijab',
    'Menna holding a red rose',
    'Menna in a red birthday dress',
    'Menna under a canopy of pink flowers'
  ];
  let heroSlideIndex = 0;
  if (heroSlideshow) {
    heroSlides.slice(1).forEach(src => { const warm = new Image(); warm.src = src; });
    window.setInterval(() => {
      heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
      const next = new Image();
      next.onload = () => {
        heroSlideshow.classList.add('is-changing');
        window.setTimeout(() => {
          heroSlideshow.src = heroSlides[heroSlideIndex];
          heroSlideshow.alt = heroAlts[heroSlideIndex];
          heroSlideshow.classList.remove('is-changing');
          const caption = $('#heroSlideCaption');
          if (caption) caption.textContent = ['the birthday girl ♡','a bouquet for you ♡','lavender day ✧','a little bookworm ♡','sunshine smile ☀','lilac memories ♡','a rose for our rose ✿','birthday queen ♡','under pink flowers ✿'][heroSlideIndex];
          if (heroPhotoCount) heroPhotoCount.textContent = `${String(heroSlideIndex + 1).padStart(2,'0')} · ${String(heroSlides.length).padStart(2,'0')}`;
        }, 170);
      };
      next.src = heroSlides[heroSlideIndex];
    }, 2000);
  }

  // The tiny photo prints in the galaxy refresh in sequence, not all at once.
  const orbitPhotos = $$('.orbit-photo');
  const orbitCaptions = [
    'a little memory ♡','lavender moments ✧','your sunshine day ☀',
    'a rose for you ✿','pretty in pink ♡','your birthday glow ✨',
    'a bouquet full of love ♡','our favourite memories','always loved 💗'
  ];
  let orbitPhotoCursor = 0;
  if (orbitPhotos.length) {
    window.setInterval(() => {
      const button = orbitPhotos[orbitPhotoCursor % orbitPhotos.length];
      const image = $('img', button);
      const nextIndex = (orbitPhotoCursor + 1) % heroSlides.length;
      const nextSrc = heroSlides[nextIndex];
      const preload = new Image();
      preload.onload = () => {
        image.classList.add('orbit-photo-changing');
        window.setTimeout(() => {
          image.src = nextSrc;
          image.alt = heroAlts[nextIndex];
          button.dataset.photo = nextSrc;
          button.dataset.caption = orbitCaptions[nextIndex];
          image.classList.remove('orbit-photo-changing');
        }, 170);
      };
      preload.src = nextSrc;
      orbitPhotoCursor = (orbitPhotoCursor + 1) % heroSlides.length;
    }, 2000);
  }

  function formatTime(sec){ if(!Number.isFinite(sec)) return '0:00'; const m=Math.floor(sec/60), s=Math.floor(sec%60); return `${m}:${String(s).padStart(2,'0')}`; }
  function updateMusicUI(){
    $('#playPause').textContent = playing ? 'Ⅱ' : '▶';
    $('#playPause').setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    $('#headerMusicText').textContent = playing ? 'Pause music' : 'Play music';
    $('#headerMusic').classList.toggle('playing', playing);
    $('#vinylRecord').classList.toggle('spinning', playing);
    $('#muteButton').textContent = isMuted ? '×' : '♫';
    $('#muteButton').setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
    const trackNumber = $('#trackNumber');
    if(trackNumber) trackNumber.textContent = `${String(activeTrack+1).padStart(2,'0')} / ${String(tracks.length).padStart(2,'0')}`;
  }
  async function playAudio(){
    try {
      audio.muted = isMuted;
      await audio.play();
      playing = true;
      $('#musicHint').textContent = activeTrack === 0 ? 'Your birthday soundtrack is playing ♡' : 'A little voice message is playing ♡';
    } catch(e) {
      playing = false;
      $('#musicHint').textContent = 'Tap the play button to start the sound ♡';
    }
    updateMusicUI();
  }
  function pauseAudio(){ audio.pause(); playing=false; updateMusicUI(); }
  function loadTrack(index, autoPlay=false){
    const shouldPlay = autoPlay;
    audio.pause();
    activeTrack = (index + tracks.length) % tracks.length;
    audio.src = tracks[activeTrack].src;
    audio.load();
    $('#currentTime').textContent='0:00';
    $('#seekBar').value=0;
    $('#duration').textContent='--:--';
    $('#musicHint').textContent = activeTrack === 0 ? 'Birthday music selected ♡' : 'Voice message selected ♡';
    playing=false;
    updateMusicUI();
    if(shouldPlay) playAudio();
  }
  function stepTrack(step){ const resume = !audio.paused && !audio.ended; loadTrack(activeTrack + step, resume); }

  $('#openWorld').addEventListener('click', () => {
    const screen = $('#introScreen');
    if(screen.classList.contains('gift-opened')) return;
    screen.classList.add('gift-opened');
    $('#openWorld').disabled = true;
    $('#openWorld').innerHTML = '<b>Surprise! ♡</b><span lang="ar" dir="rtl">كل سنة وإنتِ طيبة يا منة</span>';
    launchConfetti(34,true);
    // Playback begins from this user gesture; most browsers block sound before the first tap.
    loadTrack(activeTrack, true);
    window.setTimeout(() => {
      screen.classList.add('is-gone');
      document.body.classList.remove('intro-active');
      window.setTimeout(()=>screen.setAttribute('aria-hidden','true'),850);
    }, 1450);
  });
  $('#headerMusic').addEventListener('click', ()=> playing ? pauseAudio() : playAudio());
  $('#playPause').addEventListener('click', ()=> playing ? pauseAudio() : playAudio());
  $('#previousTrack').addEventListener('click', ()=>stepTrack(-1));
  $('#nextTrack').addEventListener('click', ()=>stepTrack(1));
  $('#muteButton').addEventListener('click', ()=>{ isMuted=!isMuted; audio.muted=isMuted; updateMusicUI(); });
  audio.addEventListener('play', ()=>{ playing=true; updateMusicUI(); });
  audio.addEventListener('pause', ()=>{ playing=false; updateMusicUI(); });
  audio.addEventListener('timeupdate', ()=>{ if(audio.duration){$('#seekBar').value=(audio.currentTime/audio.duration)*100; $('#currentTime').textContent=formatTime(audio.currentTime); $('#duration').textContent=formatTime(audio.duration);} });
  audio.addEventListener('loadedmetadata', ()=>{ if(Number.isFinite(audio.duration)) $('#duration').textContent=formatTime(audio.duration); });
  audio.addEventListener('ended', ()=>{playing=false;updateMusicUI();});
  $('#seekBar').addEventListener('input', e=>{ if(audio.duration) audio.currentTime=(Number(e.target.value)/100)*audio.duration; });

  function openModal(id){ const m=document.getElementById(id); if(!m)return; m.classList.add('open'); document.body.classList.add('modal-open'); const close=$('[data-close]',m); if(close) close.focus(); }
  function closeModal(el){ el.classList.remove('open'); if(!$('.modal.open')) document.body.classList.remove('modal-open'); }
  $$('[data-modal]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.modal)));
  $$('.modal').forEach(m=>{ $$('[data-close]',m).forEach(el=>el.addEventListener('click',()=>closeModal(m))); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ $$('.modal.open').forEach(closeModal); closeLightbox(); } });

  function setCandlesBlown(){
    $$('.cake-scene .candle i').forEach(f=>f.style.display='none');
    $('#wishMessage').textContent='Wish sent to the universe! ✨ أمنيتك وصلت للنجوم يا منة 💗';
    $('#blowCandles').innerHTML='Wish sent! ✨ <span>أمنيتك وصلت</span>';
    $('#modalWishText').textContent='أمنيتك راحت للنجوم.. وربنا يحققلك كل اللي بتتمنيه يا منة 💗';
    $$('.modal-flames span').forEach(f=>f.style.display='none');
    $('#modalBlow').innerHTML='Wish sent! ♡ <span>كل سنة وإنتِ طيبة</span>';
    launchConfetti(90);
  }
  $('#blowCandles').addEventListener('click', setCandlesBlown);
  $('#modalBlow').addEventListener('click', setCandlesBlown);

  const photoButtons = $$('[data-photo]'); let photoIndex=0;
  function showPhoto(index){ if(!photoButtons.length)return; photoIndex=(index+photoButtons.length)%photoButtons.length; const b=photoButtons[photoIndex]; $('#lightboxImage').src=b.dataset.photo; $('#lightboxCaption').textContent=b.dataset.caption||'A little memory ♡'; $('#lightbox').classList.add('open'); document.body.classList.add('modal-open'); }
  function closeLightbox(){ $('#lightbox').classList.remove('open'); if(!$('.modal.open'))document.body.classList.remove('modal-open'); }
  photoButtons.forEach((b,i)=>b.addEventListener('click',()=>showPhoto(i)));
  $('#lightboxClose').addEventListener('click',closeLightbox); $('#lightboxPrev').addEventListener('click',()=>showPhoto(photoIndex-1)); $('#lightboxNext').addEventListener('click',()=>showPhoto(photoIndex+1));
  $('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox();});
  document.addEventListener('keydown',e=>{if($('#lightbox').classList.contains('open')&&e.key==='ArrowRight')showPhoto(photoIndex+1);if($('#lightbox').classList.contains('open')&&e.key==='ArrowLeft')showPhoto(photoIndex-1);});

  function launchConfetti(n=55, quick=false){
    const layer=$('#confettiLayer'); const colors=['#f16eaa','#ffb8d5','#d3a1df','#fff1a8','#e65f99','#bba1ed','#f6d7e7'];
    for(let i=0;i<n;i++){const p=document.createElement('i');p.className='confetti-piece'+(Math.random()>.65?' round':'');p.style.left=(Math.random()*100)+'%';p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDelay=(Math.random()*.8)+'s';p.style.animationDuration=(quick ? 1.35+Math.random()*1.15 : 2.5+Math.random()*2)+'s';p.style.setProperty('--drift',((Math.random()-.5)*260)+'px');layer.appendChild(p);setTimeout(()=>p.remove(),quick?3100:5200);}
  }
  $('#finalConfetti').addEventListener('click',()=>{launchConfetti(130);$('#finalConfetti').innerHTML='Your wish is on its way ♡ <span>يا رب تتحقق</span>';});


  // Birthday wish jar: twenty bilingual wishes, revealed one by one.
  const birthdayWishes = [
    ['May you feel proud of how far you have come.','يا رب تبصي وراكي وتبقي فخورة بكل خطوة وصلتك لحد هنا.'],
    ['May your hard work open beautiful doors.','يا رب تعبك يفتحلك أبواب حلوة، وتشوفي نتيجة كل مجهود بتعمليه.'],
    ['May peace find you even on busy days.','يا رب راحة البال تفضل معاكي حتى في الأيام المليانة ضغط.'],
    ['May the right people always find their way to you.','يا رب تفضلي محاطة بناس صادقة، وجودهم يطمن قلبك ويفرحك.'],
    ['May you have a hundred little reasons to smile.','يا رب كل يوم يكون فيه سبب صغير يخليكي تبتسمي من قلبك.'],
    ['May the dreams you whisper become real memories.','يا رب الأحلام اللي بتتمنيها بينك وبين نفسك تتحول لحاجات حقيقية.'],
    ['May you never forget how much you are capable of.','يا رب عمرك ما تنسي إنك قوية وقادرة توصلي لحاجات أكبر مما تتخيلي.'],
    ['May good news arrive when you need it most.','يا رب الأخبار الحلوة تيجي في الوقت اللي قلبك يكون محتاجها فيه.'],
    ['May your next chapter surprise you in the sweetest ways.','يا رب سنتك الجديدة تفاجئك بحاجات أجمل من اللي كنتِ متخيلاها.'],
    ['May laughter become a regular part of your days.','يا رب الضحكة تبقى صاحبتك، والفرحة تلاقي طريقها ليكي دايمًا.'],
    ['May you feel confident in your own timing.','يا رب تثقي في توقيتك، وتعرفي إن كل حاجة حلوة ليها وقتها.'],
    ['May your friendships grow deeper and your memories brighter.','يا رب صداقاتك تكبر وتبقى أصدق، وذكرياتك تزيد جمال سنة ورا سنة.'],
    ['May every challenge teach you how strong you are.','يا رب كل صعوبة تعدّي عليكي تسيبك أقوى وأهدى وأقرب لنفسك.'],
    ['May you find beauty in the ordinary moments.','يا رب تلاقي الجمال حتى في التفاصيل الصغيرة والأيام العادية.'],
    ['May you always make room for things that make you happy.','يا رب تفضلي تدي لنفسك وقت للحاجات اللي بتحبيها وبتريح قلبك.'],
    ['May every prayer you carry find its best answer.','يا رب كل دعوة شايلة أملها جواكي ترجعلك بأحسن إجابة.'],
    ['May new places and new adventures find you.','يا رب السنة دي تشوفي أماكن جديدة وتعيشي مغامرات تحكيها بابتسامة.'],
    ['May you be gentle with yourself while you grow.','يا رب تكوني حنينة على نفسك وإنتِ بتتعلمي وبتكبري وبتحققي أحلامك.'],
    ['May your efforts turn into moments worth celebrating.','يا رب كل مجهود تتعبيه يتحول لنجاح تفرحي بيه وتحتفلي بنفسك عشانه.'],
    ['May twenty be the start of a truly beautiful story.','يا رب سنة العشرين تكون بداية حكاية جميلة مليانة خير وفرحة وتوفيق.']
  ];
  let wishIndex = 1;
  function drawBirthdayWish() {
    const card = $('#wishJarMessage');
    const text = $('#wishJarText');
    const arabic = $('#wishJarArabic');
    const number = $('#wishJarNumber');
    if (!card || !text || !arabic || !number) return;
    card.classList.remove('is-changing');
    void card.offsetWidth;
    card.classList.add('is-changing');
    const wish = birthdayWishes[wishIndex % birthdayWishes.length];
    number.textContent = `WISH ${String(wishIndex + 1).padStart(2,'0')} · 20`;
    text.textContent = wish[0];
    arabic.textContent = wish[1];
    wishIndex = (wishIndex + 1) % birthdayWishes.length;
    const jar = $('#wishJarButton');
    if (jar) { jar.classList.remove('wish-picked'); void jar.offsetWidth; jar.classList.add('wish-picked'); }
    launchConfetti(12, true);
  }
  const drawWishButton = $('#drawWish');
  const wishJarButton = $('#wishJarButton');
  if (drawWishButton) drawWishButton.addEventListener('click', drawBirthdayWish);
  if (wishJarButton) wishJarButton.addEventListener('click', drawBirthdayWish);


  function updateCountdown(){
    const now=new Date(); let target=new Date(2026,10,11,0,0,0);
    if(now>target) target=new Date(2027,10,11,0,0,0);
    let d=Math.max(0,target-now); const days=Math.floor(d/86400000); d%=86400000; const hours=Math.floor(d/3600000); d%=3600000; const mins=Math.floor(d/60000); d%=60000; const secs=Math.floor(d/1000);
    $('#days').textContent=String(days).padStart(2,'0');$('#hours').textContent=String(hours).padStart(2,'0');$('#minutes').textContent=String(mins).padStart(2,'0');$('#seconds').textContent=String(secs).padStart(2,'0');
  }
  updateCountdown();setInterval(updateCountdown,1000);
  window.addEventListener('scroll',()=>{const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; $('#progressBar').style.width=(max>0?(h.scrollTop/max)*100:0)+'%'; const back=$('#backToTop'); if(back) back.classList.toggle('visible', h.scrollTop > 560);},{passive:true});
  const backToTop=$('#backToTop'); if(backToTop) backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  updateMusicUI();
})();
