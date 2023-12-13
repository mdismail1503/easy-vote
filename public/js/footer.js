/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".scroll-fade-in");
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  elements.forEach((element) => {
    observer.observe(element);
  });
});
