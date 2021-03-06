if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((registration) => {
      console.log("SW Registered!");
    })
    .catch((error) => {
      console.log("SW Registration Failed!\n" + error);
    });
} else {
  console.log("Application not supported");
}
