// NDT Academy — shared site behavior
document.addEventListener('DOMContentLoaded', () => {
  // mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav.main-nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));

  // scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
