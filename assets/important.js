/* adding dark mode toggle functionality*/

// check for saved 'darkMode' in localStorage
let darkMode = localStorage.getItem("darkMode");

// selecting the darkModeTogglers
let darkModeToggler = document.querySelector(".darkmode-toggler");

// selecting the svgs
let darkModeTogglerSvgs = document.querySelectorAll(".darkmode-toggler svg");

// function to enable the dark mode
const enableDarkMode = () => {
  // add the class to the body
  document.body.classList.add("darkmode");
  // update darkMode in localStorage
  localStorage.setItem("darkMode", "true");
};

// function to disable the dark mode
const disableDarkMode = () => {
  // remove the class from the body
  document.body.classList.remove("darkmode");
  // update darkMode in localStorage
  localStorage.setItem("darkMode", "false");
};

// If the user already visited and enabled darkMode => start things off with it on

if (darkMode === "true") {
  darkModeTogglerSvgs[0].style.display = "block";
  darkModeTogglerSvgs[1].style.display = "none";
  enableDarkMode();
} else {
  darkModeTogglerSvgs[0].style.display = "none";
  darkModeTogglerSvgs[1].style.display = "block";
  disableDarkMode();
}

// When someone clicks the button
darkModeToggler.addEventListener("click", () => {
  // get their darkMode setting
  darkMode = localStorage.getItem("darkMode");

  if (darkMode === "false") {
    // if dark mode is currently enabled, disable it

    darkModeTogglerSvgs[0].style.display = "block";
    darkModeTogglerSvgs[1].style.display = "none";
    enableDarkMode();
  } else {
    // if dark mode is currently disabled, enable it

    darkModeTogglerSvgs[0].style.display = "none";
    darkModeTogglerSvgs[1].style.display = "block";
    disableDarkMode();
  }
});

/* adding responsive navigation functionality */

// selecting the parent nav element
const nav = document.querySelector("nav");
// selecting the hamburger
const hamburger = document.querySelector(".hamburger");
// selecting the ul which is the navbar
const navbar = document.querySelector(".navbar");
// selecting the actual navlinks (li items) which are inside the navbar(ul)
const navLinks = document.querySelectorAll(".navbar li");

// listening for click event on hamburger to toggle open and close the nav menu
hamburger.addEventListener("click", () => {
  if (!nav.style.zIndex || nav.style.zIndex == "-1") {
    nav.style.zIndex = "10";
  } else {
    nav.style.zIndex = "-1";
  }
  navbar.classList.toggle("nav-open");
  let delay = 0.3;
  navLinks.forEach((navlink) => {
    if (navlink.style.animation) navlink.style.animation = "";
    else navlink.style.animation = `fade-in .3s ${delay}s ease-in-out forwards`;
    delay += 0.2;
  });
});
