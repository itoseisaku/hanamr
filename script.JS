'use strict';
// 公開前設定：正式な情報だけを入力してください。未入力の予約手段は無効表示になります。
const CLINIC = Object.freeze({
  siteUrl: '', // 例 https://正式なドメイン（末尾 / なし）
  telephone: '', // 正式な電話番号
  lineUrl: '', // 正式な https://lin.ee/... または https://line.me/... URL
  address: '', // 番地までの正式住所
  published: false // 正式情報・原稿確認後に true。全HTMLの robots メタも index,follow に変更
});
document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-nav');
function setMenu(open) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-label').textContent = open ? '閉じる' : 'メニュー';
  menu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  document.querySelector('main')?.toggleAttribute('inert', open);
  document.querySelector('.site-footer')?.toggleAttribute('inert', open);
  document.querySelector('.mobile-cta')?.toggleAttribute('inert', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  if (event.key === 'Tab' && toggle?.getAttribute('aria-expanded') === 'true') {
    const focusables = [toggle, ...menu.querySelectorAll('a[href],button:not([disabled])')];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const desktop = matchMedia('(min-width:851px)');
desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });
const compactHeader = () => header?.classList.toggle('compact', scrollY > 32);
addEventListener('scroll', compactHeader, { passive: true }); compactHeader();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

document.querySelectorAll('[data-booking="phone"]').forEach(el => {
  if (!CLINIC.telephone) return;
  const a = document.createElement('a'); a.className = el.className;
  a.href = 'tel:' + CLINIC.telephone.replace(/[^+\d]/g, '');
  a.innerHTML = el.innerHTML.replace('電話番号の確認待ち', '電話で予約'); el.replaceWith(a);
});
document.querySelectorAll('[data-booking="line"]').forEach(el => {
  if (!/^https:\/\/(lin\.ee|line\.me)\//.test(CLINIC.lineUrl)) return;
  const a = document.createElement('a'); a.className = el.className;
  a.href = CLINIC.lineUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.innerHTML = el.innerHTML.replace('LINE URLの確認待ち', 'LINEで予約'); el.replaceWith(a);
});
if (CLINIC.address) {
  document.querySelectorAll('[data-address]').forEach(el => { el.textContent = CLINIC.address; });
  document.querySelectorAll('iframe.map').forEach(el => { el.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(CLINIC.address) + '&output=embed'; });
  document.querySelectorAll('[data-map]').forEach(el => { el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CLINIC.address); });
  document.querySelectorAll('.map-caption').forEach(el => { el.textContent = '久留米はなまる整骨院へのアクセス'; });
}
if (CLINIC.siteUrl && /^https:\/\//.test(CLINIC.siteUrl)) {
  const current = location.pathname.split('/').pop() || 'index.HTML';
  const base = CLINIC.siteUrl.replace(/\/$/, '');
  const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = base + '/' + current; document.head.append(canonical);
  for (const [property, content] of [['og:url', canonical.href], ['og:image', base + '/images/hero.webp']]) {
    const meta = document.createElement('meta'); meta.setAttribute('property', property); meta.content = content; document.head.append(meta);
  }
}
if (CLINIC.published) document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index,follow,max-image-preview:large');
const copy = document.querySelector('[data-copy-message]');
copy?.addEventListener('click', async () => {
  const text = document.querySelector('#booking-message')?.textContent.trim();
  try { await navigator.clipboard.writeText(text); document.querySelector('#copy-status').textContent = '予約メッセージをコピーしました。'; }
  catch { document.querySelector('#copy-status').textContent = 'コピーできませんでした。下の文面を選択してコピーしてください。'; }
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || !/\.html$/i.test(destination.pathname) || (destination.pathname === location.pathname && destination.hash)) return;
  if (reducedMotion.matches) return;
  event.preventDefault(); setMenu(false); document.body.classList.add('is-leaving');
  setTimeout(() => { location.href = destination.href; }, 320);
});
addEventListener('pageshow', () => { document.body.classList.remove('is-leaving'); setMenu(false); });

/* IMAGE ASSET PROVENANCE
Tool: built-in image_gen (imagegen skill). Generated 2026-10-07.
images/hero.webp
Final prompt: Use case: photorealistic-natural. Asset type: premium Japanese osteopathic clinic website editorial hero photograph. A bright authentic small Japanese rehabilitation / osteopathic clinic, white linen treatment bed, warm oak furniture, large daylight window on right, pale blue curtain, a small green branch in a ceramic vase. A friendly Japanese male therapist around 35 in clean light blue scrubs listens attentively to a Japanese woman around 35 seated on the treatment bed wearing cream casual knit and navy trousers. Natural candid conversational moment, no treatment manipulation, not a hospital, no medical devices. Wide landscape 3:2 composition, people on center and right, sunlit curtain atmosphere, crisp but soft natural magazine photography, muted white and pale blue palette, realistic hands and faces, no text, no logo, no graphic overlay.

images/team.webp
Final prompt: Use case photorealistic-natural. Asset type wide editorial team photograph for a premium small Japanese osteopathic clinic website. Four fictional friendly Japanese staff, two men and two women ages late 20s to early 40s, standing naturally together in a bright modern small clinic with white walls, light oak reception and pale blue curtain, each wearing coordinated light blue scrubs and white trousers. Calm authentic smiles, editorial composition not stiff corporate advertisement, waist-up to knees, spacious daylight, realistically distinct faces, natural hands. Landscape 3:2, professional high quality photography. No text, no logos, no watermark.

images/interior.webp
Final prompt: Use case photorealistic-natural. Asset type editorial interior photograph for Japanese osteopathic clinic. Wide 3:2 landscape interior of a small inviting clean modern Japanese osteopathic rehabilitation practice. White linen treatment bed foreground, pale blue linen privacy curtains, a light oak reception desk in background, large windows with sheer white curtains, ceramic vase and green branches, natural daylight from the right, slightly warm wood and soft pale blue accents. No people. No hospital machines, no signage, no text, no logos, no watermark, realistic architectural magazine photograph, polished and calm.

Official LINE icon: https://www.line.me/ja/logo
Background asset: https://background-patterns.co/templates/subtle-wavy-line-pattern-with-gentle-flow
Design reference: https://design.digital.go.jp/dads/
*/
