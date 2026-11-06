// Small progressive enhancements. The pages read fine without this file.
(function () {
  // phone menu: the hamburger button of the home page header opens a panel with the same links
  var btn = document.getElementById('menu-open');
  var drawer = document.getElementById('m-drawer');
  if (btn && drawer) {
    var close = function () { drawer.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { close(); btn.focus(); } });
  }

  // reading progress bar
  var bar = document.querySelector('.progress');
  if (bar) {
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // highlight the section being read in the side contents
  var links = document.querySelectorAll('.side .toc a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('on'); });
          map[en.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-90px 0px -65% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
})();
